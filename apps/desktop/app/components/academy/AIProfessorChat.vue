<script setup lang="ts">
import { Bot, ChevronRight, Loader2, RefreshCw, Router, Send, Sparkles, Terminal, User, Zap } from 'lucide-vue-next'
import { runClaude } from '~/composables/useClaudeShell'
import { runCodexExec } from '~/composables/useCodexShell'
import { runOpenRouterChat } from '~/composables/useOpenRouterAI'
import { useAcademyStore } from '~/stores/academy'
import type { AcademyAIModel, AcademyChatMessage, AcademyChatQuiz } from '~/stores/academy'
import type { Lesson } from '~/data/curriculum'

const props = defineProps<{
  lesson: Lesson
  lessonCompleted: boolean
}>()

const emit = defineEmits<{
  markComplete: []
}>()

interface ChatMessage {
  id: number
  role: 'professor' | 'student'
  text: string
  streaming?: boolean
  quiz?: ParsedQuiz | null
  createdAt?: string
  model?: Exclude<AcademyAIModel, null>
}

type ParsedQuiz = AcademyChatQuiz

const academy = useAcademyStore()
const app = useAppStore()
const projects = useProjectsStore()

// ── Session gate ──────────────────────────────────────────────────────────
const sessionStarted = ref(false)
// Pre-fill from stored preference, default to claude
const pendingModel = ref<AcademyAIModel>(academy.aiModel ?? 'claude')

const modelOptions: { id: AcademyAIModel; label: string; sublabel: string; note?: string; color: string; bg: string; border: string; icon: any }[] = [
  {
    id: 'claude',
    label: 'Claude',
    sublabel: 'Anthropic Claude Code',
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    icon: Sparkles,
  },
  {
    id: 'codex',
    label: 'Codex',
    sublabel: 'OpenAI Codex CLI',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    icon: Zap,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    sublabel: 'Configured OpenRouter model',
    note: app.openRouter.enabled ? app.openRouter.model : 'Configure API key in AI Models',
    color: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    icon: Router,
  },
]

async function beginSession() {
  // Save the model selection to the store
  await academy.setSetup(academy.mode ?? 'ai-assisted', pendingModel.value)
  sessionStarted.value = true
  await nextTick()
  if (!messages.value.length) await startSession()
}

// ── Chat state ────────────────────────────────────────────────────────────
const messages = ref<ChatMessage[]>([])
const studentInput = ref('')
const isStreaming = ref(false)
const chatEl = ref<HTMLElement | null>(null)
let nextId = 1

// ── WSL Practice Terminal ─────────────────────────────────────────────────
const labTerminalVisible = ref(false)
const labSuggestedCommand = ref('')

const wslAcademyDistro = computed(() => {
  const profile = app.wslProfiles.find(p => p.id === 'academy')
  return profile?.distro ?? ''
})

function activeModel(): Exclude<AcademyAIModel, null> {
  return academy.aiModel ?? 'claude'
}

function restoreSession() {
  const stored = academy.getChatSession(props.lesson.id)
  messages.value = stored.map(message => ({
    id: message.id,
    role: message.role,
    text: message.text,
    quiz: message.quiz ?? null,
    createdAt: message.createdAt,
    model: message.model,
  }))
  nextId = Math.max(0, ...messages.value.map(message => message.id)) + 1
  sessionStarted.value = messages.value.length > 0
  pendingModel.value = academy.aiModel ?? 'claude'
  void nextTick().then(scrollToBottom)
}

function serializableMessages(): AcademyChatMessage[] {
  return messages.value
    .filter(message => message.text.trim() || message.quiz)
    .map(message => ({
      id: message.id,
      role: message.role,
      text: message.text,
      createdAt: message.createdAt ?? new Date().toISOString(),
      model: message.model ?? activeModel(),
      quiz: message.quiz ?? null,
    }))
}

async function persistMessages() {
  await academy.setChatSession(props.lesson.id, serializableMessages())
}

