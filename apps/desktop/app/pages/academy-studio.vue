<script setup lang="ts">
import {
  BookOpen, Plus, Upload, Download, Trash2, FileText,
  NotebookPen, Volume2, ChevronLeft, Save, Loader2, Mic, X, Music,
  LayoutList, Info, AudioLines, AlertTriangle, GripVertical, Pencil, Package,
  Settings, Eraser, CheckCircle2,
} from 'lucide-vue-next'
import type { CustomLesson } from '~/data/curriculum'
import type { TTSScriptModel } from '~/composables/useAcademyTTS'

definePageMeta({ layout: 'studio' })
useHead({ title: 'Academy Studio · Vindicta' })

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

const router = useRouter()
const studio = useAcademyStudio()
const tts = useAcademyTTS()

// ── State ─────────────────────────────────────────────────────────────────────

const lessons       = ref<CustomLesson[]>([])
const loading       = ref(true)
const saving        = ref(false)
const saveError     = ref('')
const editingLesson = ref<CustomLesson | null>(null)
const isNew         = ref(false)
const activeTab     = ref<'metadata' | 'content' | 'notes' | 'audio'>('metadata')
const confirmDelete   = ref<CustomLesson | null>(null)
const showDeleteModal = ref(false)
const showSaveModal   = ref(false)
const saveTarget      = ref<'appdata' | 'bundled' | 'both'>('appdata')
type PendingAction = { type: 'save-lesson' } | { type: 'rename-section'; oldName: string; newName: string }
const pendingAction   = ref<PendingAction>({ type: 'save-lesson' })
const showSettings    = ref(false)
const showClearModal  = ref(false)
const settingsWorking = ref(false)
const settingsMsg     = ref('')
const settingsError   = ref('')
const audioLoading   = ref(false)
const audioError     = ref('')
const ttsModel       = ref<TTSScriptModel>('claude')
const audioObjUrl    = ref<string | null>(null)
const bundledFilenames = ref<Set<string>>(new Set())
const sectionFilter   = ref<string | null>(null)
const draggingSection = ref<string | null>(null)
const dragOverSection = ref<string | null>(null)
const reordering      = ref(false)
const renamingSection = ref<string | null>(null)
const renameSectionValue = ref('')

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  ;[lessons.value, bundledFilenames.value] = await Promise.all([
    studio.loadCourseBin(),
    studio.getBundledFilenames(),
  ])
  loading.value = false
})

onUnmounted(() => {
  if (audioObjUrl.value) URL.revokeObjectURL(audioObjUrl.value)
})

// ── Watch audio for editing lesson ───────────────────────────────────────────

watch(editingLesson, async (lesson) => {
  if (audioObjUrl.value) {
    URL.revokeObjectURL(audioObjUrl.value)
    audioObjUrl.value = null
  }
  if (!lesson) return
  if (lesson.embeddedAudio?.data) {
    await studio.loadEmbeddedAudio(lesson.id, lesson.embeddedAudio.data)
    audioObjUrl.value = await tts.loadAudio(lesson.id)
  }
})

// Watch TTS generation completing for the current lesson
watch(() => tts.cachedLessonIds.value, async (ids) => {
  if (!editingLesson.value) return
  if (!ids.has(editingLesson.value.id)) return
  await embedAudioFromCache()
})

// ── Objectives helpers ────────────────────────────────────────────────────────

function addObjective() {
  if (!editingLesson.value) return
  editingLesson.value.objectives.push('')
}

function removeObjective(i: number) {
  if (!editingLesson.value) return
  editingLesson.value.objectives.splice(i, 1)
}

function updateObjective(i: number, val: string) {
  if (!editingLesson.value) return
  editingLesson.value.objectives[i] = val
}

// ── Editor actions ────────────────────────────────────────────────────────────

function openNew() {
  editingLesson.value = studio.createBlankLesson(lessons.value.length, '')
  isNew.value = true
  activeTab.value = 'metadata'
}

function openEdit(lesson: CustomLesson) {
  editingLesson.value = { ...lesson, objectives: [...lesson.objectives] }
  isNew.value = false
  activeTab.value = 'metadata'
}

function cancelEdit() {
  editingLesson.value = null
  saveError.value = ''
  audioError.value = ''
}

function save() {
  if (!editingLesson.value) return
  if (!editingLesson.value.title.trim()) { saveError.value = 'Title is required.'; return }
  saveError.value = ''
  pendingAction.value = { type: 'save-lesson' }
  saveTarget.value = bundledFilenames.value.has(editingLesson.value.vaFilename) ? 'both' : 'appdata'
  showSaveModal.value = true
}

