<script setup lang="ts">
import type { Ticket } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'

const props = defineProps<{
  ticket: Ticket
  dragging?: boolean
}>()

const projects = useProjectsStore()
const projectCode = computed(() => projects.activeProject?.code ?? '')
const { openTicket } = useTicketDetail()

const typeAccent: Record<string, string> = {
  feature: 'bg-blue-500',
  bug: 'bg-red-500',
  fix: 'bg-amber-500',
  chore: 'bg-slate-500',
  spike: 'bg-violet-500',
}

const typeColors: Record<string, string> = {
  feature: 'bg-blue-500/15 text-blue-300',
  bug: 'bg-red-500/15 text-red-300',
  fix: 'bg-amber-500/15 text-amber-300',
  chore: 'bg-slate-500/15 text-slate-400',
  spike: 'bg-violet-500/15 text-violet-300',
}

const priorityLabel: Record<string, { text: string; cls: string }> = {
  critical: { text: '● Critical', cls: 'text-red-400' },
  high:     { text: '● High',     cls: 'text-amber-400' },
  medium:   { text: '● Medium',   cls: 'text-blue-400' },
  low:      { text: '● Low',      cls: 'text-white/25' },
}

// Distinguish click from drag: only open detail if the mouse didn't move
let mouseDownX = 0
let mouseDownY = 0

function onMouseDown(e: MouseEvent) {
  mouseDownX = e.clientX
  mouseDownY = e.clientY
}

function onMouseUp(e: MouseEvent) {
  const dx = Math.abs(e.clientX - mouseDownX)
  const dy = Math.abs(e.clientY - mouseDownY)
  if (dx < 5 && dy < 5) {
    openTicket(props.ticket.id)
  }
}
</script>

<template>
  <div
    class="relative pl-3 pr-3 py-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] cursor-grab active:cursor-grabbing select-none transition-all overflow-hidden"
    :class="dragging
      ? 'opacity-40'
      : 'hover:border-white/20 hover:bg-white/[0.05] hover:ring-1 hover:ring-indigo-500/30'"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <!-- Left accent bar -->
    <div
      class="absolute left-0 inset-y-0 w-0.5"
      :class="typeAccent[ticket.type] ?? 'bg-white/20'"
    />

    <!-- Type + Priority row -->
    <div class="flex items-center justify-between gap-2 mb-2">
      <span
        class="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide shrink-0"
        :class="typeColors[ticket.type] ?? 'bg-white/10 text-white/40'"
      >
        {{ ticket.type }}
      </span>
      <span
        class="text-[10px] font-medium truncate"
        :class="priorityLabel[ticket.priority]?.cls ?? 'text-white/25'"
      >
        {{ priorityLabel[ticket.priority]?.text ?? ticket.priority }}
      </span>
    </div>

    <!-- Title -->
    <p class="text-sm text-[var(--text)] font-medium leading-snug break-words">{{ ticket.title }}</p>

    <!-- Description -->
    <p v-if="ticket.description" class="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
      {{ ticket.description }}
    </p>

    <!-- Labels -->
    <div v-if="ticket.labels?.length" class="flex flex-wrap gap-1 mt-2">
      <span
        v-for="label in ticket.labels"
        :key="label"
        class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[var(--text-muted)]"
      >
        {{ label }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
      <span class="text-[10px] text-indigo-400/70 font-mono">
        {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 8) }}
      </span>
      <span class="text-[10px] text-[var(--text-faint)]">{{ formatRelative(ticket.createdAt) }}</span>
    </div>
  </div>
</template>
