<script setup lang="ts">
import { Bot, ChevronRight, Loader2, RefreshCw, Send, Sparkles, User, Zap } from 'lucide-vue-next'
import { runClaude } from '~/composables/useClaudeShell'
import { useAcademyStore } from '~/stores/academy'
import type { AcademyAIModel } from '~/stores/academy'
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
}

interface ParsedQuiz {
  type: 'mc' | 'text' | 'number'
  question: string
  options?: { letter: string; text: string }[]
  answered?: boolean
  selectedAnswer?: string
  studentInput?: string
}

const academy = useAcademyStore()
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
    note: 'Code analysis mode — professor uses Claude',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    icon: Zap,
  },
]

async function beginSession() {
  // Save the model selection to the store
  await academy.setSetup(academy.mode ?? 'ai-assisted', pendingModel.value)
  sessionStarted.value = true
  await nextTick()
  await startSession()
}

// ── Chat state ────────────────────────────────────────────────────────────
const messages = ref<ChatMessage[]>([])
const studentInput = ref('')
const isStreaming = ref(false)
const chatEl = ref<HTMLElement | null>(null)
let nextId = 1

// ── Quiz parsing ──────────────────────────────────────────────────────────
function parseQuiz(text: string): { cleanText: string; quiz: ParsedQuiz | null } {
  const mcMatch = text.match(/QUIZ:MC\n(.*)\n((?:[A-D]\).*\n?)+)ANSWER:([A-D])/m)
  if (mcMatch) {
    const question = (mcMatch[1] ?? '').trim()
    const optionLines = (mcMatch[2] ?? '').trim().split('\n')
    const options = optionLines.map((line) => {
      const m = line.match(/^([A-D])\)\s*(.+)/)
      return m ? { letter: m[1] ?? '', text: (m[2] ?? '').trim() } : null
    }).filter((x): x is { letter: string; text: string } => x !== null)
    const cleanText = text.replace(/QUIZ:MC[\s\S]*?ANSWER:[A-D]/m, '').trim()
    return { cleanText, quiz: { type: 'mc', question, options, answered: false } }
  }

  const textMatch = text.match(/QUIZ:TEXT\n([\s\S]+?)\/QUIZ/)
  if (textMatch) {
    const question = (textMatch[1] ?? '').trim()
    const cleanText = text.replace(/QUIZ:TEXT\n[\s\S]+?\/QUIZ/, '').trim()
    return { cleanText, quiz: { type: 'text', question, answered: false, studentInput: '' } }
  }

  const numMatch = text.match(/QUIZ:NUMBER\n([\s\S]+?)\/QUIZ/)
  if (numMatch) {
    const question = (numMatch[1] ?? '').trim()
    const cleanText = text.replace(/QUIZ:NUMBER\n[\s\S]+?\/QUIZ/, '').trim()
    return { cleanText, quiz: { type: 'number', question, answered: false, studentInput: '' } }
  }

  return { cleanText: text, quiz: null }
}

// ── Prompt building ───────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  const objectivesList = props.lesson.objectives.map(o => `- ${o}`).join('\n')
  const contentSummary = props.lesson.content.slice(0, 800) + (props.lesson.content.length > 800 ? '...' : '')

  return `You are Professor Vindicta, an expert cybersecurity instructor running a 30-day security bootcamp.
The student is currently on Day ${props.lesson.day}: "${props.lesson.title}".

Lesson objectives:
${objectivesList}

Lesson content excerpt:
${contentSummary}

Your teaching approach:
- Be encouraging, clear, and engaging. Use real-world analogies.
- Explain concepts step by step. Check understanding before moving on.
- Ask comprehension questions using the QUIZ format below.
- Give constructive feedback on student answers — praise correct reasoning, gently correct mistakes.
- When the student demonstrates solid understanding of all objectives, tell them they are ready to mark the lesson complete.
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

Open text:
QUIZ:TEXT
[Your question here]
/QUIZ

Current date: ${new Date().toLocaleDateString()}
Be conversational and specific to today's lesson.`
}

