<script setup lang="ts">
import { GripVertical, CheckCircle2, Circle } from 'lucide-vue-next'
import type { Ticket } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'

defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  markDone: [id: string]
}>()

const projects = useProjectsStore()
const { openTicket } = useTicketDetail()

const statusIcon = computed(() => ({
  done: CheckCircle2,
  cancelled: CheckCircle2,
}))
</script>

<template>
  <div class="flex items-center gap-3 glass-sm p-3 rounded-lg group">
    <GripVertical class="size-4 text-white/20 shrink-0 cursor-grab" />

    <button
      class="shrink-0"
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
      class="flex-1 min-w-0 text-left"
      @click="openTicket(ticket.id)"
    >
      <span
        v-if="projects.activeProject?.code && ticket.number"
        class="text-[10px] font-mono text-white/30 block"
      >
        {{ ticketKey(projects.activeProject.code, ticket.number) }}
      </span>
      <span
        class="text-sm text-white block truncate"
        :class="ticket.status === 'done' ? 'line-through text-white/30' : ''"
      >
        {{ ticket.title }}
      </span>
    </button>

    <GlassBadge :variant="ticket.type === 'bug' ? 'danger' : ticket.type === 'feature' ? 'info' : 'default'" size="sm">
      {{ ticket.type }}
    </GlassBadge>
  </div>
</template>
