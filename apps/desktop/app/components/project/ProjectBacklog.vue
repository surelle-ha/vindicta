<script setup lang="ts">
import { Plus, ArrowRight, Trash2 } from 'lucide-vue-next'
import type { TicketPriority, TicketType } from '~/types/vindicta'

const kanban = useKanbanStore()

const backlogTickets = computed(() =>
  kanban.tickets
    .filter((t) => t.status === 'backlog')
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      return (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
    }),
)

const priorityColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10',
  high:     'text-orange-400 bg-orange-400/10',
  medium:   'text-yellow-400 bg-yellow-400/10',
  low:      'text-white/30 bg-white/5',
}

const typeColors: Record<string, string> = {
  feature: 'text-indigo-400 bg-indigo-400/10',
  bug:     'text-red-400 bg-red-400/10',
  fix:     'text-orange-400 bg-orange-400/10',
  chore:   'text-white/30 bg-white/5',
  spike:   'text-violet-400 bg-violet-400/10',
}

const showModal = ref(false)

async function addTicket(data: { title: string; type: TicketType; priority: TicketPriority; description: string; labels: string[] }) {
  await kanban.createTicket({
    title: data.title,
    type: data.type,
    priority: data.priority,
    description: data.description,
    labels: data.labels,
    status: 'backlog',
  }, 'local')
}

async function promote(id: string) {
  await kanban.moveTicket(id, 'todo')
}

async function remove(id: string) {
  await kanban.deleteTicket(id)
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-white/30">{{ backlogTickets.length }} item{{ backlogTickets.length !== 1 ? 's' : '' }}</p>
      <button
        class="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/[0.05]"
        @click="showModal = true"
      >
        <Plus class="size-3" />
        Add item
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!backlogTickets.length" class="text-center py-12 text-white/20 text-sm">
      No backlog items yet.
    </div>

    <!-- Ticket list -->
    <div v-else class="space-y-1">
      <div
        v-for="ticket in backlogTickets"
        :key="ticket.id"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-md border border-transparent hover:border-white/[0.07] hover:bg-white/[0.03] transition-colors"
      >
        <!-- Type badge -->
        <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded" :class="typeColors[ticket.type] ?? 'text-white/30 bg-white/5'">
          {{ ticket.type }}
        </span>

        <!-- Title -->
        <span class="flex-1 text-sm text-white/80 truncate">{{ ticket.title }}</span>

        <!-- Priority badge -->
        <span class="text-[10px] font-medium px-1.5 py-0.5 rounded" :class="priorityColors[ticket.priority]">
          {{ ticket.priority }}
        </span>

        <!-- Actions (visible on hover) -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="p-1 rounded text-white/30 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors"
            title="Move to To Do"
            @click="promote(ticket.id)"
          >
            <ArrowRight class="size-3.5" />
          </button>
          <button
            class="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete"
            @click="remove(ticket.id)"
          >
            <Trash2 class="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <TicketModal v-model="showModal" modal-title="New Backlog Item" @submit="addTicket" />
</template>