async function confirmSave() {
  saving.value = true
  saveError.value = ''
  showSaveModal.value = false
  try {
    const action = pendingAction.value
    if (action.type === 'save-lesson') {
      if (!editingLesson.value) return
      const lesson = editingLesson.value
      let filename = lesson.vaFilename || `${lesson.id}.va`
      if (saveTarget.value === 'appdata' || saveTarget.value === 'both') {
        filename = await studio.saveLessonToCourseBin(lesson, lesson.vaFilename || undefined)
      }
      if (saveTarget.value === 'bundled' || saveTarget.value === 'both') {
        filename = await studio.saveLessonToBundledCourseBin(lesson, filename)
        bundledFilenames.value = await studio.getBundledFilenames()
      }
      lesson.vaFilename = filename
      isNew.value = false
    } else {
      const { oldName, newName } = action
      if (saveTarget.value === 'appdata' || saveTarget.value === 'both') {
        await studio.renameSection(oldName, newName, lessons.value)
      }
      if (saveTarget.value === 'bundled' || saveTarget.value === 'both') {
        await studio.renameSectionInBundled(oldName, newName)
        bundledFilenames.value = await studio.getBundledFilenames()
      }
      if (editingLesson.value?.section === oldName) editingLesson.value.section = newName
      if (sectionFilter.value === oldName) sectionFilter.value = newName
    }
    lessons.value = await studio.loadCourseBin()
  } catch (err) {
    saveError.value = (err as Error).message
  } finally {
    saving.value = false
  }
}

async function exportLesson(lesson: CustomLesson) {
  try {
    await studio.exportVAFile(lesson)
  } catch (err) {
    saveError.value = (err as Error).message
  }
}

async function doDelete(lesson: CustomLesson) {
  try {
    await studio.deleteFromCourseBin(lesson.vaFilename)
    if (editingLesson.value?.id === lesson.id) editingLesson.value = null
    lessons.value = await studio.loadCourseBin()
  } catch (err) {
    saveError.value = (err as Error).message
  } finally {
    showDeleteModal.value = false
    confirmDelete.value = null
  }
}

async function doImport() {
  try {
    const imported = await studio.importVAFile()
    if (imported) {
      lessons.value = await studio.loadCourseBin()
    }
  } catch (err) {
    saveError.value = (err as Error).message
  }
}

// ── Section drag-and-drop ─────────────────────────────────────────────────────

function onSectionDragStart(e: DragEvent, sectionName: string) {
  draggingSection.value = sectionName
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onSectionDragOver(sectionName: string) {
  if (draggingSection.value && draggingSection.value !== sectionName) {
    dragOverSection.value = sectionName
  }
}

async function onSectionDrop(targetSection: string) {
  const from = draggingSection.value
  if (!from || from === targetSection) { dragOverSection.value = null; return }
  const currentOrder = groupedLessons.value.map(g => g.name)
  const fromIdx = currentOrder.indexOf(from)
  const toIdx = currentOrder.indexOf(targetSection)
  if (fromIdx === -1 || toIdx === -1) { dragOverSection.value = null; return }
  const newOrder = [...currentOrder]
  newOrder.splice(fromIdx, 1)
  newOrder.splice(toIdx, 0, from)
  reordering.value = true
  saveError.value = ''
  try {
    await studio.reorderSections(newOrder, lessons.value)
    lessons.value = await studio.loadCourseBin()
  } catch (err) {
    saveError.value = (err as Error).message
  } finally {
    reordering.value = false
    draggingSection.value = null
    dragOverSection.value = null
  }
}

function onSectionDragEnd() {
  draggingSection.value = null
  dragOverSection.value = null
}

// ── Section rename ────────────────────────────────────────────────────────────

function startRenameSection(name: string) {
  renamingSection.value = name
  renameSectionValue.value = name
}

function commitRenameSection() {
  const oldName = renamingSection.value
  renamingSection.value = null
  if (!oldName) return
  const newName = renameSectionValue.value.trim()
  if (!newName || newName === oldName) return
  saveError.value = ''
  pendingAction.value = { type: 'rename-section', oldName, newName }
  const sectionLessons = lessons.value.filter(l => (l.section || 'Unsectioned') === oldName)
  const hasBundled = sectionLessons.some(l => bundledFilenames.value.has(l.vaFilename))
  saveTarget.value = hasBundled ? 'both' : 'appdata'
  showSaveModal.value = true
}

function cancelRenameSection() {
  renamingSection.value = null
  renameSectionValue.value = ''
}

// ── Settings actions ──────────────────────────────────────────────────────────

async function doClear() {
  settingsWorking.value = true
  settingsMsg.value = ''
  settingsError.value = ''
  showClearModal.value = false
  try {
    await studio.clearCourseBin()
    if (editingLesson.value) editingLesson.value = null
    lessons.value = await studio.loadCourseBin()
    settingsMsg.value = 'All VA files removed from AppData.'
  } catch (err) {
    settingsError.value = (err as Error).message
  } finally {
    settingsWorking.value = false
  }
}

// ── Audio helpers ─────────────────────────────────────────────────────────────

async function generateAudio() {
  if (!editingLesson.value) return
  audioError.value = ''
  try {
    await tts.createTTS(editingLesson.value, ttsModel.value)
  } catch (err) {
    audioError.value = (err as Error).message
  }
}

async function embedAudioFromCache() {
  if (!editingLesson.value) return
  audioLoading.value = true
  try {
    const cache = await caches.open('vindicta-academy-tts')
    const res = await cache.match(`lesson-audio-${editingLesson.value.id}`)
    if (!res) return
    const blob = await res.blob()
    const buf = await blob.arrayBuffer()
    const b64 = bufferToBase64(buf)
    editingLesson.value.embeddedAudio = {
      voice: tts.selectedVoice.value,
      generatedAt: new Date().toISOString(),
      data: b64,
    }
    if (audioObjUrl.value) URL.revokeObjectURL(audioObjUrl.value)
    audioObjUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    audioError.value = (err as Error).message
  } finally {
    audioLoading.value = false
  }
}

async function uploadAudio() {
  if (!editingLesson.value) return
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const path = await open({
      multiple: false,
      filters: [{ name: 'Audio files', extensions: ['wav', 'mp3', 'ogg', 'flac'] }],
    })
    if (!path || typeof path !== 'string') return
    const { readFile } = await import('@tauri-apps/plugin-fs')
    const bytes = new Uint8Array(await readFile(path))
    const ext = path.split('.').pop()?.toLowerCase() ?? 'wav'
    const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'ogg' ? 'audio/ogg' : ext === 'flac' ? 'audio/flac' : 'audio/wav'
    const blob = new Blob([bytes], { type: mime })
    const b64 = bufferToBase64(await blob.arrayBuffer())
    editingLesson.value.embeddedAudio = {
      voice: 'uploaded',
      generatedAt: new Date().toISOString(),
      data: b64,
    }
    if (audioObjUrl.value) URL.revokeObjectURL(audioObjUrl.value)
    audioObjUrl.value = URL.createObjectURL(blob)
    await studio.loadEmbeddedAudio(editingLesson.value.id, b64)
  } catch (err) {
    audioError.value = (err as Error).message
  }
}

