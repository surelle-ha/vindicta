<script setup lang="ts">
import {
  Award,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  GraduationCap,
  RotateCcw,
  Shield,
  Swords,
  Target,
  Wifi,
  Zap,
} from 'lucide-vue-next'
import { useAcademyStore } from '~/stores/academy'
import type { AcademyMode, AcademyAIModel } from '~/stores/academy'
import { LESSONS, WEEKS, TOTAL_DAYS, getLesson } from '~/data/curriculum'
import type { Lesson, Week } from '~/data/curriculum'
import AIProfessorChat from '~/components/academy/AIProfessorChat.vue'

const academy = useAcademyStore()

type View = 'setup' | 'course' | 'lesson' | 'certificate'
const view = ref<View>('course')
const currentLesson = ref<Lesson | null>(null)

onMounted(async () => {
  await academy.loadFromDisk()
  if (!academy.setupComplete) {
    view.value = 'setup'
  }
  else if (academy.allCompleted && academy.certificateIssuedAt) {
    view.value = 'certificate'
  }
  else {
    view.value = 'course'
    // Restore last visited lesson
    if (academy.lastVisitedLessonId) {
      const last = getLesson(academy.lastVisitedLessonId)
      if (last) currentLesson.value = last
    }
  }
})

// ── Setup ──────────────────────────────────────────────────────────────────

const setupMode = ref<AcademyMode>(null)
const setupModel = ref<AcademyAIModel>('claude')

const modeOptions = [
  {
    id: 'manual' as AcademyMode,
    label: 'Self-Paced',
    description: 'Study at your own pace with curated lesson content. No AI interactions.',
    icon: BookOpen,
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    id: 'ai-assisted' as AcademyMode,
    label: 'AI-Assisted',
    description: 'Learn with Professor Vindicta — an AI tutor who teaches, asks questions, and evaluates your understanding.',
    icon: Bot,
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
]

const modelOptions = [
  { id: 'claude' as AcademyAIModel, label: 'Claude (Recommended)', description: 'Anthropic Claude Code CLI' },
  { id: 'codex' as AcademyAIModel, label: 'Codex', description: 'OpenAI Codex CLI' },
]

async function completeSetup() {
  if (!setupMode.value) return
  await academy.setSetup(setupMode.value as Exclude<AcademyMode, null>, setupModel.value)
  view.value = 'course'
}

// ── Course view ────────────────────────────────────────────────────────────

const weekFilter = ref<number | null>(null)

const displayedLessons = computed(() =>
  weekFilter.value ? LESSONS.filter(l => l.week === weekFilter.value) : LESSONS,
)

function weekForLesson(lesson: Lesson): Week {
  return WEEKS[lesson.week - 1] ?? WEEKS[WEEKS.length - 1]!
}

function openLesson(lesson: Lesson) {
  currentLesson.value = lesson
  view.value = 'lesson'
  void academy.startLesson(lesson.id)
  void academy.setLastVisited('week-' + lesson.week, lesson.id)
}

// ── Lesson view ────────────────────────────────────────────────────────────

const lessonContentEl = ref<HTMLElement | null>(null)

const nextLesson = computed<Lesson | null>(() => {
  if (!currentLesson.value) return null
  const idx = LESSONS.findIndex(l => l.id === currentLesson.value!.id)
  return (idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null) ?? null
})

const prevLesson = computed<Lesson | null>(() => {
  if (!currentLesson.value) return null
  const idx = LESSONS.findIndex(l => l.id === currentLesson.value!.id)
  return (idx > 0 ? LESSONS[idx - 1] : null) ?? null
})

async function markComplete() {
  if (!currentLesson.value) return
  await academy.completeLesson(currentLesson.value.id)
  if (academy.allCompleted) {
    view.value = 'certificate'
  }
}

function goToLesson(lesson: Lesson | null) {
  if (!lesson) return
  currentLesson.value = lesson
  void academy.startLesson(lesson.id)
  void academy.setLastVisited('week-' + lesson.week, lesson.id)
  lessonContentEl.value?.scrollTo(0, 0)
}

// ── Markdown renderer ──────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code fences
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_: string, lang: string, code: string) => {
    return `<pre class="code-block"><code class="lang-${lang}">${code.trimEnd()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')

  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_: string, header: string, rows: string) => {
    const ths = header.split('|').filter(Boolean).map(h => `<th>${h.trim()}</th>`).join('')
    const trs = rows.trim().split('\n').map(row => {
      const tds = row.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${tds}</tr>`
    }).join('')
    return `<table class="lesson-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`
  })

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Unordered lists
  html = html.replace(/((?:^- .+\n?)+)/gm, (block: string) => {
    const items = block.trim().split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('')
    return `<ul>${items}</ul>`
  })

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block: string) => {
    const items = block.trim().split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('')
    return `<ol>${items}</ol>`
  })

  // Paragraphs
  html = html.replace(/\n{2,}/g, '</p><p>')
  html = `<p>${html}</p>`
  html = html.replace(/<p>\s*(<(?:h[1-6]|ul|ol|pre|table)[^>]*>)/g, '$1')
  html = html.replace(/(<\/(?:h[1-6]|ul|ol|pre|table)>)\s*<\/p>/g, '$1')
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/\n/g, '<br>')
  html = html.replace(/<br>\s*(<(?:li|tr|th|td|\/ul|\/ol))/g, '$1')

  return html
}