// ── Quiz parsing ──────────────────────────────────────────────────────────
function parseQuiz(text: string): { cleanText: string; quiz: ParsedQuiz | null; readyForNext: boolean; labSpawn: boolean; labCmd: string | null } {
  const normalized = text.replace(/\r\n/g, '\n')
  const readyForNext = /^\s*ASSESSMENT\s*:\s*READY\s*$/im.test(normalized)

  // Lab terminal signals
  const labCmdMatch = normalized.match(/^\s*LAB:CMD\s+(.+)$/im)
  const labSpawn = !!(normalized.match(/^\s*LAB:SPAWN\s*$/im) || labCmdMatch)
  const labCmd = labCmdMatch ? (labCmdMatch[1] ?? '').trim() : null

  const withoutSignals = normalized
    .replace(/^\s*ASSESSMENT\s*:\s*READY\s*$/gim, '')
    .replace(/^\s*LAB:SPAWN\s*$/gim, '')
    .replace(/^\s*LAB:CMD\s+.+$/gim, '')
    .trim()

  const mcMatch = withoutSignals.match(/QUIZ:MC\s*\n([\s\S]*?)(?=\n\s*A\)\s+)([\s\S]*?)\n\s*ANSWER\s*:\s*([A-D])\b/i)
  if (mcMatch) {
    const question = (mcMatch[1] ?? '').trim()
    const optionLines = (mcMatch[2] ?? '').trim().split('\n').filter(line => /^[A-D]\)\s+/.test(line.trim()))
    const options = optionLines.map((line) => {
      const m = line.match(/^([A-D])\)\s*(.+)/)
      return m ? { letter: m[1] ?? '', text: (m[2] ?? '').trim() } : null
    }).filter((x): x is { letter: string; text: string } => x !== null)
    const cleanText = stripLeakedAnswer(withoutSignals.replace(mcMatch[0], '')).trim()
    return { cleanText, quiz: { type: 'mc', question, options, answered: false }, readyForNext, labSpawn, labCmd }
  }

  const textMatch = withoutSignals.match(/QUIZ:TEXT\s*\n([\s\S]+?)\/QUIZ/i)
  if (textMatch) {
    const question = (textMatch[1] ?? '').trim()
    const cleanText = stripLeakedAnswer(withoutSignals.replace(textMatch[0], '')).trim()
    return { cleanText, quiz: { type: 'text', question, answered: false, studentInput: '' }, readyForNext, labSpawn, labCmd }
  }

  const numMatch = withoutSignals.match(/QUIZ:NUMBER\s*\n([\s\S]+?)\/QUIZ/i)
  if (numMatch) {
    const question = (numMatch[1] ?? '').trim()
    const cleanText = stripLeakedAnswer(withoutSignals.replace(numMatch[0], '')).trim()
    return { cleanText, quiz: { type: 'number', question, answered: false, studentInput: '' }, readyForNext, labSpawn, labCmd }
  }

  return { cleanText: stripLeakedAnswer(withoutSignals), quiz: null, readyForNext, labSpawn, labCmd }
}

function stripLeakedAnswer(text: string): string {
  return text
    .replace(/^\s*ANSWER\s*:\s*[A-D]\s*$/gim, '')
    .replace(/^\s*ASSESSMENT\s*:\s*READY\s*$/gim, '')
    .trim()
}

function streamingProfessorText(text: string): string {
  const visible = stripLeakedAnswer(text.replace(/\r\n/g, '\n'))
  const quizIndex = visible.search(/\n?\s*QUIZ:(MC|TEXT|NUMBER)\b/i)
  if (quizIndex === -1) return visible
  const intro = visible.slice(0, quizIndex).trim()
  return intro ? `${intro}\n\nPreparing a question...` : 'Preparing a question...'
}

async function finalizeProfessorMessage(profMsg: ChatMessage, rawText: string) {
  const { cleanText, quiz, readyForNext, labSpawn, labCmd } = parseQuiz(rawText)
  profMsg.text = cleanText
  profMsg.quiz = quiz
  profMsg.streaming = false
  isStreaming.value = false
  await persistMessages()
  if (readyForNext && !props.lessonCompleted) {
    emit('markComplete')
  }
  // Spawn the WSL practice terminal if the professor requested it
  if (labSpawn) {
    labSuggestedCommand.value = labCmd ?? ''
    labTerminalVisible.value = true
  }
  await nextTick()
  scrollToBottom()
}

