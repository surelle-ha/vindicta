<script setup lang="ts">
import { Send, Trash2, ChevronDown, ChevronRight, Wrench, Loader2, AlertCircle, Bot, CheckSquare } from 'lucide-vue-next'
import { ticketKey } from '~/utils/ticket'
import { runClaude } from '~/composables/useClaudeShell'

const props = defineProps<{
  projectPath: string
}>()

const kanban = useKanbanStore()
const projects = useProjectsStore()
const { notify } = useNotifications()

const projectCode = computed(() => projects.activeProject?.code ?? '')

interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  result?: string
  expanded: boolean
}

interface ContentBlock {
  type: 'text' | 'tool'
  text?: string
  tool?: ToolCall
}

interface AIAction {
  action: 'move' | 'comment' | 'create'
  ticket?: string
  status?: string
  text?: string
  title?: string
  type?: string
  priority?: string
  description?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  blocks: ContentBlock[]
  streaming: boolean
  error?: string
  actions?: AIAction[]
  actionsApplied?: boolean
}

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const isRunning = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const applyingActions = ref(false)

let stdoutBuf = ''
let activeMsg: ChatMessage | null = null

function scrollBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

function getOrCreateActive(): ChatMessage {
  if (!activeMsg) {
    const msg: ChatMessage = {
      id: `asst_${Date.now()}`,
      role: 'assistant',
      blocks: [],
      streaming: true,
    }
    messages.value.push(msg)
    activeMsg = msg
  }
  return activeMsg
}

function appendText(text: string) {
  const msg = getOrCreateActive()
  const last = msg.blocks[msg.blocks.length - 1]
  if (last?.type === 'text') {
    last.text = (last.text ?? '') + text
  }
  else {
    msg.blocks.push({ type: 'text', text })
  }
}

function processLine(line: string) {
  if (!line.trim()) return
  let evt: any
  try { evt = JSON.parse(line) }
  catch { return }

  if (evt.type === 'assistant') {
    const content: any[] = evt.message?.content ?? []
    for (const block of content) {
      if (block.type === 'text' && block.text) {
        appendText(block.text)
      }
      else if (block.type === 'tool_use') {
        const msg = getOrCreateActive()
        msg.blocks.push({
          type: 'tool',
          tool: {
            id: block.id,
            name: block.name,
            input: block.input ?? {},
            expanded: false,
          },
        })
      }
    }
    scrollBottom()
  }
  else if (evt.type === 'tool') {
    if (!activeMsg) return
    const id = evt.tool_use_id
    for (const block of activeMsg.blocks) {
      if (block.type === 'tool' && block.tool && block.tool.id === id) {
        const tc = block.tool
        const c = evt.content
        if (typeof c === 'string') {
          tc.result = c
        }
        else if (Array.isArray(c)) {
          tc.result = c.map((x: any) => x.text ?? x.content ?? JSON.stringify(x)).join('\n')
        }
        else if (c?.content) {
          tc.result = typeof c.content === 'string' ? c.content : JSON.stringify(c.content, null, 2)
        }
        else {
          tc.result = JSON.stringify(c, null, 2)
        }
        break
      }
    }
    scrollBottom()
  }
  else if (evt.type === 'result') {
    if (activeMsg) {
      activeMsg.streaming = false
      detectActions(activeMsg)
      activeMsg = null
    }
    isRunning.value = false
    scrollBottom()
  }
}

function detectActions(msg: ChatMessage) {
  const fullText = msg.blocks.filter(b => b.type === 'text').map(b => b.text ?? '').join('')
  const match = fullText.match(/```json:actions\s*([\s\S]*?)```/)
  if (!match) return
  try {
    const actions: AIAction[] = JSON.parse(match[1] ?? '[]')
    if (actions.length) msg.actions = actions
  }
  catch { /* ignore invalid JSON */ }
}

function buildSystemContext(): string {
  const code = projectCode.value
  const ticketList = kanban.tickets
    .filter(t => t.status !== 'cancelled')
    .map((t) => {
      const git = t.gitControl?.enabled
        ? ` git:${t.gitControl.branch || 'AI-decides'} commit:${t.gitControl.autoCommit ? 'auto' : 'manual'} push:${t.gitControl.autoPush ? 'auto' : 'manual'}`
        : ''
      return `${ticketKey(code, t.number)} [${t.status}] "${t.title}"${git}`
    })
    .join(', ')

  return `[System: You are an AI agent managing project "${projects.activeProject?.name ?? 'this project'}" (code: ${code}). You can execute ticket operations by outputting a fenced code block tagged \`\`\`json:actions containing a JSON array like: [{"action":"move","ticket":"${code}-3","status":"in_review"},{"action":"comment","ticket":"${code}-3","text":"..."},{"action":"create","title":"...","type":"feature","priority":"medium","description":"..."}]. Available ticket types: feature|bug|fix|chore|spike. Available statuses: backlog|todo|in_progress|in_review|done|cancelled. Priorities: low|medium|high|critical. Current tickets: ${ticketList || 'none'}]`
}

