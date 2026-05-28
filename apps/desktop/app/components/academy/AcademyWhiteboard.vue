<script setup lang="ts">
import { ChartSpline, Move, RefreshCw, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-vue-next'
import mermaid from 'mermaid'

type WhiteboardItem = {
  id: string
  type: 'diagram'
  title: string
  content: string
  createdAt: string
}

const props = defineProps<{
  items: WhiteboardItem[]
  selectedId: string
}>()

const emit = defineEmits<{
  close: []
  select: [id: string]
}>()

const viewportRef = ref<HTMLDivElement | null>(null)
const diagramRef = ref<HTMLDivElement | null>(null)
const renderError = ref('')
const rendering = ref(false)
const scale = ref(1)
const pan = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
let initialized = false
let dragStartX = 0
let dragStartY = 0

const activeItem = computed(() =>
  props.items.find(item => item.id === props.selectedId) ?? props.items[0] ?? null,
)

const diagramTransform = computed(() => ({
  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.value})`,
}))

function clampScale(value: number) {
  return Math.min(3, Math.max(0.35, value))
}

function resetView() {
  scale.value = 1
  pan.x = 0
  pan.y = 0
}

function zoomBy(delta: number) {
  scale.value = clampScale(Number((scale.value + delta).toFixed(2)))
}

function onWheel(e: WheelEvent) {
  scale.value = clampScale(Number((scale.value + (e.deltaY > 0 ? -0.08 : 0.08)).toFixed(2)))
}

function startPan(e: PointerEvent) {
  if (e.button !== 0 || renderError.value || rendering.value) return
  isDragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  viewportRef.value?.setPointerCapture(e.pointerId)
}

function movePan(e: PointerEvent) {
  if (!isDragging.value) return
  pan.x += e.clientX - dragStartX
  pan.y += e.clientY - dragStartY
  dragStartX = e.clientX
  dragStartY = e.clientY
}

function stopPan(e: PointerEvent) {
  if (!isDragging.value) return
  isDragging.value = false
  if (viewportRef.value?.hasPointerCapture(e.pointerId)) {
    viewportRef.value.releasePointerCapture(e.pointerId)
  }
}

async function renderDiagram() {
  renderError.value = ''
  if (!activeItem.value) {
    rendering.value = false
    if (diagramRef.value) diagramRef.value.innerHTML = ''
    return
  }

  rendering.value = true
  resetView()

  let svgContent = ''
  try {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#4338ca',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: '#6366f1',
          lineColor: '#64748b',
          secondaryColor: '#1e1b4b',
          tertiaryColor: '#0f172a',
          edgeLabelBackground: '#1e293b',
          nodeBorder: '#6366f1',
          clusterBkg: '#0f172a',
          titleColor: '#e2e8f0',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
      })
      initialized = true
    }
    const id = 'wb-' + Math.random().toString(36).slice(2, 9)
    const { svg } = await mermaid.render(id, activeItem.value.content)
    svgContent = svg
  }
  catch (e: unknown) {
    renderError.value = e instanceof Error ? e.message : 'Failed to render diagram'
  }
  finally {
    rendering.value = false
  }

  if (svgContent) {
    await nextTick()
    if (diagramRef.value) {
      diagramRef.value.innerHTML = svgContent
      const svgEl = diagramRef.value.querySelector('svg')
      if (svgEl) {
        svgEl.style.maxWidth = 'none'
        svgEl.style.height = 'auto'
        const viewBox = svgEl.getAttribute('viewBox')?.split(/\s+/).map(Number)
        if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) {
          svgEl.style.width = `${viewBox[2]}px`
          svgEl.style.height = `${viewBox[3]}px`
        }
        svgEl.removeAttribute('height')
      }
    }
  }
}

onUnmounted(() => {
  isDragging.value = false
})

onMounted(() => void renderDiagram())
watch(() => [activeItem.value?.id, activeItem.value?.content, activeItem.value?.type], () => void renderDiagram())
</script>

<template>
  <div class="flex h-full overflow-hidden bg-[var(--bg-surface)] border-b border-teal-500/20">
    <aside class="flex w-56 shrink-0 flex-col border-r border-teal-500/15 bg-black/15">
      <div class="flex shrink-0 items-center gap-2 border-b border-teal-500/15 px-3 py-2">
        <span class="flex-1 text-[11px] font-semibold uppercase tracking-widest text-teal-300">Visuals</span>
      </div>

      <div class="flex-1 space-y-1 overflow-y-auto p-2 custom-scroll">
        <button
          v-for="item in items"
          :key="item.id"
          class="flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors"
          :class="activeItem?.id === item.id
            ? 'border-teal-500/30 bg-teal-500/10 text-teal-200'
            : 'border-transparent text-[var(--text-faint)] hover:border-white/10 hover:bg-white/[0.04] hover:text-[var(--text-muted)]'"
          @click="emit('select', item.id)"
        >
          <ChartSpline class="size-3.5 shrink-0" />
          <span class="min-w-0 flex-1 truncate text-[11px] font-medium">{{ item.title }}</span>
        </button>

        <div v-if="!items.length" class="grid h-full min-h-40 place-items-center px-4 text-center">
          <p class="text-[11px] leading-relaxed text-[var(--text-faint)]">Professor-generated visuals will appear here.</p>
        </div>
      </div>
    </aside>

    <section class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div class="flex shrink-0 items-center gap-2 border-b border-teal-500/15 px-3 py-2">
        <div class="size-2 rounded-full bg-teal-400 shrink-0" />
        <span class="flex-1 truncate text-[11px] font-semibold uppercase tracking-widest text-teal-300">
          {{ activeItem?.title ?? 'Whiteboard' }}
        </span>
        <div class="flex items-center gap-1 rounded border border-white/10 bg-white/[0.03] p-0.5">
          <button
            class="flex size-6 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-40"
            title="Zoom out"
            :disabled="scale <= 0.35"
            @click="zoomBy(-0.15)"
          >
            <ZoomOut class="size-3" />
          </button>
          <span class="min-w-9 text-center text-[10px] tabular-nums text-[var(--text-faint)]">{{ Math.round(scale * 100) }}%</span>
          <button
            class="flex size-6 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-40"
            title="Zoom in"
            :disabled="scale >= 3"
            @click="zoomBy(0.15)"
          >
            <ZoomIn class="size-3" />
          </button>
        </div>
        <button
          class="flex size-6 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
          title="Reset view"
          @click="resetView"
        >
          <RotateCcw class="size-3" />
        </button>
        <button
          class="flex size-6 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-40"
          title="Refresh diagram"
          :disabled="rendering"
          @click="renderDiagram"
        >
          <RefreshCw class="size-3" :class="rendering ? 'animate-spin' : ''" />
        </button>
        <button
          class="flex size-6 items-center justify-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
          title="Close whiteboard"
          @click="emit('close')"
        >
          <X class="size-3.5" />
        </button>
      </div>

      <div
        ref="viewportRef"
        class="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.12)_1px,transparent_0)] bg-[length:22px_22px] p-4 touch-none"
        :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
        @pointerdown="startPan"
        @pointermove="movePan"
        @pointerup="stopPan"
        @pointercancel="stopPan"
        @wheel.prevent="onWheel"
      >
        <div v-if="rendering" class="flex h-full items-center justify-center text-xs text-[var(--text-faint)]">
          Rendering...
        </div>
        <div v-else-if="renderError" class="rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-300 whitespace-pre-wrap">
          {{ renderError }}
        </div>
        <div
          v-else
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            ref="diagramRef"
            class="origin-center select-none"
            :style="diagramTransform"
          />
        </div>
        <div class="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded border border-white/10 bg-black/25 px-2 py-1 text-[10px] text-[var(--text-faint)] backdrop-blur">
          <Move class="size-3" />
        </div>
      </div>
    </section>
  </div>
</template>