function clearAudio() {
  if (!editingLesson.value) return
  editingLesson.value.embeddedAudio = null
  if (audioObjUrl.value) URL.revokeObjectURL(audioObjUrl.value)
  audioObjUrl.value = null
  void tts.clearAudio(editingLesson.value.id)
}

// ── Computed ──────────────────────────────────────────────────────────────────

const isGeneratingAudio = computed(() =>
  editingLesson.value ? tts.generatingLessonIds.value.has(editingLesson.value.id) : false
)

const audioProgressMsg = computed(() =>
  editingLesson.value ? tts.progressByLessonId.value[editingLesson.value.id] ?? '' : ''
)

const ttsModelOptions: { value: TTSScriptModel; label: string }[] = [
  { value: 'claude', label: 'Claude Code' },
  { value: 'codex', label: 'Codex' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'ollama', label: 'Ollama' },
]

const voiceOptions = [
  { id: 'af_heart',    label: 'Heart',    accent: 'US F' },
  { id: 'af_bella',    label: 'Bella',    accent: 'US F' },
  { id: 'af_nicole',   label: 'Nicole',   accent: 'US F' },
  { id: 'af_sky',      label: 'Sky',      accent: 'US F' },
  { id: 'am_adam',     label: 'Adam',     accent: 'US M' },
  { id: 'am_michael',  label: 'Michael',  accent: 'US M' },
  { id: 'bf_emma',     label: 'Emma',     accent: 'UK F' },
  { id: 'bf_isabella', label: 'Isabella', accent: 'UK F' },
  { id: 'bm_george',   label: 'George',   accent: 'UK M' },
  { id: 'bm_lewis',    label: 'Lewis',    accent: 'UK M' },
]

// ── Section colors (shared hash-based palette via useAcademySectionColors) ────

const uniqueSections = computed(() => {
  const seen = new Set<string>()
  for (const l of lessons.value) {
    if (l.section) seen.add(l.section)
  }
  return [...seen]
})

const groupedLessons = computed(() => {
  const filtered = sectionFilter.value
    ? lessons.value.filter(l => l.section === sectionFilter.value)
    : lessons.value
  const map = new Map<string, CustomLesson[]>()
  for (const l of filtered) {
    const sec = l.section || 'Unsectioned'
    if (!map.has(sec)) map.set(sec, [])
    map.get(sec)!.push(l)
  }
  return [...map.entries()].map(([name, items]) => ({ name, items }))
})
</script>

