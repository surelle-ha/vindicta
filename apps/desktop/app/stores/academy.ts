import { defineStore } from 'pinia'

export type AcademyMode = 'manual' | 'ai-assisted' | null
export type AcademyAIModel = 'claude' | 'codex' | null

export interface LessonProgress {
  completedAt: string | null
  startedAt: string | null
}

export interface AcademyState {
  mode: AcademyMode
  aiModel: AcademyAIModel
  completedLessons: Record<string, LessonProgress>
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

export const TOTAL_LESSONS = 30

export const useAcademyStore = defineStore('academy', () => {
  const mode = ref<AcademyMode>(null)
  const aiModel = ref<AcademyAIModel>(null)
  const completedLessons = ref<Record<string, LessonProgress>>({})
  const certificateIssuedAt = ref<string | null>(null)
  const lastVisitedModuleId = ref<string | null>(null)
  const lastVisitedLessonId = ref<string | null>(null)
  const setupComplete = ref(false)
  const _loaded = ref(false)

  const completedCount = computed(
    () => Object.values(completedLessons.value).filter(l => l.completedAt !== null).length,
  )
  const allCompleted = computed(() => completedCount.value >= TOTAL_LESSONS)
  const progressPercent = computed(() => Math.round((completedCount.value / TOTAL_LESSONS) * 100))

  function isCompleted(lessonId: string) {
    return !!completedLessons.value[lessonId]?.completedAt
  }

  function isStarted(lessonId: string) {
    return !!completedLessons.value[lessonId]?.startedAt
  }

  async function _save() {
    try {
      const store = await getAcademyStore()
      await store.set(STORE_KEY, {
        mode: mode.value,
        aiModel: aiModel.value,
        completedLessons: completedLessons.value,
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
        completedLessons.value = data.completedLessons ?? {}
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

  async function setSetup(m: Exclude<AcademyMode, null>, model: AcademyAIModel) {
    mode.value = m
    aiModel.value = model
    setupComplete.value = true
    await _save()
  }

  async function resetSetup() {
    mode.value = null
    aiModel.value = null
    setupComplete.value = false
    await _save()
  }

  async function startLesson(lessonId: string) {
    if (!completedLessons.value[lessonId]) {
      completedLessons.value[lessonId] = { completedAt: null, startedAt: new Date().toISOString() }
      await _save()
    }
  }

  async function completeLesson(lessonId: string) {
    const existing = completedLessons.value[lessonId]
    completedLessons.value[lessonId] = {
      startedAt: existing?.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }
    // Issue certificate when all lessons done
    if (allCompleted.value && !certificateIssuedAt.value) {
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
    completedLessons,
    certificateIssuedAt,
    lastVisitedModuleId,
    lastVisitedLessonId,
    setupComplete,
    completedCount,
    allCompleted,
    progressPercent,
    isCompleted,
    isStarted,
    loadFromDisk,
    setSetup,
    resetSetup,
    startLesson,
    completeLesson,
    setLastVisited,
  }
})
