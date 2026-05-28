import { defineStore } from 'pinia'
import { INTRO_LESSON_IDS, MAIN_LESSON_COUNT } from '~/data/curriculum'

export type AcademyMode = 'manual' | 'ai-assisted' | null
export type AcademyAIModel = 'claude' | 'codex' | 'openrouter' | 'ollama' | null

export interface AcademyChatMessage {
  id: number
  role: 'professor' | 'student'
  text: string
  createdAt: string
  model: Exclude<AcademyAIModel, null>
  quiz?: AcademyChatQuiz | null
}

export interface AcademyChatQuiz {
  type: 'mc' | 'text' | 'number'
  question: string
  options?: { letter: string; text: string }[]
  answered?: boolean
  selectedAnswer?: string
  studentInput?: string
}

export interface LessonProgress {
  completedAt: string | null
  startedAt: string | null
}

export interface AcademyState {
  mode: AcademyMode
  aiModel: AcademyAIModel
  certificateName: string | null
  completedLessons: Record<string, LessonProgress>
  chatSessions: Record<string, AcademyChatMessage[]>
  certificateIssuedAt: string | null
  lastVisitedModuleId: string | null
  lastVisitedLessonId: string | null
  setupComplete: boolean
}

const STORE_FILE = 'vindicta-academy.bin'
const STORE_KEY = 'academy-state'

async function getAcademyStore() {
  const { Store } = await import('@tauri-apps/plugin-store')
  return Store.load(STORE_FILE)
}

export const TOTAL_LESSONS = MAIN_LESSON_COUNT