// ── Prompt building ───────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  const objectivesList = props.lesson.objectives.map(o => `- ${o}`).join('\n')
  const contentSummary = props.lesson.content.slice(0, 800) + (props.lesson.content.length > 800 ? '...' : '')

  return `You are Professor Vindicta, an expert cybersecurity instructor for a flexible, self-paced security bootcamp.
The student is currently studying "${props.lesson.title}".

Lesson objectives:
${objectivesList}

Lesson content excerpt:
${contentSummary}

Your teaching approach:
- Be encouraging, clear, and engaging. Use real-world analogies.
- Explain concepts step by step. Check understanding before moving on.
- Ask comprehension questions using the QUIZ format below.
- Give constructive feedback on student answers — praise correct reasoning, gently correct mistakes.
- Never expose the correct answer in visible text before the student answers.
- When the student demonstrates solid understanding of all objectives, end your response with this hidden control line on its own line: ASSESSMENT:READY
- Do not tell the student to mark the lesson complete. The app will unlock the next lesson after ASSESSMENT:READY.
- Keep each response concise (3-6 sentences + optional quiz). Do not dump everything at once.

QUIZ FORMAT (use when asking questions):
Multiple choice:
QUIZ:MC
[Your question here]
A) [option]
B) [option]
C) [option]
D) [option]
ANSWER:[correct letter]

The ANSWER line is for the app parser only. Do not repeat the answer key anywhere else.

Open text:
QUIZ:TEXT
[Your question here]
/QUIZ

PRACTICE TERMINAL (WSL academy sandbox):
The student has access to a live Linux sandbox. Use it sparingly — only when hands-on practice genuinely reinforces the concept.
Place one of these signals on its own line in your message:

LAB:SPAWN — Opens the practice terminal for free exploration.
LAB:CMD nmap --help — Opens the terminal and pre-fills the suggested command.

Use the terminal when: you want the student to observe a real command, explore a tool's help page, or practice a safe CLI operation.
Do NOT use for: quizzes, theory, or commands that scan external targets or modify system files.

Current date: ${new Date().toLocaleDateString()}
Be conversational and specific to today's lesson.`
}

function buildPrompt(userMessage: string): string {
  const priorMessages = messages.value.slice(0, -1)
  const history = priorMessages.slice(-14).map(m => {
    const prefix = m.role === 'professor' ? 'Professor' : 'Student'
    return `${prefix}: ${m.text}`
  }).join('\n\n')
  const memory = priorMessages.length
    ? priorMessages.map(m => `${m.role === 'professor' ? 'Professor' : 'Student'} (${m.model ?? 'saved'}): ${m.text}`).slice(-24).join('\n')
    : 'No previous lesson conversation yet.'

  return `${buildSystemPrompt()}

--- Persistent session memory ---
${memory}

--- Conversation so far ---
${history}

Student: ${userMessage}

Professor:`
}

// ── Message sending ───────────────────────────────────────────────────────
async function sendMessage(text: string) {
  if (!text.trim() || isStreaming.value) return

  messages.value.push({ id: nextId++, role: 'student', text: text.trim(), createdAt: new Date().toISOString(), model: activeModel() })
  void persistMessages()
  studentInput.value = ''
  await nextTick()
  scrollToBottom()

  const profMsg: ChatMessage = { id: nextId++, role: 'professor', text: '', streaming: true, quiz: null, createdAt: new Date().toISOString(), model: activeModel() }
  messages.value.push(profMsg)
  isStreaming.value = true

  let rawBuffer = ''
  const projectPath = projects.activeProject?.absolutePath ?? '.'

  try {
    if (activeModel() === 'openrouter') {
      const result = await runOpenRouterChat({
        apiKey: app.openRouter.apiKey,
        model: app.openRouter.model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...messages.value.slice(0, -2).slice(-18).map(message => ({
            role: message.role === 'professor' ? 'assistant' as const : 'user' as const,
            content: message.text,
          })),
          { role: 'user', content: text.trim() },
        ],
      })
      rawBuffer = result
      await finalizeProfessorMessage(profMsg, rawBuffer)
      return
    }

    if (activeModel() === 'codex') {
      const result = await runCodexExec({
        prompt: buildPrompt(text.trim()),
        projectPath,
        sandbox: 'read-only',
        reasoningEffort: 'medium',
      })
      rawBuffer = result.stdout || result.stderr
      await finalizeProfessorMessage(profMsg, rawBuffer || 'Codex finished without a readable professor response.')
      return
    }

    await runClaude({
      prompt: buildPrompt(text.trim()),
      projectPath,
      onLine(line: string) {
        try {
          const parsed = JSON.parse(line) as Record<string, unknown>
          const type = parsed?.type as string | undefined

          if (type === 'result') {
            const result = parsed.result
            if (typeof result === 'string' && result.trim()) {
              rawBuffer = result
              profMsg.text = streamingProfessorText(result)
            }
          }
          else if (type === 'assistant') {
            const content = (parsed as any)?.message?.content
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block?.type === 'text' && typeof block.text === 'string') {
                  rawBuffer += block.text
                  profMsg.text = streamingProfessorText(rawBuffer)
                }
              }
            }
          }
          else if (type === 'text' && typeof parsed.text === 'string') {
            rawBuffer += parsed.text as string
            profMsg.text = streamingProfessorText(rawBuffer)
          }
        }
        catch {
          if (line.trim() && !line.startsWith('{')) {
            rawBuffer += line
            profMsg.text = streamingProfessorText(rawBuffer)
          }
        }
        void nextTick().then(scrollToBottom)
      },
      onClose() {
        void finalizeProfessorMessage(profMsg, rawBuffer)
      },
      onError(err: string) {
        profMsg.text = `I'm having trouble connecting right now (${err}). Make sure Claude CLI is installed and logged in.`
        profMsg.streaming = false
        isStreaming.value = false
        void persistMessages()
      },
    })
  }
  catch (e: any) {
    profMsg.text = `Connection error: ${e?.message ?? 'Unknown error'}`
    profMsg.streaming = false
    isStreaming.value = false
    void persistMessages()
  }
}

