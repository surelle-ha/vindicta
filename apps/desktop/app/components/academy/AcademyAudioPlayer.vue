<script setup lang="ts">
import { Pause, Play, Volume2, X } from 'lucide-vue-next'

const props = defineProps<{
  src: string
  lessonTitle: string
  compact?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const audioRef   = ref<HTMLAudioElement | null>(null)
const playing    = ref(false)
const currentTime = ref(0)
const duration   = ref(0)
const progressEl = ref<HTMLElement | null>(null)

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs) || secs <= 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const progressPercent = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
)

function toggle() {
  const a = audioRef.value
  if (!a) return
  if (playing.value) { a.pause() }
  else { void a.play() }
}

function onPlay()           { playing.value = true }
function onPause()          { playing.value = false }
function onEnded()          { playing.value = false; currentTime.value = 0 }
function onTimeUpdate()     { currentTime.value = audioRef.value?.currentTime ?? 0 }
function onLoadedMetadata() { duration.value = audioRef.value?.duration ?? 0 }

function seekByClick(e: MouseEvent) {
  const bar = progressEl.value
  const a   = audioRef.value
  if (!bar || !a || !duration.value) return
  const rect  = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  a.currentTime = ratio * duration.value
}

// Auto-play and reset when src changes
watch(() => props.src, async (newSrc) => {
  if (!newSrc) return
  await nextTick()
  const a = audioRef.value
  if (!a) return
  a.src = newSrc
  a.load()
  playing.value    = false
  currentTime.value = 0
  duration.value   = 0
  void a.play().catch(() => {})
})

onMounted(() => {
  const a = audioRef.value
  if (!a || !props.src) return
  void a.play().catch(() => {})
})

onBeforeUnmount(() => {
  audioRef.value?.pause()
})
</script>

<template>
  <div
    class="overflow-hidden border border-teal-500/20 bg-[var(--bg-surface)] backdrop-blur-md"
    :class="compact
      ? 'w-64 rounded-lg shadow-lg shadow-black/20'
      : 'fixed bottom-6 right-6 z-[150] w-72 rounded-2xl shadow-2xl shadow-black/50'"
  >
    <!-- Hidden audio element -->
    <audio
      ref="audioRef"
      :src="src"
      preload="metadata"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <div v-if="compact" class="flex h-8 items-center gap-2 px-2">
      <button
        class="grid size-6 shrink-0 place-items-center rounded-md border border-teal-500/25 bg-teal-500/10 transition-all hover:bg-teal-500/20 active:scale-95"
        :title="playing ? 'Pause narration' : 'Play narration'"
        @click="toggle"
      >
        <Pause v-if="playing" class="size-3.5 text-teal-300" />
        <Play v-else class="size-3.5 translate-x-px text-teal-300" />
      </button>
      <div
        ref="progressEl"
        class="h-1 min-w-16 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/[0.08]"
        @click="seekByClick"
      >
        <div class="h-full rounded-full bg-teal-500 transition-none" :style="{ width: progressPercent + '%' }" />
      </div>
      <span class="w-16 shrink-0 text-right text-[9px] text-[var(--text-faint)]">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
      <button
        class="grid size-6 shrink-0 place-items-center rounded-md text-[var(--text-faint)] transition-colors hover:bg-white/[0.07] hover:text-[var(--text)]"
        title="Close player"
        @click="emit('close')"
      >
        <X class="size-3.5" />
      </button>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="flex items-center gap-2.5 border-b border-teal-500/10 px-4 py-2.5">
      <div class="grid size-7 shrink-0 place-items-center rounded-lg border border-teal-500/20 bg-teal-500/10">
        <Volume2 class="size-3.5 text-teal-300" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="truncate text-[11px] font-semibold text-[var(--text)]">{{ lessonTitle }}</p>
        <p class="text-[9px] text-[var(--text-faint)]">Narration · Kokoro TTS</p>
      </div>
      <button
        class="grid size-6 shrink-0 place-items-center rounded-lg text-[var(--text-faint)] transition-colors hover:bg-white/[0.07] hover:text-[var(--text)]"
        title="Close player"
        @click="emit('close')"
      >
        <X class="size-3.5" />
      </button>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3 px-4 py-3">
      <!-- Play / Pause -->
      <button
        class="grid size-9 shrink-0 place-items-center rounded-full border border-teal-500/30 bg-teal-500/15 transition-all hover:bg-teal-500/25 active:scale-95"
        :title="playing ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <Pause v-if="playing" class="size-4 text-teal-300" />
        <Play  v-else          class="size-4 translate-x-px text-teal-300" />
      </button>

      <!-- Progress + timestamps -->
      <div class="flex-1 space-y-1.5">
        <div
          ref="progressEl"
          class="h-1 w-full cursor-pointer overflow-hidden rounded-full bg-white/[0.08]"
          @click="seekByClick"
        >
          <div
            class="h-full rounded-full bg-teal-500 transition-none"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
        <div class="flex justify-between text-[9px] text-[var(--text-faint)]">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