export const useAcademyStore = defineStore('academy', () => {
  const mode = ref<AcademyMode>(null)
  const aiModel = ref<AcademyAIModel>(null)
  const certificateName = ref<string | null>(null)
  const completedLessons = ref<Record<string, LessonProgress>>({})
  const chatSessions = ref<Record<string, AcademyChatMessage[]>>({})
  const certificateIssuedAt = ref<string | null>(null)
  const lastVisitedModuleId = ref<string | null>(null)
  const lastVisitedLessonId = ref<string | null>(null)
  const setupComplete = ref(false)
  const _loaded = ref(false)

  // Only count main-course lessons (week > 0) toward progress.
  // Intro lessons (intro-1..intro-4) are orientation modules that don't affect the progress bar.
  const _introIds = new Set(INTRO_LESSON_IDS)
  const completedCount = computed(
    () => Object.entries(completedLessons.value)
      .filter(([id, l]) => !_introIds.has(id) && l.completedAt !== null)
      .length,
  )
  const allCompleted = computed(() => completedCount.value >= TOTAL_LESSONS)
  const progressPercent = computed(() => Math.round((completedCount.value / TOTAL_LESSONS) * 100))

  function isCompleted(lessonId: string) {
    return !!completedLessons.value[lessonId]?.completedAt
  }

  function isStarted(lessonId: string) {
    return !!completedLessons.value[lessonId]?.startedAt
  }

  function grantLessonCompletion(lessonId: string) {
    return completeLesson(lessonId)
  }

  async function _save() {
    try {
      const store = await getAcademyStore()
      await store.set(STORE_KEY, {
        mode: mode.value,
        aiModel: aiModel.value,
        certificateName: certificateName.value,
        completedLessons: completedLessons.value,
        chatSessions: chatSessions.value,
        certificateIssuedAt: certificateIssuedAt.value,
        lastVisitedModuleId: lastVisitedModuleId.value,
        lastVisitedLessonId: lastVisitedLessonId.value,
        setupComplete: setupComplete.value,
      } satisfies AcademyState)
      await store.save()
    }
    catch (e) {
      console.warn('[Academy] Save failed:', e)
    }
  }

  async function loadFromDisk() {
    if (_loaded.value) return
    try {
      const store = await getAcademyStore()
      const data = await store.get<AcademyState>(STORE_KEY)
      if (data) {
        mode.value = data.mode ?? null
        aiModel.value = data.aiModel ?? null
        certificateName.value = data.certificateName ?? null
        completedLessons.value = data.completedLessons ?? {}
        chatSessions.value = data.chatSessions ?? {}
        certificateIssuedAt.value = data.certificateIssuedAt ?? null
        lastVisitedModuleId.value = data.lastVisitedModuleId ?? null
        lastVisitedLessonId.value = data.lastVisitedLessonId ?? null
        setupComplete.value = data.setupComplete ?? false
      }
    }
    catch (e) {
      console.warn('[Academy] Load failed:', e)
    }
    finally {
      _loaded.value = true
    }
  }

  async function setSetup(m: Exclude<AcademyMode, null>, model: AcademyAIModel, name?: string | null) {
    mode.value = m
    aiModel.value = model
    if (name !== undefined) {
      certificateName.value = name?.trim() || null
    }
    setupComplete.value = true
    await _save()
  }

  async function resetSetup() {
    mode.value = null
    aiModel.value = null
    certificateName.value = null
    setupComplete.value = false
    completedLessons.value = {}
    chatSessions.value = {}
    certificateIssuedAt.value = null
    lastVisitedModuleId.value = null
    lastVisitedLessonId.value = null
    await _save()
  }

  async function resetProgress(keepSetup = true) {
    completedLessons.value = {}
    chatSessions.value = {}
    certificateIssuedAt.value = null
    lastVisitedModuleId.value = null
    lastVisitedLessonId.value = null
    if (!keepSetup) {
      mode.value = null
      aiModel.value = null
      certificateName.value = null
      setupComplete.value = false
    }
    await _save()
  }

  async function setCertificateName(name: string | null) {
    certificateName.value = name?.trim() || null
    await _save()
  }

  function getChatSession(lessonId: string) {
    return chatSessions.value[lessonId] ?? []
  }

  async function setChatSession(lessonId: string, messages: AcademyChatMessage[]) {
    chatSessions.value = {
      ...chatSessions.value,
      [lessonId]: messages,
    }
    await _save()
  }

  async function clearChatSession(lessonId: string) {
    const next = { ...chatSessions.value }
    delete next[lessonId]
    chatSessions.value = next
    await _save()
  }

  async function startLesson(lessonId: string) {
    if (!completedLessons.value[lessonId]) {
      completedLessons.value = {
        ...completedLessons.value,
        [lessonId]: { completedAt: null, startedAt: new Date().toISOString() },
      }
      await _save()
    }
  }

  async function completeLesson(lessonId: string) {
    const existing = completedLessons.value[lessonId]
    const nextProgress = {
      ...completedLessons.value,
      [lessonId]: {
        startedAt: existing?.startedAt ?? new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    }
    completedLessons.value = nextProgress

    // Issue certificate when all lessons done
    const mainCompleted = Object.entries(nextProgress)
      .filter(([id, progress]) => !_introIds.has(id) && progress.completedAt !== null)
      .length
    if (mainCompleted >= TOTAL_LESSONS && !certificateIssuedAt.value) {
      certificateIssuedAt.value = new Date().toISOString()
    }
    await _save()
  }

  async function setLastVisited(moduleId: string, lessonId: string) {
    lastVisitedModuleId.value = moduleId
    lastVisitedLessonId.value = lessonId
    await _save()
  }

  return {
    mode,
    aiModel,
    certificateName,
    completedLessons,
    chatSessions,
    certificateIssuedAt,
    lastVisitedModuleId,
    lastVisitedLessonId,
    setupComplete,
    completedCount,
    allCompleted,
    progressPercent,
    isCompleted,
    isStarted,
    grantLessonCompletion,
    loadFromDisk,
    setSetup,
    setCertificateName,
    resetSetup,
    resetProgress,
    startLesson,
    completeLesson,
    setLastVisited,
    getChatSession,
    setChatSession,
    clearChatSession,
  }
})
