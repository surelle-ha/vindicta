<script setup lang="ts">
import { Edit3, Eye, GitBranch } from 'lucide-vue-next'
import type { Ticket, TicketType, TicketPriority, TicketGitControl } from '~/types/vindicta'
import { renderMarkdown } from '~/utils/markdown'
import { ticketKey } from '~/utils/ticket'

const props = defineProps<{
  initial?: Partial<Ticket>
  modalTitle?: string
}>()

const emit = defineEmits<{
  submit: [data: {
    title: string
    type: TicketType
    priority: TicketPriority
    description: string
    gitControl: TicketGitControl
    labels: string[]
  }]
  cancel: []
}>()

const model = defineModel<boolean>()
const projects = useProjectsStore()
const kanban = useKanbanStore()
const fs = useTauriFs()

const ticketTitle = ref(props.initial?.title ?? '')
const type = ref<TicketType>(props.initial?.type ?? 'feature')
const priority = ref<TicketPriority>(props.initial?.priority ?? 'medium')
const description = ref(props.initial?.description ?? '')
const descPreviewMode = ref(false)
const labelsRaw = ref(props.initial?.labels?.join(', ') ?? '')

const hasGitRepo = ref(false)
const gitControlEnabled = ref(props.initial?.gitControl?.enabled ?? false)
const gitBranch = ref(props.initial?.gitControl?.branch ?? '')
const autoCommit = ref(props.initial?.gitControl?.autoCommit ?? false)
const autoPush = ref(props.initial?.gitControl?.autoPush ?? false)

const projectCode = computed(() => projects.activeProject?.code ?? '')
const nextTicketNumber = computed(() => {
  if (props.initial?.number) return props.initial.number
  return kanban.tickets.reduce((max, t) => Math.max(max, t.number ?? 0), 0) + 1
})
const displayKey = computed(() =>
  projectCode.value ? ticketKey(projectCode.value, nextTicketNumber.value) : `#${nextTicketNumber.value}`,
)
const descriptionHtml = computed(() => {
  const md = description.value.trim()
  return md ? renderMarkdown(md) : '<p class="text-white/30 italic">Nothing to preview yet.</p>'
})

function hydrateFromInitial() {
  ticketTitle.value = props.initial?.title ?? ''
  type.value = props.initial?.type ?? 'feature'
  priority.value = props.initial?.priority ?? 'medium'
  description.value = props.initial?.description ?? ''
  descPreviewMode.value = false
  labelsRaw.value = props.initial?.labels?.join(', ') ?? ''
  gitControlEnabled.value = props.initial?.gitControl?.enabled ?? false
  gitBranch.value = props.initial?.gitControl?.branch ?? ''
  autoCommit.value = props.initial?.gitControl?.autoCommit ?? false
  autoPush.value = props.initial?.gitControl?.autoPush ?? false
}

async function refreshGitAvailability() {
  try {
    const projectPath = projects.activeProject?.absolutePath
    hasGitRepo.value = projectPath ? await fs.exists(`${projectPath}/.git`).catch(() => false) : false
  }
  catch {
    hasGitRepo.value = false
  }
  finally {
    if (hasGitRepo.value) return
    gitControlEnabled.value = false
    gitBranch.value = ''
    autoCommit.value = false
    autoPush.value = false
  }
}

watch(() => model.value, async (open) => {
  if (!open) return
  hydrateFromInitial()
  refreshGitAvailability()
})

function submit() {
  if (!ticketTitle.value.trim()) return
  emit('submit', {
    title: ticketTitle.value.trim(),
    type: type.value,
    priority: priority.value,
    description: description.value.trim(),
    gitControl: {
      enabled: hasGitRepo.value && gitControlEnabled.value,
      branch: gitControlEnabled.value ? gitBranch.value.trim() : '',
      autoCommit: gitControlEnabled.value && autoCommit.value,
      autoPush: gitControlEnabled.value && autoPush.value,
    },
    labels: labelsRaw.value.split(',').map(l => l.trim()).filter(Boolean),
  })
  model.value = false
}

function cancel() {
  emit('cancel')
  model.value = false
}
</script>