async function applyActions(msg: ChatMessage) {
  if (!msg.actions?.length || msg.actionsApplied) return
  applyingActions.value = true
  let applied = 0
  let commented = 0

  try {
    for (const action of msg.actions) {
      if (action.action === 'move' && action.ticket) {
        const ticket = findTicketByKey(action.ticket)
        if (ticket && action.status) {
          await kanban.moveTicket(ticket.id, action.status as any)
          applied++
        }
      }
      else if (action.action === 'comment' && action.ticket && action.text) {
        const ticket = findTicketByKey(action.ticket)
        if (ticket) {
          await kanban.addComment(ticket.id, action.text, 'AI Agent', true, null)
          commented++
          applied++
        }
      }
      else if (action.action === 'create' && action.title) {
        await kanban.createTicket({
          title: action.title,
          type: (action.type as any) ?? 'feature',
          priority: (action.priority as any) ?? 'medium',
          description: action.description ?? '',
          status: 'backlog',
        }, 'AI Agent')
        applied++
      }
    }

    msg.actionsApplied = true
    notify(`AI Agent applied ${applied} change${applied !== 1 ? 's' : ''}`, 'success')
    if (commented > 0) {
      notify(`AI Agent commented on ${commented} ticket${commented !== 1 ? 's' : ''}`, 'info')
    }
  }
  finally {
    applyingActions.value = false
  }
}

function findTicketByKey(key: string) {
  const code = projectCode.value
  const num = parseInt(key.replace(`${code}-`, ''), 10)
  return kanban.tickets.find(t => t.number === num)
}