// ── Session control ───────────────────────────────────────────────────────
async function startSession() {
  await sendMessage(`Hello Professor! I'm ready to learn about ${props.lesson.title}. Please introduce the topic and what I should focus on.`)
}

async function resetSession() {
  messages.value = []
  await academy.clearChatSession(props.lesson.id)
  sessionStarted.value = false
  pendingModel.value = academy.aiModel ?? 'claude'
}

// ── Quiz handlers ─────────────────────────────────────────────────────────
function answerMC(msg: ChatMessage, letter: string) {
  if (!msg.quiz || msg.quiz.answered) return
  msg.quiz.answered = true
  msg.quiz.selectedAnswer = letter
  void persistMessages()
  void sendMessage(`My answer is ${letter}) ${msg.quiz.options?.find(o => o.letter === letter)?.text ?? ''}`)
}

function submitTextAnswer(msg: ChatMessage) {
  if (!msg.quiz || msg.quiz.answered || !msg.quiz.studentInput?.trim()) return
  const answer = msg.quiz.studentInput.trim()
  msg.quiz.answered = true
  void persistMessages()
  void sendMessage(answer)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    void sendMessage(studentInput.value)
  }
}

function scrollToBottom() {
  if (chatEl.value) {
    chatEl.value.scrollTop = chatEl.value.scrollHeight
  }
}

// ── Text renderer ─────────────────────────────────────────────────────────
function renderText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  restoreSession()
})