// ── Certificate ────────────────────────────────────────────────────────────

const certDate = computed(() => {
  if (!academy.certificateIssuedAt) return ''
  return new Date(academy.certificateIssuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
})

async function resetAcademy() {
  await academy.resetSetup()
  view.value = 'setup'
  currentLesson.value = null
  weekFilter.value = null
}
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">

    <!-- ── SETUP ──────────────────────────────────────────────────────────── -->
    <div v-if="view === 'setup'" class="flex h-full items-center justify-center p-6">
      <div class="w-full max-w-xl space-y-8">
        <!-- Header -->
        <div class="text-center">
          <div class="mx-auto mb-4 grid size-16 place-items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
            <GraduationCap class="size-8 text-indigo-300" />
          </div>
          <h1 class="text-2xl font-bold text-[var(--text)]">Security Bootcamp</h1>
          <p class="mt-1 text-sm text-[var(--text-muted)]">30-day hands-on curriculum from security fundamentals to professional pentesting</p>
        </div>

        <!-- Mode selection -->
        <div class="space-y-3">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">Choose your learning mode</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="mode in modeOptions"
              :key="mode.id ?? 'unknown'"
              class="rounded-xl border p-4 text-left transition-all"
              :class="setupMode === mode.id
                ? [mode.border, mode.bg]
                : 'border-[var(--border)] hover:border-indigo-500/20 hover:bg-white/[0.02]'"
              @click="setupMode = mode.id"
            >
              <div class="flex items-center gap-2.5 mb-2">
                <div class="grid size-8 shrink-0 place-items-center rounded-lg" :class="[mode.bg, mode.border, 'border']">
                  <component :is="mode.icon" class="size-4" :class="mode.color" />
                </div>
                <span class="text-sm font-semibold text-[var(--text)]">{{ mode.label }}</span>
              </div>
              <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ mode.description }}</p>
            </button>
          </div>
        </div>

        <!-- Model selection (AI mode only) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="setupMode === 'ai-assisted'" class="space-y-2">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">AI model for professor</p>
            <div class="grid gap-2 sm:grid-cols-2">
              <button
                v-for="m in modelOptions"
                :key="m.id ?? 'unknown'"
                class="rounded-xl border p-3 text-left transition-all"
                :class="setupModel === m.id
                  ? 'border-violet-500/30 bg-violet-500/10'
                  : 'border-[var(--border)] hover:border-violet-500/20'"
                @click="setupModel = m.id"
              >
                <p class="text-xs font-semibold text-[var(--text)]">{{ m.label }}</p>
                <p class="mt-0.5 text-[10px] text-[var(--text-faint)]">{{ m.description }}</p>
              </button>
            </div>
          </div>
        </Transition>

        <!-- CTA -->
        <button
          :disabled="!setupMode"
          class="w-full rounded-xl bg-indigo-600/80 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600 disabled:opacity-40"
          @click="completeSetup"
        >
          Start Bootcamp →
        </button>

        <!-- Stats -->
        <div class="flex justify-center gap-6 text-center">
          <div>
            <p class="text-lg font-bold text-[var(--text)]">30</p>
            <p class="text-[10px] text-[var(--text-faint)]">Days</p>
          </div>
          <div>
            <p class="text-lg font-bold text-[var(--text)]">~45h</p>
            <p class="text-[10px] text-[var(--text-faint)]">Content</p>
          </div>
          <div>
            <p class="text-lg font-bold text-[var(--text)]">1</p>
            <p class="text-[10px] text-[var(--text-faint)]">Certificate</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── COURSE VIEW ─────────────────────────────────────────────────────── -->
    <template v-else-if="view === 'course'">
      <div class="flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
        <div class="grid size-8 shrink-0 place-items-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
          <GraduationCap class="size-4 text-indigo-300" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-semibold text-[var(--text)]">30-Day Security Bootcamp</h1>
          <p class="text-[11px] text-[var(--text-muted)]">
            {{ academy.completedCount }}/{{ TOTAL_DAYS }} days completed
            · {{ academy.progressPercent }}%
            · <span class="capitalize">{{ academy.mode ?? 'manual' }}</span> mode
          </p>
        </div>
        <!-- Progress bar -->
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-28 rounded-full bg-white/[0.06] h-1.5">
            <div class="h-1.5 rounded-full bg-indigo-500 transition-all" :style="{ width: academy.progressPercent + '%' }" />
          </div>
          <button
            class="text-[10px] text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
            title="Reset progress"
            @click="resetAcademy"
          >
            <RotateCcw class="size-3" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scroll">
        <!-- Week filter tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            class="shrink-0 rounded-lg border px-3 py-1 text-[11px] font-medium transition-colors"
            :class="weekFilter === null ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : 'border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text-muted)]'"
            @click="weekFilter = null"
          >
            All Days
          </button>
          <button
            v-for="week in WEEKS"
            :key="week.number"
            class="shrink-0 rounded-lg border px-3 py-1 text-[11px] font-medium transition-colors"
            :class="weekFilter === week.number ? [week.border, week.bg, week.color] : 'border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text-muted)]'"
            @click="weekFilter = week.number === weekFilter ? null : week.number"
          >
            {{ week.title }} — {{ week.theme }}
          </button>
        </div>

        <!-- Weeks + Lessons -->
        <div class="space-y-6">
          <template v-for="week in WEEKS" :key="week.number">
            <div v-if="!weekFilter || weekFilter === week.number" class="space-y-3">
              <!-- Week header -->
              <div class="flex items-center gap-2.5">
                <div class="h-px flex-1 bg-[var(--border)]" />
                <div class="flex items-center gap-2 rounded-full border px-3 py-1" :class="[week.border, week.bg]">
                  <span class="text-[10px] font-bold uppercase tracking-widest" :class="week.color">{{ week.title }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">·</span>
                  <span class="text-[10px] text-[var(--text-muted)]">{{ week.theme }}</span>
                </div>
                <div class="h-px flex-1 bg-[var(--border)]" />
              </div>

              <!-- Day cards grid -->
              <div class="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <button
                  v-for="lesson in LESSONS.filter(l => l.week === week.number)"
                  :key="lesson.id"
                  class="group relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all"
                  :class="[
                    academy.isCompleted(lesson.id)
                      ? 'border-emerald-500/25 bg-emerald-500/[0.06] hover:bg-emerald-500/10'
                      : lesson.id === academy.lastVisitedLessonId && !academy.isCompleted(lesson.id)
                        ? 'border-indigo-500/30 bg-indigo-500/[0.06] hover:bg-indigo-500/10'
                        : 'border-[var(--border)] hover:border-indigo-500/20 hover:bg-white/[0.03]',
                  ]"
                  @click="openLesson(lesson)"
                >
                  <!-- Day number + status -->
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="weekForLesson(lesson).color">
                      Day {{ lesson.day }}
                    </span>
                    <CheckCircle2 v-if="academy.isCompleted(lesson.id)" class="size-3.5 text-emerald-400" />
                    <div
                      v-else-if="lesson.id === academy.lastVisitedLessonId"
                      class="size-1.5 rounded-full bg-indigo-400"
                    />
                    <Circle v-else class="size-3 text-[var(--border)]" />
                  </div>

                  <!-- Title -->
                  <p class="text-xs font-semibold leading-snug text-[var(--text)] group-hover:text-white">
                    {{ lesson.title }}
                  </p>

                  <!-- Duration -->
                  <div class="flex items-center gap-1 text-[10px] text-[var(--text-faint)]">
                    <Clock class="size-2.5 shrink-0" />
                    {{ lesson.duration }}
                  </div>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- ── LESSON VIEW ────────────────────────────────────────────────────── -->
    <template v-else-if="view === 'lesson' && currentLesson">
      <!-- Header -->
      <div class="flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5">
        <button
          class="flex items-center gap-1 text-[11px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-muted)]"
          @click="view = 'course'"
        >
          <ChevronLeft class="size-3.5" />
          Course
        </button>
        <div class="h-3 w-px bg-[var(--border)]" />
        <span
          class="text-[10px] font-bold uppercase tracking-widest"
          :class="weekForLesson(currentLesson).color"
        >
          Day {{ currentLesson.day }}
        </span>
        <h2 class="flex-1 truncate text-sm font-semibold text-[var(--text)]">{{ currentLesson.title }}</h2>

        <!-- Completion status -->
        <div class="flex shrink-0 items-center gap-2">
          <span class="flex items-center gap-1 text-[10px] text-[var(--text-faint)]">
            <Clock class="size-3" />
            {{ currentLesson.duration }}
          </span>
          <CheckCircle2 v-if="academy.isCompleted(currentLesson.id)" class="size-4 text-emerald-400" />
          <button
            v-else
            class="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-500/15"
            @click="markComplete"
          >
            <CheckCircle2 class="size-3" />
            Mark Complete
          </button>
        </div>

        <!-- Prev / Next navigation -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            :disabled="!prevLesson"
            class="flex size-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-30"
            title="Previous lesson"
            @click="goToLesson(prevLesson)"
          >
            <ChevronLeft class="size-3.5" />
          </button>
          <button
            :disabled="!nextLesson"
            class="flex size-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-30"
            title="Next lesson"
            @click="goToLesson(nextLesson)"
          >
            <ChevronRight class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Content area: split when AI mode -->
      <div
        class="flex flex-1 overflow-hidden"
        :class="academy.mode === 'ai-assisted' ? 'gap-0' : ''"
      >
        <!-- Lesson content -->
        <div
          ref="lessonContentEl"
          class="flex-1 overflow-y-auto p-6 custom-scroll"
          :class="academy.mode === 'ai-assisted' ? 'border-r border-[var(--border)]' : 'mx-auto max-w-3xl'"
        >
          <!-- Objectives -->
          <div class="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
              Today's Objectives
            </p>
            <ul class="space-y-1.5">
              <li
                v-for="obj in currentLesson.objectives"
                :key="obj"
                class="flex items-start gap-2 text-xs text-[var(--text-muted)]"
              >
                <Target class="mt-0.5 size-3 shrink-0 text-indigo-400" />
                {{ obj }}
              </li>
            </ul>
          </div>

          <!-- Main content -->
          <div class="prose-lesson" v-html="renderMarkdown(currentLesson.content)" />

          <!-- Lab hint -->
          <div v-if="currentLesson.labHint" class="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">Lab Exercise</p>
            <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ currentLesson.labHint }}</p>
          </div>

          <!-- Bottom nav -->
          <div class="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5">
            <button
              v-if="prevLesson"
              class="flex items-center gap-2 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              @click="goToLesson(prevLesson)"
            >
              <ChevronLeft class="size-3.5" />
              <span>Day {{ prevLesson.day }}: {{ prevLesson.title }}</span>
            </button>
            <div v-else />
            <button
              v-if="nextLesson"
              class="flex items-center gap-2 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              @click="goToLesson(nextLesson)"
            >
              <span>Day {{ nextLesson.day }}: {{ nextLesson.title }}</span>
              <ChevronRight class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- AI Professor Chat panel (AI mode only) -->
        <div
          v-if="academy.mode === 'ai-assisted'"
          class="flex w-[22rem] shrink-0 flex-col overflow-hidden"
        >
          <AIProfessorChat
            :lesson="currentLesson"
            :lesson-completed="academy.isCompleted(currentLesson.id)"
            @mark-complete="markComplete"
          />
        </div>
      </div>
    </template>

    <!-- ── CERTIFICATE ─────────────────────────────────────────────────────── -->
    <template v-else-if="view === 'certificate'">
      <div class="flex h-full items-center justify-center p-8">
        <div class="w-full max-w-lg space-y-8 text-center">
          <!-- Certificate card -->
          <div class="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-8 space-y-4">
            <div class="mx-auto grid size-20 place-items-center rounded-full border border-amber-500/30 bg-amber-500/15">
              <Award class="size-10 text-amber-300" />
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Certificate of Completion</p>
              <h1 class="mt-2 text-2xl font-bold text-[var(--text)]">Security Engineering Bootcamp</h1>
              <p class="mt-1 text-sm text-[var(--text-muted)]">30-Day Cybersecurity Programme</p>
            </div>
            <div class="border-t border-amber-500/15 pt-4 space-y-1">
              <p class="text-xs text-[var(--text-faint)]">Issued on</p>
              <p class="text-sm font-semibold text-[var(--text)]">{{ certDate }}</p>
            </div>
            <div class="grid grid-cols-3 gap-3 pt-2">
              <div class="rounded-lg border border-amber-500/15 p-2">
                <p class="text-xl font-bold text-[var(--text)]">30</p>
                <p class="text-[10px] text-[var(--text-faint)]">Days</p>
              </div>
              <div class="rounded-lg border border-amber-500/15 p-2">
                <p class="text-xl font-bold text-[var(--text)]">{{ TOTAL_DAYS }}</p>
                <p class="text-[10px] text-[var(--text-faint)]">Lessons</p>
              </div>
              <div class="rounded-lg border border-amber-500/15 p-2">
                <p class="text-xl font-bold text-[var(--text)]">100%</p>
                <p class="text-[10px] text-[var(--text-faint)]">Complete</p>
              </div>
            </div>
          </div>

          <div class="flex justify-center gap-3">
            <button
              class="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--text)]"
              @click="view = 'course'"
            >
              <GraduationCap class="size-4" />
              Review Course
            </button>
            <button
              class="flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/[0.05] hover:text-red-300"
              @click="resetAcademy"
            >
              <RotateCcw class="size-4" />
              Start Over
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.prose-lesson :deep(h1) {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin-top: 0;
  margin-bottom: 1rem;
}
.prose-lesson :deep(h2) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--border);
}
.prose-lesson :deep(h3) {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.prose-lesson :deep(p) {
  font-size: 0.8125rem;
  line-height: 1.75;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
.prose-lesson :deep(ul),
.prose-lesson :deep(ol) {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.75;
}
.prose-lesson :deep(ul) { list-style-type: disc; }
.prose-lesson :deep(ol) { list-style-type: decimal; }
.prose-lesson :deep(li) { margin-bottom: 0.25rem; }
.prose-lesson :deep(strong) { color: var(--text); font-weight: 600; }
.prose-lesson :deep(em) { font-style: italic; }
.prose-lesson :deep(.code-block) {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  font-family: 'Cascadia Code', 'Fira Code', ui-monospace, monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  color: #c9d1d9;
  overflow-x: auto;
  margin: 1rem 0;
  white-space: pre;
}
.prose-lesson :deep(.inline-code) {
  background: rgba(255,255,255,0.07);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: ui-monospace, monospace;
  font-size: 0.73rem;
  color: #c9d1d9;
}
.prose-lesson :deep(.lesson-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  margin: 1rem 0;
}
.prose-lesson :deep(.lesson-table th) {
  background: rgba(255,255,255,0.04);
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.prose-lesson :deep(.lesson-table td) {
  padding: 0.4rem 0.75rem;
  color: var(--text-muted);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
</style>
