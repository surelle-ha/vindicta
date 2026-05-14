<script setup lang="ts">
import type { TicketStatus, Ticket } from '~/types/vindicta'
import { Bot, Columns2, ListChecks, Zap } from 'lucide-vue-next'
import { ticketKey } from '~/utils/ticket'

const props = defineProps<{
  sprintFilter?: boolean
}>()

const kanban = useKanbanStore()
const sprint = useSprintStore()
const projects = useProjectsStore()
const { openTicket } = useTicketDetail()

const viewMode = ref<'columns' | 'queue'>('columns')

const columns: { status: TicketStatus; label: string; dot: string; accent: string }[] = [
  { status: 'backlog',     label: 'Backlog',      dot: 'bg-white/30',    accent: 'bg-white/30' },
  { status: 'todo',        label: 'To Do',        dot: 'bg-sky-400',     accent: 'bg-sky-400' },
  { status: 'in_progress', label: 'In Progress',  dot: 'bg-amber-400',   accent: 'bg-amber-400' },
  { status: 'in_review',   label: 'In Review',    dot: 'bg-violet-400',  accent: 'bg-violet-400' },
  { status: 'done',        label: 'Done',         dot: 'bg-emerald-400', accent: 'bg-emerald-400' },
]

const allTickets = computed<Ticket[]>(() => {
  if (!props.sprintFilter) return kanban.tickets
  if (!sprint.activeSprint) return []
  const ids = new Set(sprint.activeSprint.ticketIds)
  return kanban.tickets.filter(t => ids.has(t.id))
})

const projectCode = computed(() => projects.activeProject?.code ?? '')
const statusRank: Record<TicketStatus, number> = {
  in_progress: 0,
  todo: 1,
  backlog: 2,
  in_review: 3,
  done: 4,
  cancelled: 5,
}
const priorityRank = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}
const statusLabel: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
}

const queueTickets = computed(() =>
  [...allTickets.value]
    .filter(ticket => ticket.status !== 'done' && ticket.status !== 'cancelled')
    .sort((a, b) => {
      const statusDiff = statusRank[a.status] - statusRank[b.status]
      if (statusDiff) return statusDiff
      const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority]
      if (priorityDiff) return priorityDiff
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    }),
)

function ticketsForStatus(status: TicketStatus): Ticket[] {
  return allTickets.value.filter(t => t.status === status)
}

async function handleDrop(id: string, status: TicketStatus) {
  await kanban.moveTicket(id, status)
}
</script>

<template>
  <div class="pb-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <!-- Sprint board banner -->
      <div v-if="sprintFilter && sprint.activeSprint" class="flex items-center gap-2">
        <Zap class="size-3.5 text-indigo-400" />
        <span class="text-xs font-semibold text-indigo-300">{{ sprint.activeSprint.name }}</span>
        <GlassBadge variant="success" size="sm">Sprint Board</GlassBadge>
      </div>
      <div v-else-if="sprintFilter" class="flex items-center gap-2">
        <Zap class="size-3.5 text-[var(--text-faint)]" />
        <span class="text-xs font-semibold text-[var(--text-muted)]">No running sprint</span>
      </div>
      <div v-else />

      <!-- View toggle -->
      <div class="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
          :class="viewMode === 'columns' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
          @click="viewMode = 'columns'"
        >
          <Columns2 class="size-3.5" />
          Columns
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
          :class="viewMode === 'queue' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
          @click="viewMode = 'queue'"
        >
          <ListChecks class="size-3.5" />
          Queue
        </button>
      </div>
    </div>

    <!-- Columns view: classic draggable kanban -->
    <div v-if="viewMode === 'columns'" class="-mx-1 overflow-x-auto custom-scroll px-1 pb-2">
      <div class="grid w-full min-w-[72rem] grid-cols-5 items-stretch gap-4">
        <KanbanColumn
          v-for="col in columns"
          :key="col.status"
          class="h-[calc(100vh-18rem)] min-h-[28rem]"
          :status="col.status"
          :label="col.label"
          :tickets="ticketsForStatus(col.status)"
          :accent="col.accent"
          @drop="handleDrop"
        />
      </div>
    </div>

    <!-- Queue view: ordered AI working queue -->
    <div v-else class="space-y-3">
      <div class="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3">
        <div class="flex items-center gap-2">
          <Bot class="size-4 text-indigo-300" />
          <div>
            <p class="text-sm font-semibold text-[var(--text)]">AI Working Queue</p>
            <p class="text-xs text-[var(--text-muted)] mt-0.5">Prioritized open tickets for the selected AI tool to pick up next.</p>
          </div>
        </div>
        <GlassBadge variant="info">{{ queueTickets.length }} open</GlassBadge>
      </div>

      <div v-if="queueTickets.length" class="space-y-2">
        <button
          v-for="(ticket, index) in queueTickets"
          :key="ticket.id"
          class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-left hover:border-indigo-500/30 hover:bg-white/[0.05] transition-colors"
          @click="openTicket(ticket.id)"
        >
          <div class="flex items-start gap-3">
            <div class="size-7 rounded-lg bg-white/[0.06] border border-white/[0.08] grid place-items-center text-xs font-semibold text-white/45 shrink-0">
              {{ index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-mono text-indigo-300">
                  {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 8) }}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/45 uppercase">{{ ticket.type }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/45">{{ statusLabel[ticket.status] }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 capitalize">{{ ticket.priority }}</span>
              </div>
              <p class="text-sm font-medium text-[var(--text)] mt-1.5 break-words">{{ ticket.title }}</p>
              <p v-if="ticket.description" class="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{{ ticket.description }}</p>
            </div>
          </div>
        </button>
      </div>

      <div v-else class="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] py-12 text-center">
        <p class="text-sm text-[var(--text-muted)]">No open tickets in the AI queue.</p>
      </div>
    </div>
  </div>
</template>