<template>
  <GlassModal v-model="model" :title="modalTitle ?? 'New Ticket'" max-width="sm" @close="cancel">
    <div class="space-y-4">
      <div>
        <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Title <span class="text-red-400">*</span></label>
        <GlassInput
          v-model="ticketTitle"
          placeholder="What needs to be done?"
          autofocus
          @keydown.enter="submit"
          @keydown.esc="cancel"
        />
      </div>

      <div>
        <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Ticket key</label>
        <div class="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white/[0.04] px-3 py-2">
          <span class="text-sm font-mono font-semibold text-indigo-300">{{ displayKey }}</span>
          <span class="text-xs text-[var(--text-faint)]">assigned on create</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Type</label>
          <GlassSelect v-model="type" class="w-full">
            <option value="feature">Feature</option>
            <option value="bug">Bug</option>
            <option value="fix">Fix</option>
            <option value="chore">Chore</option>
            <option value="spike">Spike</option>
          </GlassSelect>
        </div>
        <div>
          <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Priority</label>
          <GlassSelect v-model="priority" class="w-full">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </GlassSelect>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs text-[var(--text-muted)] block">Description <span class="text-[var(--text-faint)]">(Markdown)</span></label>
          <div class="flex items-center gap-1 bg-white/[0.04] rounded-md p-0.5">
            <button
              class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              :class="!descPreviewMode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
              @click="descPreviewMode = false"
            >
              <Edit3 class="size-3" /> Write
            </button>
            <button
              class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              :class="descPreviewMode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
              @click="descPreviewMode = true"
            >
              <Eye class="size-3" /> Preview
            </button>
          </div>
        </div>
        <textarea
          v-if="!descPreviewMode"
          v-model="description"
          rows="5"
          placeholder="## Context&#10;What needs to happen?&#10;&#10;## Acceptance criteria&#10;- "
          class="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-faint)] outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-colors resize-none font-mono leading-relaxed"
        />
        <div
          v-else
          class="min-h-[132px] bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-3 markdown-preview overflow-y-auto custom-scroll"
          v-html="descriptionHtml"
        />
      </div>

      <div v-if="hasGitRepo" class="rounded-xl border border-[var(--border)] bg-white/[0.03] p-3 space-y-3">
        <GlassCheckbox v-model="gitControlEnabled">
          <GitBranch class="size-3.5 text-indigo-300" />
          <span class="text-sm text-[var(--text)]">Git Control</span>
        </GlassCheckbox>
        <div v-if="gitControlEnabled" class="space-y-3 pl-6">
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">AI working branch</label>
            <GlassInput v-model="gitBranch" placeholder="feature/my-ticket-branch" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <GlassCheckbox v-model="autoCommit" size="sm" class="text-xs text-[var(--text-muted)]">
              Auto commit
            </GlassCheckbox>
            <GlassCheckbox v-model="autoPush" size="sm" class="text-xs text-[var(--text-muted)]">
              Auto push
            </GlassCheckbox>
          </div>
        </div>
      </div>

      <div>
        <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Labels <span class="text-[var(--text-faint)]">(comma-separated)</span></label>
        <GlassInput v-model="labelsRaw" placeholder="frontend, api, urgent" />
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <GlassButton variant="ghost" size="sm" @click="cancel">Cancel</GlassButton>
        <GlassButton size="sm" :disabled="!ticketTitle.trim()" @click="submit">
          {{ props.initial?.id ? 'Save changes' : 'Create ticket' }}
        </GlassButton>
      </div>
    </div>
  </GlassModal>
</template>

<style scoped>
.markdown-preview :deep(h1) { font-size: 1.125rem; font-weight: 700; color: white; margin-top: 0.75rem; margin-bottom: 0.5rem; }
.markdown-preview :deep(h2) { font-size: 1rem; font-weight: 600; color: white; margin-top: 0.625rem; margin-bottom: 0.375rem; }
.markdown-preview :deep(h3) { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.8); margin-top: 0.5rem; margin-bottom: 0.25rem; }
.markdown-preview :deep(p) { font-size: 0.875rem; color: rgba(255,255,255,0.65); margin-bottom: 0.5rem; }
.markdown-preview :deep(ul) { list-style-type: disc; margin-left: 1rem; }
.markdown-preview :deep(ol) { list-style-type: decimal; margin-left: 1rem; }
.markdown-preview :deep(li) { font-size: 0.875rem; color: rgba(255,255,255,0.65); margin-bottom: 0.125rem; }
.markdown-preview :deep(strong) { font-weight: 600; color: rgba(255,255,255,0.85); }
.markdown-preview :deep(code) { font-size: 0.75rem; font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: #c4b5fd; }
.markdown-preview :deep(pre) { background: rgba(255,255,255,0.06); border-radius: 0.375rem; padding: 0.75rem; overflow-x: auto; margin-bottom: 0.5rem; }
.markdown-preview :deep(pre code) { background: transparent; padding: 0; }
.markdown-preview :deep(blockquote) { border-left: 2px solid rgba(99,102,241,0.4); padding-left: 0.75rem; color: rgba(255,255,255,0.45); font-style: italic; }
</style>
