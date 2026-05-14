<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { Sprint } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'

const props = defineProps<{
  modelValue: boolean
  sprint: Sprint
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const kanban = useKanbanStore()
const sprintStore = useSprintStore()
const projects = useProjectsStore()
const { notify } = useNotifications()

const projectCode = computed(() => projects.activeProject?.code ?? '')

const adding = ref(false)
const selected = ref<Set<string>>(new Set())

const available = computed(() =>
  kanban.tickets.filter(t =>
    (t.status === 'backlog' || t.status === 'todo') &&
    !props.sprint.ticketIds.includes(t.id),
  ),
)

function toggle(id: string) {
  if (selected.value.has(id)) {
    selected.value.delete(id)
  }
  else {
    selected.value.add(id)
  }
  selected.value = new Set(selected.value)
}

function close() {
  emit('update:modelValue', false)
}

async function addSelected() {
  if (!selected.value.size) return
  adding.value = true
  try {
    for (const id of selected.value) {
      await sprintStore.assignTicket(id, props.sprint.id)
      await kanban.updateTicket(id, { sprintId: props.sprint.id })
    }
    notify(`Added ${selected.value.size} ticket${selected.value.size !== 1 ? 's' : ''} to ${props.sprint.name}`, 'success')
    close()
  }
  finally {
    adding.value = false
  }
}

const statusBadge: Record<string, string> = {
  backlog: 'bg-slate-500/20 text-slate-400',
  todo:    'bg-blue-500/20 text-blue-300',
}

const typeBadge: Record<string, string> = {
  feature: 'bg-blue-500/15 text-blue-300',
  bug:     'bg-red-500/15 text-red-300',
  fix:     'bg-amber-500/15 text-amber-300',
  chore:   'bg-slate-500/15 text-slate-400',
  spike:   'bg-violet-500/15 text-violet-300',
}
</script>

<template>
  <GlassModal :model-value="modelValue" :title="`Add tickets to ${sprint.name}`" max-width="md" @update:model-value="close" @close="close">
    <div class="space-y-3">
      <p class="text-xs text-[var(--text-muted)]">Select backlog or todo tickets to add to this sprint.</p>

      <div v-if="!available.length" class="py-8 text-center text-sm text-[var(--text-muted)]">
        No eligible tickets found. All backlog and todo tickets are already in this sprint.
      </div>

      <div v-else class="space-y-1 max-h-[400px] overflow-y-auto custom-scroll">
        <div
          v-for="ticket in available"
          :key="ticket.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors"
          :class="selected.has(ticket.id)
            ? 'border-indigo-500/40 bg-indigo-500/10'
            : 'border-[var(--border)] hover:border-white/20 hover:bg-white/[0.03]'"
          @click="toggle(ticket.id)"
        >
          <GlassCheckbox
            :model-value="selected.has(ticket.id)"
            size="sm"
            class="shrink-0"
            @click.stop
            @update:model-value="toggle(ticket.id)"
          />
          <span class="text-[10px] font-mono text-indigo-400/70 w-14 shrink-0">
            {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 6) }}
          </span>
          <span class="flex-1 text-sm text-[var(--text)] truncate">{{ ticket.title }}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase shrink-0" :class="typeBadge[ticket.type]">
            {{ ticket.type }}
          </span>
          <span class="text-[10px] px-1 py-0.5 rounded shrink-0" :class="statusBadge[ticket.status]">
            {{ ticket.status }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span class="text-xs text-[var(--text-muted)]">{{ selected.size }} selected</span>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50"
            :disabled="!selected.size || adding"
            @click="addSelected"
          >
            <Plus class="size-3.5" />
            Add selected
          </button>
        </div>
      </div>
    </div>
  </GlassModal>
</template>
