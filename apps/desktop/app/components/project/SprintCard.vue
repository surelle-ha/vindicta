<script setup lang="ts">
import { GripVertical, CheckCircle2, Circle } from 'lucide-vue-next'
import type { Ticket } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  markDone: [id: string]
}>()

const projects = useProjectsStore()
const { openTicket } = useTicketDetail()

const ticketLabel = computed(() => {
  if (projects.activeProject?.code && propsTicket.value.number) {
    return ticketKey(projects.activeProject.code, propsTicket.value.number)
  }
  return propsTicket.value.number ? `#${propsTicket.value.number}` : propsTicket.value.id.slice(0, 8)
})

const propsTicket = computed(() => props.ticket)

const statusVariant = computed(() => {
  if (propsTicket.value.status === 'done') return 'success'
  if (propsTicket.value.status === 'cancelled') return 'danger'
  if (propsTicket.value.status === 'in_progress' || propsTicket.value.status === 'in_review') return 'info'
  if (propsTicket.value.status === 'todo') return 'purple'
  return 'default'
})

const priorityVariant = computed(() => {
  if (propsTicket.value.priority === 'critical' || propsTicket.value.priority === 'high') return 'danger'
  if (propsTicket.value.priority === 'medium') return 'warning'
  return 'default'
})

function prettyStatus(value: string) {
  return value.replace(/_/g, ' ')
}
</script>

<template>
  <div class="flex items-start gap-3 glass-sm p-3 rounded-lg group">
    <GripVertical class="size-4 text-white/20 shrink-0 cursor-grab" />

    <button
      class="mt-0.5 shrink-0 cursor-pointer"
      @click="ticket.status !== 'done' && emit('markDone', ticket.id)"
    >
      <CheckCircle2
        v-if="ticket.status === 'done'"
        class="size-4 text-emerald-400"
      />
      <Circle
        v-else
        class="size-4 text-white/25 hover:text-white/50 transition-colors"
      />
    </button>

    <button
      class="min-w-0 flex-1 cursor-pointer text-left"
      @click="openTicket(ticket.id)"
    >
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="font-mono text-[10px] text-white/35">{{ ticketLabel }}</span>
        <span class="font-mono text-[10px] text-white/20">{{ ticket.id.slice(0, 8) }}</span>
        <GlassBadge :variant="statusVariant" size="sm">{{ prettyStatus(ticket.status) }}</GlassBadge>
        <GlassBadge :variant="priorityVariant" size="sm">{{ ticket.priority }}</GlassBadge>
      </div>
      <p
        class="mt-1 truncate text-sm text-white"
        :class="ticket.status === 'done' ? 'line-through text-white/30' : ''"
      >
        {{ ticket.title }}
      </p>
      <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/40">
        {{ ticket.description || 'No description provided.' }}
      </p>
    </button>

    <GlassBadge class="mt-0.5 shrink-0" :variant="ticket.type === 'bug' ? 'danger' : ticket.type === 'feature' ? 'info' : 'default'" size="sm">
      {{ ticket.type }}
    </GlassBadge>
  </div>
</template>