function buildPrompt(userMessage: string): string {
  const history = messages.value.slice(-6).map(m => {
    const prefix = m.role === 'professor' ? 'Professor' : 'Student'
    return `${prefix}: ${m.text}`
  }).join('\n\n')

  return `${buildSystemPrompt()}

--- Conversation so far ---
${history}

Student: ${userMessage}

Professor:`
}

// ── Message sending ───────────────────────────────────────────────────────
async function sendMessage(text: string) {
  if (!text.trim() || isStreaming.value) return

  messages.value.push({ id: nextId++, role: 'student', text: text.trim() })
  studentInput.value = ''
  await nextTick()
  scrollToBottom()

  const profMsg: ChatMessage = { id: nextId++, role: 'professor', text: '', streaming: true, quiz: null }
  messages.value.push(profMsg)
  isStreaming.value = true

  let rawBuffer = ''
  const projectPath = projects.activeProject?.absolutePath ?? '.'

  try {
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
              profMsg.text = result
            }
          }
          else if (type === 'assistant') {
            const content = (parsed as any)?.message?.content
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block?.type === 'text' && typeof block.text === 'string') {
                  rawBuffer += block.text
                  profMsg.text = rawBuffer
                }
              }
            }
          }
          else if (type === 'text' && typeof parsed.text === 'string') {
            rawBuffer += parsed.text as string
            profMsg.text = rawBuffer
          }
        }
        catch {
          if (line.trim() && !line.startsWith('{')) {
            rawBuffer += line
            profMsg.text = rawBuffer
          }
        }
        void nextTick().then(scrollToBottom)
      },
      onClose() {
        const { cleanText, quiz } = parseQuiz(rawBuffer)
        profMsg.text = cleanText
        profMsg.quiz = quiz
        profMsg.streaming = false
        isStreaming.value = false
        void nextTick().then(scrollToBottom)
      },
      onError(err: string) {
        profMsg.text = `I'm having trouble connecting right now (${err}). Make sure Claude CLI is installed and logged in.`
        profMsg.streaming = false
        isStreaming.value = false
      },
    })
  }
  catch (e: any) {
    profMsg.text = `Connection error: ${e?.message ?? 'Unknown error'}`
    profMsg.streaming = false
    isStreaming.value = false
  }
}

// ── Session control ───────────────────────────────────────────────────────
async function startSession() {
  await sendMessage(`Hello Professor! I'm ready to learn about Day ${props.lesson.day}: ${props.lesson.title}. Please introduce the topic and what I should focus on.`)
}

function resetSession() {
  messages.value = []
  sessionStarted.value = false
  pendingModel.value = academy.aiModel ?? 'claude'
}

// ── Quiz handlers ─────────────────────────────────────────────────────────
function answerMC(msg: ChatMessage, letter: string) {
  if (!msg.quiz || msg.quiz.answered) return
  msg.quiz.answered = true
  msg.quiz.selectedAnswer = letter
  void sendMessage(`My answer is ${letter}) ${msg.quiz.options?.find(o => o.letter === letter)?.text ?? ''}`)
}

function submitTextAnswer(msg: ChatMessage) {
  if (!msg.quiz || msg.quiz.answered || !msg.quiz.studentInput?.trim()) return
  const answer = msg.quiz.studentInput.trim()
  msg.quiz.answered = true
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
            AI tutor for Day {{ lesson.day }}: <span class="text-[var(--text)]">{{ lesson.title }}</span>
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
          The professor will introduce today's lesson, explain key concepts, and ask questions to check your understanding.
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
              {{ academy.aiModel === 'codex' ? 'Codex' : 'Claude' }} · Day {{ lesson.day }}
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

          <!-- Mark complete suggestion -->
          <div v-if="!lessonCompleted && messages.length > 4" class="flex justify-center pt-1">
            <button
              class="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[11px] text-emerald-300 transition-colors hover:bg-emerald-500/10"
              @click="emit('markComplete')"
            >
              <span class="size-1.5 rounded-full bg-emerald-400 inline-block" />
              Mark lesson complete
            </button>
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
          </div>
          <p class="mt-1 px-1 text-[10px] text-[var(--text-faint)]">Enter to send · Shift+Enter for new line</p>
        </div>
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
