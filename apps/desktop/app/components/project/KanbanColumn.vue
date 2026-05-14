<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { Ticket, TicketStatus, TicketType, TicketPriority } from '~/types/vindicta'

const props = defineProps<{
  status: TicketStatus
  label: string
  tickets: Ticket[]
  accent?: string
}>()

const emit = defineEmits<{
  drop: [id: string, status: TicketStatus]
}>()

const kanban = useKanbanStore()

const isDragOver = ref(false)
const showModal = ref(false)

function onDragStart(e: DragEvent, id: string) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }
  kanban.draggingId = id
}

function onDragEnd() {
  kanban.draggingId = null
  isDragOver.value = false
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
}

function onDragLeave(e: DragEvent) {
  const related = e.relatedTarget as Node | null
  if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
    isDragOver.value = false
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  const id = e.dataTransfer?.getData('text/plain') || kanban.draggingId
  if (id) emit('drop', id, props.status)
  kanban.draggingId = null
}

async function submitCreate(data: { title: string; type: TicketType; priority: TicketPriority; description: string; labels: string[] }) {
  await kanban.createTicket({
    title: data.title,
    type: data.type,
    priority: data.priority,
    description: data.description,
    labels: data.labels,
    status: props.status,
  }, 'local')
}
</script>

<template>
  <div
    class="flex min-w-0 flex-col glass rounded-xl transition-colors"
    :class="isDragOver ? 'border-indigo-500/50 bg-indigo-500/5' : ''"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Column header -->
    <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border)]">
      <div class="flex items-center gap-2">
        <div class="size-2 rounded-full" :class="accent ?? 'bg-white/30'" />
        <span class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{{ label }}</span>
        <span class="text-xs bg-white/10 rounded-full px-1.5 py-0.5 text-[var(--text-faint)]">{{ tickets.length }}</span>
      </div>
      <button
        class="size-6 flex items-center justify-center rounded text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-white/10 transition-colors"
        @click="showModal = true"
      >
        <Plus class="size-3.5" />
      </button>
    </div>

    <!-- Cards — drag events here too so the scroll area is a full drop zone -->
    <div
      class="flex-1 p-3 space-y-2 overflow-y-auto custom-scroll"
      @dragover.prevent.stop="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent.stop="onDrop"
    >
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        draggable="true"
        class="touch-none"
        @dragstart="onDragStart($event, ticket.id)"
        @dragend="onDragEnd"
      >
        <KanbanCard
          :ticket="ticket"
          :dragging="kanban.draggingId === ticket.id"
        />
      </div>

      <!-- Empty drop zone hint -->
      <div
        v-if="tickets.length === 0"
        class="h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors"
        :class="isDragOver ? 'border-indigo-500/60 text-indigo-400' : 'border-white/[0.08] text-white/20'"
      >
        <span class="text-xs">{{ isDragOver ? 'Drop here' : 'No tickets' }}</span>
      </div>
    </div>
  </div>

  <!-- Ticket creation modal -->
  <TicketModal
    v-model="showModal"
    :modal-title="`New ${label} ticket`"
    @submit="submitCreate"
  />
</template>