watch(() => props.lesson.id, () => {
  restoreSession()
})
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden rounded-xl border border-indigo-500/20 bg-black/20">

    <!-- ── PRE-SESSION: Model selection ────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
      mode="out-in"
    >
      <div v-if="!sessionStarted" class="flex h-full flex-col items-center justify-center gap-5 p-5">
        <!-- Icon + title -->
        <div class="text-center space-y-1">
          <div class="mx-auto grid size-12 place-items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
            <Bot class="size-6 text-indigo-300" />
          </div>
          <p class="text-sm font-semibold text-[var(--text)]">Professor Vindicta</p>
          <p class="text-[11px] text-[var(--text-muted)]">
            AI tutor for <span class="text-[var(--text)]">{{ lesson.title }}</span>
          </p>
          <p v-if="messages.length" class="text-[10px] text-emerald-300/75">
            Saved session found. Continue with any model.
          </p>
        </div>

        <!-- Model picker -->
        <div class="w-full space-y-2">
          <p class="text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
            Choose AI model
          </p>
          <div class="space-y-2">
            <button
              v-for="m in modelOptions"
              :key="m.id ?? ''"
              class="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all"
              :class="pendingModel === m.id
                ? [m.border, m.bg]
                : 'border-[var(--border)] hover:border-white/10 hover:bg-white/[0.02]'"
              @click="pendingModel = m.id"
            >
              <!-- Radio dot -->
              <div
                class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors"
                :class="pendingModel === m.id
                  ? [m.border, m.bg]
                  : 'border-[var(--border)]'"
              >
                <div
                  v-if="pendingModel === m.id"
                  class="size-2 rounded-full"
                  :class="m.color.replace('text-', 'bg-')"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <component :is="m.icon" class="size-3.5 shrink-0" :class="m.color" />
                  <span class="text-xs font-semibold text-[var(--text)]">{{ m.label }}</span>
                  <span v-if="m.id === 'claude'" class="rounded-full border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">
                    Recommended
                  </span>
                </div>
                <p class="mt-0.5 text-[11px] text-[var(--text-faint)]">{{ m.sublabel }}</p>
                <p v-if="m.note" class="mt-0.5 text-[10px] text-amber-400/70 italic">{{ m.note }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Start button -->
        <button
          class="w-full rounded-xl bg-indigo-600/70 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          @click="beginSession"
        >
          Start Learning Session →
        </button>

        <p class="text-center text-[10px] text-[var(--text-faint)] leading-relaxed">
          The professor remembers this lesson's prior conversation, even if you switch models later.
        </p>
      </div>

      <!-- ── ACTIVE CHAT ─────────────────────────────────────────────────── -->
      <div v-else class="flex h-full flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex shrink-0 items-center gap-2.5 border-b border-indigo-500/15 px-4 py-2.5">
          <div class="grid size-7 shrink-0 place-items-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
            <Bot class="size-4 text-indigo-300" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-[var(--text)]">Professor Vindicta</p>
            <p class="text-[10px] text-[var(--text-faint)]">
              {{ academy.aiModel === 'codex' ? 'Codex' : academy.aiModel === 'openrouter' ? 'OpenRouter' : 'Claude' }} · saved memory
            </p>
          </div>
          <button
            class="flex size-6 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text-muted)]"
            title="Change model / reset session"
            @click="resetSession"
          >
            <RefreshCw class="size-3" />
          </button>
        </div>

        <!-- Messages -->
        <div ref="chatEl" class="flex-1 space-y-3 overflow-y-auto p-4 custom-scroll">
          <div v-if="messages.length === 0" class="flex h-full items-center justify-center">
            <Loader2 class="size-5 animate-spin text-indigo-400/50" />
          </div>

          <template v-for="msg in messages" :key="msg.id">
            <!-- Professor message -->
            <div v-if="msg.role === 'professor'" class="flex items-start gap-2">
              <div class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-indigo-500/20 bg-indigo-500/10">
                <Bot class="size-3.5 text-indigo-300" />
              </div>
              <div class="flex-1 min-w-0 space-y-2">
                <!-- Text -->
                <div
                  v-if="msg.text"
                  class="professor-bubble rounded-xl rounded-tl-none border border-indigo-500/15 bg-indigo-500/[0.08] px-3 py-2.5 text-xs leading-relaxed text-[var(--text-muted)]"
                  v-html="renderText(msg.text)"
                />
                <!-- Streaming indicator -->
                <div v-if="msg.streaming && !msg.text" class="flex items-center gap-1.5 px-1">
                  <span class="size-1 rounded-full bg-indigo-400 animate-bounce" style="animation-delay:0ms" />
                  <span class="size-1 rounded-full bg-indigo-400 animate-bounce" style="animation-delay:150ms" />
                  <span class="size-1 rounded-full bg-indigo-400 animate-bounce" style="animation-delay:300ms" />
                </div>

                <!-- Quiz: Multiple Choice -->
                <div
                  v-if="msg.quiz && msg.quiz.type === 'mc' && msg.quiz.options"
                  class="rounded-xl border border-indigo-500/20 bg-black/20 p-3 space-y-2"
                >
                  <p class="text-[11px] font-semibold text-[var(--text)]">{{ msg.quiz.question }}</p>
                  <div class="space-y-1.5">
                    <button
                      v-for="opt in msg.quiz.options"
                      :key="opt.letter"
                      class="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition-colors"
                      :class="[
                        msg.quiz.answered
                          ? (opt.letter === msg.quiz.selectedAnswer
                              ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200'
                              : 'border-[var(--border)] text-[var(--text-faint)] opacity-50')
                          : 'border-[var(--border)] hover:border-indigo-500/30 hover:bg-indigo-500/[0.06] text-[var(--text-muted)] cursor-pointer',
                      ]"
                      :disabled="msg.quiz.answered"
                      @click="answerMC(msg, opt.letter)"
                    >
                      <span class="grid size-5 shrink-0 place-items-center rounded border border-current text-[10px] font-bold">
                        {{ opt.letter }}
                      </span>
                      {{ opt.text }}
                    </button>
                  </div>
                </div>

                <!-- Quiz: Text / Number -->
                <div
                  v-if="msg.quiz && (msg.quiz.type === 'text' || msg.quiz.type === 'number') && !msg.quiz.answered"
                  class="rounded-xl border border-indigo-500/20 bg-black/20 p-3 space-y-2"
                >
                  <p class="text-[11px] font-semibold text-[var(--text)]">{{ msg.quiz.question }}</p>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="msg.quiz.studentInput"
                      :type="msg.quiz.type === 'number' ? 'number' : 'text'"
                      placeholder="Your answer…"
                      class="flex-1 rounded-lg border border-[var(--border)] bg-black/20 px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-faint)] outline-none focus:border-indigo-500/40"
                      @keydown.enter="submitTextAnswer(msg)"
                    >
                    <button
                      class="flex items-center gap-1 rounded-lg bg-indigo-600/20 px-2.5 py-1.5 text-[11px] text-indigo-300 transition-colors hover:bg-indigo-600/30"
                      @click="submitTextAnswer(msg)"
                    >
                      <ChevronRight class="size-3" />
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student message -->
            <div v-else class="flex items-start gap-2 flex-row-reverse">
              <div class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-white/[0.04]">
                <User class="size-3.5 text-[var(--text-faint)]" />
              </div>
              <div class="max-w-[85%] rounded-xl rounded-tr-none border border-[var(--border)] bg-white/[0.04] px-3 py-2 text-xs text-[var(--text-muted)]">
                {{ msg.text }}
              </div>
            </div>
          </template>

          <div v-if="!lessonCompleted && messages.length > 4" class="flex justify-center pt-1">
            <p class="rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-3 py-1.5 text-[11px] text-indigo-200/80">
              Professor Vindicta will unlock the next lesson when you are ready.
            </p>
          </div>
        </div>

        <!-- Input -->
        <div class="shrink-0 border-t border-indigo-500/15 p-3">
          <div class="flex items-end gap-2 rounded-xl border border-indigo-500/20 bg-black/20 px-3 py-2 focus-within:border-indigo-500/40">
            <textarea
              v-model="studentInput"
              rows="1"
              placeholder="Ask a question or respond…"
              class="flex-1 resize-none bg-transparent text-[12px] text-[var(--text)] placeholder-[var(--text-faint)] outline-none"
              style="max-height: 80px; overflow-y: auto;"
              :disabled="isStreaming"
              @keydown="onKeyDown"
              @input="(e: Event) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = t.scrollHeight + 'px'
              }"
            />
            <button
              :disabled="!studentInput.trim() || isStreaming"
              class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-300 transition-colors hover:bg-indigo-600/30 disabled:opacity-40"
              @click="sendMessage(studentInput)"
            >
              <Loader2 v-if="isStreaming" class="size-3.5 animate-spin" />
              <Send v-else class="size-3.5" />
            </button>
            <!-- Manual terminal toggle -->
            <button
              class="flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors"
              :class="labTerminalVisible
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'text-[var(--text-faint)] hover:bg-white/[0.06] hover:text-[var(--text-muted)]'"
              title="Toggle practice terminal"
              @click="labTerminalVisible = !labTerminalVisible"
            >
              <Terminal class="size-3.5" />
            </button>
          </div>
          <p class="mt-1 px-1 text-[10px] text-[var(--text-faint)]">Enter to send · Shift+Enter for new line · <span class="text-emerald-400/60">⬛ terminal</span></p>
        </div>

        <!-- WSL Practice Terminal (professor-triggered or manually opened) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1 max-h-0"
          enter-to-class="opacity-100 translate-y-0 max-h-96"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 max-h-96"
          leave-to-class="opacity-0 -translate-y-1 max-h-0"
        >
          <div v-if="labTerminalVisible" class="shrink-0 overflow-hidden border-t border-emerald-500/15 p-3">
            <AcademyWSLTerminal
              :distro="wslAcademyDistro"
              :suggested-command="labSuggestedCommand"
              @close="labTerminalVisible = false"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.professor-bubble :deep(.inline-code) {
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  padding: 1px 4px;
  font-family: ui-monospace, monospace;
  font-size: 10.5px;
}

.professor-bubble :deep(strong) {
  color: var(--text);
  font-weight: 600;
}
</style>
