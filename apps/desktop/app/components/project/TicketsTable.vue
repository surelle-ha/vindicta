<script setup lang="ts">
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, ArrowRight, Trash2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { Ticket, TicketStatus, TicketType, TicketPriority, TicketGitControl } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'

const kanban = useKanbanStore()
const projects = useProjectsStore()
const projectCode = computed(() => projects.activeProject?.code ?? '')

const { openTicket } = useTicketDetail()

const filterStatus = ref<TicketStatus | 'all'>('all')
const filterType = ref<TicketType | 'all'>('all')
const filterPriority = ref<TicketPriority | 'all'>('all')
const sortKey = ref<'status' | 'type' | 'priority' | 'title' | 'createdAt' | 'number'>('number')
const sortDir = ref<'asc' | 'desc'>('asc')

const statusOrder: Record<TicketStatus, number> = {
  backlog: 0, todo: 1, in_progress: 2, in_review: 3, done: 4, cancelled: 5,
}
const priorityOrder: Record<TicketPriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

const nonBacklogTickets = computed(() => {
  let list = kanban.tickets.filter(t => t.status !== 'backlog')
  if (filterStatus.value !== 'all') list = list.filter(t => t.status === filterStatus.value)
  if (filterType.value !== 'all') list = list.filter(t => t.type === filterType.value)
  if (filterPriority.value !== 'all') list = list.filter(t => t.priority === filterPriority.value)
  return [...list].sort((a, b) => {
    let cmp = 0
    if (sortKey.value === 'status') cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
    else if (sortKey.value === 'priority') cmp = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    else if (sortKey.value === 'createdAt') cmp = a.createdAt.localeCompare(b.createdAt)
    else if (sortKey.value === 'number') cmp = (a.number ?? 0) - (b.number ?? 0)
    else cmp = (a[sortKey.value] as string).localeCompare(b[sortKey.value] as string)
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const backlogTickets = computed(() =>
  kanban.tickets
    .filter(t => t.status === 'backlog')
    .sort((a, b) => {
      if (filterType.value !== 'all' && a.type !== filterType.value && b.type === filterType.value) return 1
      if (filterType.value !== 'all' && b.type !== filterType.value && a.type === filterType.value) return -1
      if (filterPriority.value !== 'all' && a.priority !== filterPriority.value && b.priority === filterPriority.value) return 1
      if (filterPriority.value !== 'all' && b.priority !== filterPriority.value && a.priority === filterPriority.value) return -1
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    }),
)

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const statusBadge: Record<TicketStatus, string> = {
  backlog:     'bg-slate-500/20 text-slate-400',
  todo:        'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  in_review:   'bg-violet-500/20 text-violet-300',
  done:        'bg-emerald-500/20 text-emerald-300',
  cancelled:   'bg-red-500/20 text-red-400 line-through',
}

const priorityBadge: Record<TicketPriority, string> = {
  critical: 'text-red-400',
  high:     'text-amber-400',
  medium:   'text-blue-400',
  low:      'text-[var(--text-faint)]',
}

const typeBadge: Record<string, string> = {
  feature: 'bg-blue-500/15 text-blue-300',
  bug:     'bg-red-500/15 text-red-300',
  fix:     'bg-amber-500/15 text-amber-300',
  chore:   'bg-slate-500/15 text-slate-400',
  spike:   'bg-violet-500/15 text-violet-300',
}

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

// Risk detection
const riskExpanded = ref(true)

const VAGUE_TITLES = /^(fix|bug|task|todo|update|change|misc|issue|thing|stuff|work|test|feature|ticket|item|wip|tbd|placeholder|untitled)$/i

interface RiskyTicket {
  ticket: typeof kanban.tickets[0]
  reasons: string[]
}

const riskyTickets = computed<RiskyTicket[]>(() => {
  return kanban.tickets
    .filter(t => t.status !== 'done' && t.status !== 'cancelled')
    .reduce<RiskyTicket[]>((acc, ticket) => {
      const reasons: string[] = []
      const title = ticket.title?.trim() ?? ''
      const desc = ticket.description?.trim() ?? ''

      if (!desc) reasons.push('No description')
      if (title.length < 8) reasons.push('Title too short')
      else if (VAGUE_TITLES.test(title.split(' ')[0] ?? '')) reasons.push('Vague title')
      if ((ticket.priority === 'critical' || ticket.priority === 'high') && !desc)
        reasons.push(`${ticket.priority} priority needs description`)

      if (reasons.length) acc.push({ ticket, reasons })
      return acc
    }, [])
})

const showNewBacklog = ref(false)
const showNewTicket = ref(false)
const { notify } = useNotifications()

function openNewTicket() {
  showNewTicket.value = true
}

function openNewBacklog() {
  showNewBacklog.value = true
}

async function addBacklogTicket(data: { title: string; type: TicketType; priority: TicketPriority; description: string; gitControl?: TicketGitControl; labels: string[] }) {
  await kanban.createTicket({ ...data, status: 'backlog' }, 'local')
}

async function addTicket(data: { title: string; type: TicketType; priority: TicketPriority; description: string; gitControl?: TicketGitControl; labels: string[] }) {
  await kanban.createTicket({ ...data, status: 'todo' }, 'local')
  notify(`Ticket "${data.title}" created`, 'success')
}

async function promote(id: string) {
  await kanban.moveTicket(id, 'todo')
}

async function remove(id: string) {
  await kanban.deleteTicket(id)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 flex-wrap">
      <GlassSelect v-model="filterStatus" class="w-32">
        <option value="all">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="in_review">In Review</option>
        <option value="done">Done</option>
        <option value="cancelled">Cancelled</option>
      </GlassSelect>
      <GlassSelect v-model="filterType" class="w-28">
        <option value="all">All types</option>
        <option value="feature">Feature</option>
        <option value="bug">Bug</option>
        <option value="fix">Fix</option>
        <option value="chore">Chore</option>
        <option value="spike">Spike</option>
      </GlassSelect>
      <GlassSelect v-model="filterPriority" class="w-32">
        <option value="all">All priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </GlassSelect>
      <span class="text-xs text-[var(--text-muted)]">{{ nonBacklogTickets.length }} ticket{{ nonBacklogTickets.length !== 1 ? 's' : '' }}</span>
      <div class="ml-auto flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05] transition-colors"
          @click="openNewTicket"
        >
          <Plus class="size-3.5" />
          New Ticket
        </button>
      </div>
    </div>

    <!-- Risk detection banner -->
    <div v-if="riskyTickets.length" class="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      <button
        class="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-amber-500/5 transition-colors"
        @click="riskExpanded = !riskExpanded"
      >
        <AlertTriangle class="size-3.5 text-amber-400 shrink-0" />
        <span class="text-xs font-semibold text-amber-300 flex-1">
          {{ riskyTickets.length }} at-risk ticket{{ riskyTickets.length !== 1 ? 's' : '' }} — missing description or vague titles
        </span>
        <component :is="riskExpanded ? ChevronDown : ChevronRight" class="size-3.5 text-amber-400/60" />
      </button>
      <div v-if="riskExpanded" class="border-t border-amber-500/15 divide-y divide-amber-500/10">
        <div
          v-for="{ ticket, reasons } in riskyTickets"
          :key="ticket.id"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-500/5 transition-colors cursor-pointer"
          @click="openTicket(ticket.id)"
        >
          <span class="text-[10px] font-mono text-amber-400/60 w-14 shrink-0">
            {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 8) }}
          </span>
          <span class="text-sm text-white/70 flex-1 truncate">{{ ticket.title }}</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-for="r in reasons"
              :key="r"
              class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300/80"
            >{{ r }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="rounded-xl border border-[var(--border)] overflow-hidden">
      <!-- Header -->
      <div class="grid grid-cols-[6rem_1fr_auto_auto_auto] gap-0 bg-[var(--bg-card)] border-b border-[var(--border)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
        <button class="px-3 py-2.5 text-left hover:text-[var(--text)] transition-colors" @click="toggleSort('number')">
          <span class="flex items-center gap-1">
            Key
            <component :is="sortKey === 'number' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown" class="size-3" />
          </span>
        </button>
        <button class="px-3 py-2.5 text-left hover:text-[var(--text)] transition-colors" @click="toggleSort('title')">
          <span class="flex items-center gap-1">
            Title
            <component :is="sortKey === 'title' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown" class="size-3" />
          </span>
        </button>
        <button class="px-3 py-2.5 text-left hover:text-[var(--text)] transition-colors" @click="toggleSort('status')">
          <span class="flex items-center gap-1">
            Status
            <component :is="sortKey === 'status' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown" class="size-3" />
          </span>
        </button>
        <button class="px-3 py-2.5 text-left hover:text-[var(--text)] transition-colors" @click="toggleSort('type')">
          <span class="flex items-center gap-1">
            Type
            <component :is="sortKey === 'type' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown" class="size-3" />
          </span>
        </button>
        <button class="px-3 py-2.5 text-left hover:text-[var(--text)] transition-colors" @click="toggleSort('priority')">
          <span class="flex items-center gap-1">
            Priority
            <component :is="sortKey === 'priority' ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown" class="size-3" />
          </span>
        </button>
      </div>

      <!-- Rows -->
      <div v-if="!nonBacklogTickets.length" class="py-12 text-center text-sm text-[var(--text-muted)]">
        No tickets match the current filters.
      </div>
      <div
        v-for="ticket in nonBacklogTickets"
        :key="ticket.id"
        class="grid grid-cols-[6rem_1fr_auto_auto_auto] gap-0 border-b border-[var(--border)] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
        @click="openTicket(ticket.id)"
      >
        <div class="px-3 py-2.5 flex items-center">
          <span class="text-[10px] font-mono text-indigo-400/80">
            {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 8) }}
          </span>
        </div>
        <div class="px-3 py-2.5 flex items-center gap-2 min-w-0">
          <span class="text-sm text-[var(--text)] truncate">{{ ticket.title }}</span>
          <div v-if="ticket.labels?.length" class="flex gap-1 shrink-0">
            <span
              v-for="l in ticket.labels.slice(0, 2)"
              :key="l"
              class="text-[10px] px-1 py-0.5 rounded-full bg-white/[0.06] text-[var(--text-faint)]"
            >{{ l }}</span>
            <span v-if="ticket.labels.length > 2" class="text-[10px] text-[var(--text-faint)]">+{{ ticket.labels.length - 2 }}</span>
          </div>
        </div>
        <div class="px-3 py-2.5 flex items-center">
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="statusBadge[ticket.status]">
            {{ ticket.status.replace('_', ' ') }}
          </span>
        </div>
        <div class="px-3 py-2.5 flex items-center">
          <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase" :class="typeBadge[ticket.type]">
            {{ ticket.type }}
          </span>
        </div>
        <div class="px-3 py-2.5 flex items-center">
          <span class="text-xs font-medium" :class="priorityBadge[ticket.priority]">
            {{ ticket.priority }}
          </span>
        </div>
      </div>
    </div>

    <!-- Backlog Section -->
    <div class="mt-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="h-px flex-1 bg-[var(--border)]" />
        <span class="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-widest">Backlog</span>
        <div class="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-[var(--text-muted)]">{{ backlogTickets.length }} item{{ backlogTickets.length !== 1 ? 's' : '' }}</p>
        <button
          class="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/[0.05]"
          @click="openNewBacklog"
        >
          <Plus class="size-3" />
          Add item
        </button>
      </div>

      <div v-if="!backlogTickets.length" class="text-center py-10 text-white/20 text-sm">
        No backlog items yet.
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="ticket in backlogTickets"
          :key="ticket.id"
          class="group flex items-center gap-3 px-3 py-2.5 rounded-md border border-transparent hover:border-white/[0.07] hover:bg-white/[0.03] transition-colors cursor-pointer"
          @click="openTicket(ticket.id)"
        >
          <span class="text-[10px] font-mono text-indigo-400/60 w-16 shrink-0">
            {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 8) }}
          </span>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" :class="typeColors[ticket.type] ?? 'text-white/30 bg-white/5'">
            {{ ticket.type }}
          </span>
          <span class="flex-1 text-sm text-white/80 truncate">{{ ticket.title }}</span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0" :class="priorityColors[ticket.priority]">
            {{ ticket.priority }}
          </span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
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
  </div>

  <TicketModal v-model="showNewTicket" modal-title="New Ticket" @submit="addTicket" />
  <TicketModal v-model="showNewBacklog" modal-title="New Backlog Item" @submit="addBacklogTicket" />
</template>