async function send() {
  const text = inputText.value.trim()
  if (!text || isRunning.value) return

  inputText.value = ''
  isRunning.value = true
  stdoutBuf = ''
  activeMsg = null

  messages.value.push({
    id: `user_${Date.now()}`,
    role: 'user',
    blocks: [{ type: 'text', text }],
    streaming: false,
  })
  scrollBottom()

  getOrCreateActive()

  const systemContext = buildSystemContext()
  const fullPrompt = `${systemContext}\n\n${text}`

  await runClaude({
    prompt: fullPrompt,
    projectPath: props.projectPath,
    onLine(line) {
      processLine(line)
    },
    onClose(stderrBuf) {
      const m = activeMsg as ChatMessage | null
      if (m) {
        m.streaming = false
        if (!m.blocks.length && stderrBuf.trim()) {
          m.error = stderrBuf.trim()
        }
        else {
          detectActions(m)
        }
        activeMsg = null
      }
      isRunning.value = false
      scrollBottom()
    },
    onError(err) {
      const failedMsg = activeMsg as ChatMessage | null
      if (failedMsg) {
        failedMsg.error = err
        failedMsg.streaming = false
        failedMsg.blocks = []
      }
      activeMsg = null
      isRunning.value = false
    },
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function autoResize(e: Event) {
  const t = e.target as HTMLTextAreaElement
  t.style.height = 'auto'
  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
}

function toggleTool(tool: ToolCall) {
  tool.expanded = !tool.expanded
}

function formatToolInput(input: Record<string, unknown>): string {
  const entries = Object.entries(input)
  if (!entries.length) return ''
  const first = entries[0]
  if (!first) return ''
  const [k, v] = first
  const vs = typeof v === 'string' ? v : JSON.stringify(v)
  const truncated = vs.length > 64 ? vs.slice(0, 64) + '…' : vs
  return entries.length > 1 ? `${k}: ${truncated} +${entries.length - 1}` : `${k}: ${truncated}`
}

function clearChat() {
  if (isRunning.value) return
  messages.value = []
  activeMsg = null
  stdoutBuf = ''
}
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-card)] shrink-0">
      <Bot class="size-3.5 text-violet-400" />
      <span class="text-xs text-[var(--text-muted)]">{{ isRunning ? 'Running…' : 'AI Agent' }}</span>
      <span
        class="size-1.5 rounded-full transition-colors ml-0.5"
        :class="isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'"
      />
      <span class="flex-1" />
      <button
        v-if="messages.length && !isRunning"
        class="flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
        @click="clearChat"
      >
        <Trash2 class="size-3" />
        Clear
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 min-h-0 overflow-y-auto custom-scroll p-4 space-y-4">
      <!-- Empty state -->
      <div v-if="!messages.length" class="flex flex-col items-center justify-center h-full text-center gap-3 select-none">
        <div class="size-10 rounded-full bg-violet-600/15 flex items-center justify-center">
          <Bot class="size-5 text-violet-400" />
        </div>
        <div>
          <p class="text-sm font-medium text-[var(--text)]">AI Agent</p>
          <p class="text-xs text-[var(--text-muted)] mt-1">Ask the AI to manage tickets, analyze your project, or answer questions</p>
        </div>
      </div>

      <!-- Message list -->
      <template v-for="msg in messages" :key="msg.id">
        <!-- User message -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[80%] px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/20 text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed">
            {{ msg.blocks[0]?.text ?? '' }}
          </div>
        </div>

        <!-- Assistant message -->
        <div v-else class="flex flex-col gap-2">
          <!-- Error state -->
          <div v-if="msg.error" class="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            <AlertCircle class="size-3.5 mt-0.5 shrink-0" />
            <span class="whitespace-pre-wrap">{{ msg.error }}</span>
          </div>

          <!-- Content blocks -->
          <template v-for="(block, i) in msg.blocks" :key="i">
            <div
              v-if="block.type === 'text' && (block.text || msg.streaming)"
              class="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap"
            >
              {{ block.text }}
              <span
                v-if="msg.streaming && i === msg.blocks.length - 1"
                class="inline-block size-1.5 rounded-full bg-[var(--text-muted)] align-middle ml-0.5 animate-pulse"
              />
            </div>

            <!-- Tool call block -->
            <div
              v-else-if="block.type === 'tool' && block.tool"
              class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden text-xs"
            >
              <button
                class="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] transition-colors text-left"
                @click="block.tool && toggleTool(block.tool)"
              >
                <Wrench class="size-3 shrink-0 text-violet-400" />
                <span class="font-mono text-violet-300 shrink-0">{{ block.tool.name }}</span>
                <span class="text-[var(--text-faint)] truncate flex-1 text-[11px]">{{ formatToolInput(block.tool.input) }}</span>
                <span
                  v-if="block.tool.result !== undefined"
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0"
                >done</span>
                <span
                  v-else-if="msg.streaming"
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 shrink-0 animate-pulse"
                >running</span>
                <component
                  :is="block.tool.expanded ? ChevronDown : ChevronRight"
                  class="size-3 text-[var(--text-faint)] shrink-0"
                />
              </button>
              <div v-if="block.tool.expanded" class="border-t border-[var(--border)]">
                <div class="px-3 py-2 bg-black/20">
                  <p class="text-[10px] text-[var(--text-faint)] mb-1 uppercase tracking-wider">Input</p>
                  <pre class="text-[11px] text-[var(--text-muted)] overflow-x-auto custom-scroll">{{ JSON.stringify(block.tool.input, null, 2) }}</pre>
                </div>
                <div v-if="block.tool.result !== undefined" class="px-3 py-2 border-t border-[var(--border)]">
                  <p class="text-[10px] text-[var(--text-faint)] mb-1 uppercase tracking-wider">Result</p>
                  <pre class="text-[11px] text-[var(--text-muted)] overflow-x-auto custom-scroll max-h-40">{{ block.tool.result }}</pre>
                </div>
              </div>
            </div>
          </template>

          <!-- Thinking dots -->
          <div v-if="msg.streaming && !msg.blocks.length && !msg.error" class="flex items-center gap-1.5 px-1 py-1">
            <span class="size-1.5 rounded-full bg-[var(--text-faint)] animate-bounce" style="animation-delay: 0ms" />
            <span class="size-1.5 rounded-full bg-[var(--text-faint)] animate-bounce" style="animation-delay: 150ms" />
            <span class="size-1.5 rounded-full bg-[var(--text-faint)] animate-bounce" style="animation-delay: 300ms" />
          </div>

          <!-- Apply actions button -->
          <div v-if="msg.actions?.length && !msg.streaming" class="flex items-center gap-2 mt-1">
            <button
              v-if="!msg.actionsApplied"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              :disabled="applyingActions"
              @click="applyActions(msg)"
            >
              <CheckSquare class="size-3.5" />
              Apply {{ msg.actions.length }} change{{ msg.actions.length !== 1 ? 's' : '' }}
            </button>
            <span v-else class="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckSquare class="size-3" />
              Changes applied
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- Input bar -->
    <div class="border-t border-[var(--border)] bg-[var(--bg-card)] p-3 shrink-0">
      <div class="flex gap-2 items-end">
        <textarea
          v-model="inputText"
          placeholder="Ask the AI agent…"
          rows="1"
          class="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] resize-none min-h-[32px] max-h-32 overflow-y-auto custom-scroll outline-none focus:border-indigo-500/50 transition-colors"
          :disabled="isRunning"
          @keydown="handleKeydown"
          @input="autoResize"
        />
        <button
          class="size-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
          :class="isRunning || !inputText.trim()
            ? 'bg-white/[0.04] text-[var(--text-faint)] cursor-not-allowed'
            : 'bg-violet-600 hover:bg-violet-500 text-white'"
          :disabled="isRunning || !inputText.trim()"
          @click="send"
        >
          <Loader2 v-if="isRunning" class="size-3.5 animate-spin" />
          <Send v-else class="size-3.5" />
        </button>
      </div>
      <p class="text-[10px] text-[var(--text-faint)] mt-1.5">Enter to send · Shift+Enter for newline</p>
    </div>
  </div>
</template>