<template>
  <div class="flex h-full overflow-hidden bg-[var(--bg)] text-[var(--text)]">

    <!-- ── Left sidebar ─────────────────────────────────────────────────────── -->
    <div class="w-72 shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-surface)]">

      <!-- Header -->
      <div class="px-4 pt-5 pb-3 border-b border-[var(--border)]">
        <div class="flex items-center justify-between mb-3">
          <button
            class="flex items-center gap-1.5 text-[10px] text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
            @click="router.push('/academy')"
          >
            <ChevronLeft class="size-3" /> Back to Academy
          </button>
          <button
            :title="showSettings ? 'Back to lessons' : 'Studio settings'"
            class="size-6 grid place-items-center rounded-md text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors"
            :class="showSettings ? 'text-fuchsia-400 bg-fuchsia-500/10' : ''"
            @click="showSettings = !showSettings; settingsMsg = ''; settingsError = ''"
          >
            <Settings class="size-3.5" />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <BookOpen class="size-4 text-fuchsia-400" />
          <h1 class="text-sm font-semibold text-[var(--text)]">Academy Studio</h1>
          <span class="ml-auto text-[9px] bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/20 rounded px-1.5 py-0.5">SECRET</span>
        </div>
        <p class="text-[10px] text-[var(--text-faint)] mt-1">Create &amp; manage custom lessons</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 p-3 border-b border-[var(--border)]">
        <button
          class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1.5 text-[11px] text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors"
          @click="openNew"
        >
          <Plus class="size-3.5" /> New Lesson
        </button>
        <button
          title="Import .va file"
          class="flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors"
          @click="doImport"
        >
          <Upload class="size-3.5" />
        </button>
      </div>

      <!-- Section filter chips -->
      <div v-if="uniqueSections.length > 1" class="px-3 py-2 border-b border-[var(--border)] flex flex-wrap gap-1">
        <button
          class="rounded-full border px-2 py-0.5 text-[9px] transition-colors"
          :class="sectionFilter === null
            ? 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'
            : 'border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text-muted)]'"
          @click="sectionFilter = null"
        >
          All
        </button>
        <button
          v-for="sec in uniqueSections"
          :key="sec"
          class="rounded-full border px-2 py-0.5 text-[9px] transition-colors"
          :class="[
            getSectionColor(sec).border,
            getSectionColor(sec).bg,
            getSectionColor(sec).color,
            sectionFilter !== sec && 'opacity-60 hover:opacity-100',
          ]"
          @click="sectionFilter = sectionFilter === sec ? null : sec"
        >
          {{ sec }}
        </button>
      </div>

      <!-- Settings panel -->
      <div v-if="showSettings" class="flex-1 overflow-y-auto p-3 space-y-3">
        <p class="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest px-1 mb-1">Studio Settings</p>

        <!-- Feedback -->
        <div v-if="settingsMsg" class="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2">
          <CheckCircle2 class="size-3 text-emerald-400 shrink-0" />
          <p class="text-[10px] text-emerald-300">{{ settingsMsg }}</p>
        </div>
        <div v-if="settingsError" class="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-3 py-2">
          <AlertTriangle class="size-3 text-red-400 shrink-0" />
          <p class="text-[10px] text-red-300">{{ settingsError }}</p>
        </div>

        <!-- Clear -->
        <div class="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3 space-y-2">
          <div class="flex items-center gap-1.5">
            <Eraser class="size-3.5 text-red-400" />
            <p class="text-[11px] font-semibold text-[var(--text)]">Clear AppData</p>
          </div>
          <p class="text-[10px] text-[var(--text-faint)] leading-relaxed">
            Deletes <strong class="text-[var(--text-muted)]">all</strong> <code class="text-[9px]">.va</code> files from your AppData <code class="text-[9px]">course-bin/</code>. Use this to test a clean seed. Cannot be undone.
          </p>
          <button
            :disabled="settingsWorking"
            class="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            @click="showClearModal = true"
          >
            <Loader2 v-if="settingsWorking" class="size-3 animate-spin" />
            <Eraser v-else class="size-3" />
            Clear All VA Files
          </button>
        </div>
      </div>

      <!-- Lesson list -->
      <div v-else class="flex-1 overflow-y-auto py-2">
        <div v-if="loading" class="flex items-center justify-center py-8 text-[var(--text-faint)]">
          <Loader2 class="size-4 animate-spin mr-2" /> Loading…
        </div>
        <div v-else-if="!lessons.length" class="px-4 py-6 text-center">
          <BookOpen class="size-6 text-fuchsia-400/40 mx-auto mb-2" />
          <p class="text-[11px] text-[var(--text-faint)]">No custom lessons yet.</p>
          <p class="text-[10px] text-[var(--text-faint)] mt-0.5">Click "New Lesson" to get started.</p>
        </div>
        <template v-else>
          <div
            v-for="group in groupedLessons"
            :key="group.name"
            class="mb-1 rounded-lg transition-all"
            :class="dragOverSection === group.name && draggingSection !== group.name ? [getSectionColor(group.name).border, 'border-t-2'] : 'border-t-2 border-transparent'"
            @dragover.prevent="onSectionDragOver(group.name)"
            @drop.prevent="onSectionDrop(group.name)"
          >
            <!-- Section header (drag handle + rename) -->
            <div
              :draggable="renamingSection !== group.name"
              class="group/hdr flex items-center gap-2 px-3 py-1.5 mb-0.5 rounded-md select-none transition-opacity"
              :class="[
                renamingSection === group.name ? '' : 'cursor-grab active:cursor-grabbing',
                draggingSection === group.name ? 'opacity-40' : 'hover:bg-[var(--bg-card)]',
              ]"
              @dragstart="renamingSection !== group.name && onSectionDragStart($event, group.name)"
              @dragend="onSectionDragEnd"
            >
              <GripVertical class="size-3 shrink-0 text-[var(--text-faint)]" />
              <span
                class="size-1.5 rounded-full shrink-0"
                :class="getSectionColor(renamingSection === group.name ? renameSectionValue || group.name : group.name).dot"
              />
              <!-- Inline rename input -->
              <template v-if="renamingSection === group.name">
                <input
                  v-model="renameSectionValue"
                  class="flex-1 min-w-0 bg-transparent border-b border-fuchsia-500/50 text-[9px] font-bold uppercase tracking-widest outline-none text-fuchsia-300 pb-px"
                  :class="getSectionColor(group.name).color"
                  @keydown.enter.prevent="commitRenameSection"
                  @keydown.escape.prevent="cancelRenameSection"
                  @blur="commitRenameSection"
                  @click.stop
                  @dragstart.stop
                />
              </template>
              <template v-else>
                <span
                  class="text-[9px] font-bold uppercase tracking-widest truncate flex-1"
                  :class="getSectionColor(group.name).color"
                >{{ group.name }}</span>
              </template>
              <button
                v-if="renamingSection !== group.name"
                title="Rename section"
                class="size-4 grid place-items-center rounded opacity-0 group-hover/hdr:opacity-100 text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-all shrink-0"
                @click.stop="startRenameSection(group.name)"
                @dragstart.stop
              >
                <Pencil class="size-2.5" />
              </button>
              <span class="text-[9px] text-[var(--text-faint)] shrink-0">{{ group.items.length }}</span>
              <Loader2 v-if="reordering" class="size-2.5 animate-spin text-[var(--text-faint)]" />
            </div>
            <!-- Lessons in section -->
            <div class="space-y-0.5 px-2">
              <div
                v-for="lesson in group.items"
                :key="lesson.id"
                class="group rounded-lg border p-2.5 cursor-pointer transition-colors"
                :class="editingLesson?.id === lesson.id
                  ? [getSectionColor(lesson.section).border, getSectionColor(lesson.section).bg]
                  : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-card)]'"
                @click="openEdit(lesson)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <p class="text-[11px] font-medium text-[var(--text)] truncate">{{ lesson.title || '(Untitled)' }}</p>
                    <p class="text-[9px] text-[var(--text-faint)] mt-0.5">{{ lesson.duration }}</p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      title="Export .va"
                      class="size-5 grid place-items-center rounded text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-colors"
                      @click.stop="exportLesson(lesson)"
                    >
                      <Download class="size-3" />
                    </button>
                    <button
                      title="Delete"
                      class="size-5 grid place-items-center rounded text-[var(--text-faint)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      @click.stop="confirmDelete = lesson; showDeleteModal = true"
                    >
                      <Trash2 class="size-3" />
                    </button>
                  </div>
                </div>
                <div class="mt-1 flex items-center flex-wrap gap-x-2 gap-y-0.5">
                  <div v-if="lesson.embeddedAudio" class="flex items-center gap-1">
                    <AudioLines class="size-2.5 text-teal-400" />
                    <span class="text-[9px] text-teal-400">Audio included</span>
                  </div>
                  <div v-if="bundledFilenames.has(lesson.vaFilename)" class="flex items-center gap-1">
                    <Package class="size-2.5 text-amber-400" />
                    <span class="text-[9px] text-amber-400">Bundled</span>
                  </div>
                  <span class="text-[9px] text-[var(--text-faint)] font-mono truncate">{{ lesson.vaFilename }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Error display -->
      <div v-if="saveError" class="p-3 border-t border-red-500/20 bg-red-500/[0.06]">
        <p class="text-[10px] text-red-400 flex items-start gap-1.5">
          <AlertTriangle class="size-3 shrink-0 mt-0.5" />
          {{ saveError }}
        </p>
        <button class="text-[9px] text-red-400/70 hover:text-red-400 mt-1" @click="saveError = ''">Dismiss</button>
      </div>
    </div>

    <!-- ── Editor panel ──────────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Empty state -->
      <div v-if="!editingLesson" class="flex-1 flex flex-col items-center justify-center text-center px-8">
        <BookOpen class="size-10 text-fuchsia-400/30 mb-4" />
        <h2 class="text-sm font-medium text-[var(--text-muted)] mb-1">No lesson selected</h2>
        <p class="text-[11px] text-[var(--text-faint)] max-w-xs mb-4">Select a lesson from the list or create a new one to start editing.</p>
        <button
          class="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors"
          @click="openNew"
        >
          <Plus class="size-3.5" /> New Lesson
        </button>
      </div>

      <!-- Editor -->
      <template v-else>
        <!-- Editor header -->
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
          <div class="flex-1 min-w-0">
            <p class="text-[10px] text-fuchsia-300/60 font-medium uppercase tracking-wide mb-0.5">
              {{ isNew ? 'New lesson' : 'Editing lesson' }}
            </p>
            <p class="text-sm font-semibold text-[var(--text)] truncate">{{ editingLesson.title || '(Untitled)' }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              :disabled="saving"
              class="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors disabled:opacity-50"
              @click="save"
            >
              <Loader2 v-if="saving" class="size-3.5 animate-spin" />
              <Save v-else class="size-3.5" />
              Save
            </button>
            <button
              v-if="!isNew"
              class="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
              @click="exportLesson(editingLesson)"
            >
              <Download class="size-3.5" /> Export .va
            </button>
            <button
              class="size-7 grid place-items-center rounded-lg border border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors"
              @click="cancelEdit"
            >
              <X class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-0.5 px-5 py-2 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
          <button
            v-for="tab in [
              { id: 'metadata', label: 'Metadata', icon: LayoutList },
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'notes', label: 'Agent Notes', icon: NotebookPen },
              { id: 'audio', label: 'Audio', icon: Volume2 },
            ]"
            :key="tab.id"
            class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] transition-colors"
            :class="activeTab === tab.id
              ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/20'
              : 'text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]'"
            @click="activeTab = (tab.id as typeof activeTab)"
          >
            <component :is="tab.icon" class="size-3" />
            {{ tab.label }}
            <span v-if="tab.id === 'audio' && editingLesson.embeddedAudio" class="size-1.5 rounded-full bg-teal-400" />
          </button>
        </div>

        <!-- Tab content -->
        <div class="flex-1 overflow-y-auto p-5">

          <!-- Metadata tab -->
          <div v-if="activeTab === 'metadata'" class="max-w-lg space-y-4">
            <div>
              <label class="block text-[10px] font-medium text-[var(--text-muted)] mb-1">Lesson Title <span class="text-red-400">*</span></label>
              <input
                v-model="editingLesson.title"
                type="text"
                placeholder="e.g. Advanced JWT Security"
                class="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors"
              />
            </div>

            <div>
              <label class="block text-[10px] font-medium text-[var(--text-muted)] mb-1">
                Section <span class="text-[var(--text-faint)] font-normal">— groups lessons in the Academy</span>
              </label>
              <!-- Existing section quick-picks -->
              <div v-if="uniqueSections.length" class="flex flex-wrap gap-1 mb-2">
                <button
                  v-for="sec in uniqueSections"
                  :key="sec"
                  class="rounded-full border px-2.5 py-0.5 text-[9px] transition-colors"
                  :class="editingLesson.section === sec
                    ? [getSectionColor(sec).border, getSectionColor(sec).bg, getSectionColor(sec).color]
                    : 'border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text)] hover:border-[var(--border)]'"
                  @click="editingLesson.section = sec"
                >{{ sec }}</button>
              </div>
              <!-- Free text + datalist for new section -->
              <input
                v-model="editingLesson.section"
                type="text"
                list="studio-section-list"
                :placeholder="uniqueSections.length ? 'Pick above or type a new section name…' : 'e.g. Security Engineering Bootcamp…'"
                class="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors"
              />
              <datalist id="studio-section-list">
                <option v-for="sec in uniqueSections" :key="sec" :value="sec" />
              </datalist>
              <p class="text-[9px] text-[var(--text-faint)] mt-1">Lessons with the same section name are grouped together. Pick an existing section or type a new name.</p>
            </div>

            <div>
              <label class="block text-[10px] font-medium text-[var(--text-muted)] mb-1">Duration</label>
              <input
                v-model="editingLesson.duration"
                type="text"
                placeholder="e.g. 30 min"
                class="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] font-medium text-[var(--text-muted)]">Learning Objectives</label>
                <button
                  class="text-[9px] text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                  @click="addObjective"
                >
                  + Add
                </button>
              </div>
              <div class="space-y-1.5">
                <div
                  v-for="(obj, i) in editingLesson.objectives"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <input
                    :value="obj"
                    type="text"
                    :placeholder="`Objective ${i + 1}`"
                    class="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors"
                    @input="updateObjective(i, ($event.target as HTMLInputElement).value)"
                  />
                  <button
                    class="size-5 grid place-items-center text-[var(--text-faint)] hover:text-red-400 transition-colors"
                    @click="removeObjective(i)"
                  >
                    <X class="size-3" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-medium text-[var(--text-muted)] mb-1">Lab Hint <span class="text-[var(--text-faint)]">(optional)</span></label>
              <textarea
                v-model="editingLesson.labHint"
                rows="3"
                placeholder="Practical exercise hint for learners…"
                class="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors"
              />
            </div>
          </div>

          <!-- Content tab -->
          <div v-else-if="activeTab === 'content'" class="h-full flex flex-col" style="min-height: 60vh;">
            <StudioMarkdownEditor
              v-model="editingLesson.content"
              placeholder="Write your lesson content in markdown…"
              class="flex-1"
            />
          </div>

          <!-- Agent Notes tab -->
          <div v-else-if="activeTab === 'notes'" class="max-w-2xl space-y-3">
            <div class="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/[0.06] px-4 py-3">
              <div class="flex items-start gap-2">
                <Info class="size-3.5 shrink-0 mt-0.5 text-fuchsia-400" />
                <div class="text-[10px] text-fuchsia-200/70 leading-relaxed">
                  <strong class="text-fuchsia-200/90">Agent notes</strong> are injected into the AI Professor's system prompt when a student opens this lesson in AI-assisted mode. Use them to provide background context, teaching objectives, common misconceptions, or hints that guide the professor's responses.
                </div>
              </div>
            </div>
            <textarea
              v-model="editingLesson.agentNotes"
              rows="20"
              placeholder="Example: This lesson covers JWT vulnerabilities. Key teaching points: alg:none attack, weak secret brute-force, kid injection. The professor should ask students to identify the vulnerability in code snippets before explaining the fix."
              class="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors leading-relaxed"
            />
          </div>

          <!-- Audio tab -->
          <div v-else-if="activeTab === 'audio'" class="max-w-lg space-y-4">

            <!-- Existing audio player -->
            <div v-if="audioObjUrl" class="rounded-xl border border-teal-500/20 bg-teal-500/[0.06] p-4">
              <div class="flex items-center gap-2 mb-2">
                <Music class="size-3.5 text-teal-400" />
                <span class="text-[11px] font-medium text-teal-300">Audio narration</span>
                <span class="text-[9px] text-teal-400/60 ml-auto">
                  {{ editingLesson.embeddedAudio?.voice ?? '' }}
                </span>
              </div>
              <audio :src="audioObjUrl" controls class="w-full h-8 rounded" />
              <button
                class="mt-2 text-[10px] text-red-400/70 hover:text-red-400 transition-colors"
                @click="clearAudio"
              >
                Remove audio
              </button>
            </div>

            <!-- Generation progress -->
            <div
              v-if="isGeneratingAudio"
              class="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3 flex items-center gap-2"
            >
              <Loader2 class="size-3.5 animate-spin text-indigo-400 shrink-0" />
              <span class="text-[11px] text-indigo-200/80">{{ audioProgressMsg || 'Generating…' }}</span>
            </div>

            <!-- Audio error -->
            <div
              v-if="audioError"
              class="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 flex items-start gap-2"
            >
              <AlertTriangle class="size-3.5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p class="text-[11px] text-red-300">{{ audioError }}</p>
                <button class="text-[9px] text-red-400/70 hover:text-red-400 mt-1" @click="audioError = ''">Dismiss</button>
              </div>
            </div>

            <!-- Tip: complete Metadata + Content first -->
            <div class="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2.5 flex items-start gap-2">
              <Info class="size-3.5 shrink-0 mt-0.5 text-amber-400/70" />
              <p class="text-[10px] text-amber-200/60 leading-relaxed">
                Complete the <strong class="text-amber-200/80">Metadata</strong> and <strong class="text-amber-200/80">Content</strong> tabs before generating audio. The narration script is derived from the lesson title and content.
              </p>
            </div>

            <!-- Generate section -->
            <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
              <h3 class="text-[11px] font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Mic class="size-3.5 text-teal-400" />
                Generate with TTS
              </h3>
              <p class="text-[10px] text-[var(--text-faint)] leading-relaxed">
                An AI model will convert the lesson content into a spoken narration script, then Kokoro TTS synthesizes the audio. Requires Kokoro model files downloaded in AI Models.
              </p>

              <div>
                <label class="block text-[10px] text-[var(--text-muted)] mb-1">Script model</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="opt in ttsModelOptions"
                    :key="opt.value"
                    class="rounded-md border px-2 py-1 text-[10px] transition-colors"
                    :class="ttsModel === opt.value
                      ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                      : 'border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]'"
                    @click="ttsModel = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-[10px] text-[var(--text-muted)] mb-1.5">Voice</label>
                <div class="grid grid-cols-5 gap-1">
                  <button
                    v-for="v in voiceOptions"
                    :key="v.id"
                    class="rounded-md border px-1.5 py-1.5 text-center transition-colors"
                    :class="tts.selectedVoice.value === v.id
                      ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                      : 'border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)]'"
                    @click="tts.setVoice(v.id)"
                  >
                    <p class="text-[10px] font-medium truncate">{{ v.label }}</p>
                    <p class="text-[9px] text-[var(--text-faint)]">{{ v.accent }}</p>
                  </button>
                </div>
              </div>

              <button
                :disabled="isGeneratingAudio || !editingLesson.title"
                class="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-[11px] text-teal-300 hover:bg-teal-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="generateAudio"
              >
                <Loader2 v-if="isGeneratingAudio" class="size-3.5 animate-spin" />
                <Mic v-else class="size-3.5" />
                {{ audioObjUrl ? 'Regenerate' : 'Generate Audio' }}
              </button>
            </div>

            <!-- Upload section -->
            <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-2">
              <h3 class="text-[11px] font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Upload class="size-3.5 text-violet-400" />
                Upload audio file
              </h3>
              <p class="text-[10px] text-[var(--text-faint)]">WAV, MP3, OGG, or FLAC. The audio will be embedded in the exported .va file.</p>
              <button
                class="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-colors"
                @click="uploadAudio"
              >
                <Upload class="size-3.5" /> Choose File
              </button>
            </div>
          </div>

        </div>

        <!-- Bottom save bar -->
        <div class="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]">
          <p v-if="saveError" class="text-[10px] text-red-400 flex items-center gap-1">
            <AlertTriangle class="size-3" /> {{ saveError }}
          </p>
          <div v-else-if="isNew" class="text-[10px] text-[var(--text-faint)]">Unsaved lesson</div>
          <div v-else class="flex items-center gap-2 min-w-0">
            <div v-if="bundledFilenames.has(editingLesson.vaFilename)" class="flex items-center gap-1 shrink-0">
              <Package class="size-3 text-amber-400" />
              <span class="text-[10px] text-amber-400 font-medium">Bundled</span>
              <span class="text-[10px] text-amber-400/50">— saving overwrites the seeded copy</span>
            </div>
            <span class="text-[10px] text-[var(--text-faint)] font-mono truncate">course-bin/{{ editingLesson.vaFilename }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              :disabled="saving"
              class="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors disabled:opacity-50"
              @click="save"
            >
              <Loader2 v-if="saving" class="size-3.5 animate-spin" />
              <Save v-else class="size-3.5" />
              Save
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- ── Clear AppData confirm modal ───────────────────────────────────────── -->
    <GlassModal v-model="showClearModal" title="Clear AppData Course-Bin">
      <p class="text-sm text-[var(--text-muted)] mb-4">
        This will delete <strong class="text-red-300">all</strong> <code class="text-xs">.va</code> files from your AppData course-bin. Any lessons you haven't exported will be permanently lost.
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
          @click="showClearModal = false"
        >Cancel</button>
        <button
          class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] text-red-300 hover:bg-red-500/20 transition-colors"
          @click="doClear"
        >Clear All</button>
      </div>
    </GlassModal>

    <!-- ── Save target modal ──────────────────────────────────────────────────── -->
    <GlassModal v-model="showSaveModal" :title="pendingAction.type === 'save-lesson' ? 'Save Lesson' : 'Rename Section'">
      <p class="text-xs text-[var(--text-muted)] mb-4">
        {{ pendingAction.type === 'save-lesson' ? 'Where should this lesson be saved?' : 'Where should this rename be applied?' }}
      </p>

      <div class="space-y-2 mb-5">
        <!-- AppData -->
        <label
          class="flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors"
          :class="saveTarget === 'appdata'
            ? 'border-fuchsia-500/40 bg-fuchsia-500/10'
            : 'border-[var(--border)] hover:bg-[var(--bg-card)]'"
        >
          <input v-model="saveTarget" type="radio" value="appdata" class="mt-0.5 accent-fuchsia-500" />
          <div>
            <p class="text-[11px] font-semibold text-[var(--text)]">AppData only</p>
            <p class="text-[10px] text-[var(--text-faint)] mt-0.5 leading-relaxed">
              Saves to your personal course-bin (<code class="text-[9px]">AppData/course-bin/</code>).
              This is the default for new lessons.
            </p>
          </div>
        </label>

        <!-- Bundled -->
        <label
          class="flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors"
          :class="saveTarget === 'bundled'
            ? 'border-amber-500/40 bg-amber-500/10'
            : 'border-[var(--border)] hover:bg-[var(--bg-card)]'"
        >
          <input v-model="saveTarget" type="radio" value="bundled" class="mt-0.5 accent-amber-500" />
          <div>
            <p class="text-[11px] font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Package class="size-3 text-amber-400" /> Bundled only
            </p>
            <p class="text-[10px] text-[var(--text-faint)] mt-0.5 leading-relaxed">
              Overwrites the shipped copy in <code class="text-[9px]">resourceDir/course-bin/</code>.
              New users will receive this version on first launch.
            </p>
          </div>
        </label>

        <!-- Both -->
        <label
          class="flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors"
          :class="saveTarget === 'both'
            ? 'border-indigo-500/40 bg-indigo-500/10'
            : 'border-[var(--border)] hover:bg-[var(--bg-card)]'"
        >
          <input v-model="saveTarget" type="radio" value="both" class="mt-0.5 accent-indigo-500" />
          <div>
            <p class="text-[11px] font-semibold text-[var(--text)]">Both</p>
            <p class="text-[10px] text-[var(--text-faint)] mt-0.5 leading-relaxed">
              Saves to AppData <em>and</em> updates the bundled copy.
              Recommended when editing a bundled lesson.
            </p>
          </div>
        </label>
      </div>

      <div class="mb-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
        <p v-if="pendingAction.type === 'save-lesson' && editingLesson" class="text-[9px] text-[var(--text-faint)] font-mono">
          {{ editingLesson.vaFilename || `${editingLesson.id}.va` }}
        </p>
        <p v-else-if="pendingAction.type === 'rename-section'" class="text-[9px] text-[var(--text-faint)]">
          <span class="font-mono text-[var(--text-muted)]">{{ pendingAction.oldName }}</span>
          <span class="mx-1.5">→</span>
          <span class="font-mono text-fuchsia-300">{{ pendingAction.newName }}</span>
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <button
          class="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
          @click="showSaveModal = false"
        >
          Cancel
        </button>
        <button
          class="flex items-center gap-1.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors"
          @click="confirmSave"
        >
          <Save class="size-3.5" /> Save
        </button>
      </div>
    </GlassModal>

    <!-- ── Delete confirm modal ─────────────────────────────────────────────── -->
    <GlassModal v-model="showDeleteModal" title="Delete Lesson">
      <p class="text-sm text-[var(--text-muted)] mb-4">
        Delete <strong class="text-[var(--text)]">{{ confirmDelete?.title }}</strong> from course-bin? This cannot be undone.
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
          @click="showDeleteModal = false; confirmDelete = null"
        >
          Cancel
        </button>
        <button
          class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] text-red-300 hover:bg-red-500/20 transition-colors"
          @click="confirmDelete && doDelete(confirmDelete)"
        >
          Delete
        </button>
      </div>
    </GlassModal>

  </div>
</template>
