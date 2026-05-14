<script setup lang="ts">
import { Wand2, Loader2, Plus } from 'lucide-vue-next'
import { runClaude } from '~/composables/useClaudeShell'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const kanban = useKanbanStore()
const projects = useProjectsStore()
const { notify } = useNotifications()

interface SuggestedTicket {
  title: string
  type: string
  priority: string
  description: string
  selected: boolean
}

const analyzing = ref(false)
const creating = ref(false)
const error = ref<string | null>(null)
const suggestions = ref<SuggestedTicket[]>([])
const analyzed = ref(false)

const selectedCount = computed(() => suggestions.value.filter(s => s.selected).length)

function close() {
  emit('update:modelValue', false)
}

async function analyze() {
  const projectPath = projects.activeProject?.absolutePath
  if (!projectPath) return

  analyzing.value = true
  error.value = null
  suggestions.value = []

  const prompt = `Analyze the project codebase and suggest 5-10 actionable development tickets. Reply ONLY with a JSON array (no other text, no markdown fences): [{"title":"...","type":"feature|bug|fix|chore|spike","priority":"low|medium|high|critical","description":"..."}]. Keep each description under 100 words.`

  let fullText = ''

  await runClaude({
    prompt,
    projectPath,
    onLine(line) {
      if (!line.trim()) return
      try {
        const evt = JSON.parse(line)
        if (evt.type === 'assistant') {
          const content: any[] = evt.message?.content ?? []
          for (const block of content) {
            if (block.type === 'text' && block.text) fullText += block.text
          }
        }
      }
      catch { /* skip */ }
    },
    onClose() {
      analyzing.value = false
      analyzed.value = true
      try {
        const jsonMatch = fullText.match(/\[[\s\S]*\]/)
        if (!jsonMatch) throw new Error('No JSON array found in response')
        const parsed: any[] = JSON.parse(jsonMatch[0])
        suggestions.value = parsed.map(item => ({
          title: item.title ?? 'Untitled',
          type: item.type ?? 'feature',
          priority: item.priority ?? 'medium',
          description: item.description ?? '',
          selected: true,
        }))
        if (!suggestions.value.length) error.value = 'No suggestions returned. Try again.'
      }
      catch (e: any) {
        error.value = e?.message ?? 'Failed to parse AI response'
      }
    },
    onError(err) {
      analyzing.value = false
      error.value = err
    },
  })
}

async function createSelected() {
  const toCreate = suggestions.value.filter(s => s.selected)
  if (!toCreate.length) return
  creating.value = true
  try {
    for (const s of toCreate) {
      await kanban.createTicket({
        title: s.title,
        type: s.type as any,
        priority: s.priority as any,
        description: s.description,
        status: 'backlog',
      }, 'AI Agent')
    }
    notify(`Created ${toCreate.length} ticket${toCreate.length !== 1 ? 's' : ''} from AI analysis`, 'success')
    close()
  }
  finally {
    creating.value = false
  }
}

const typeBadge: Record<string, string> = {
  feature: 'bg-blue-500/15 text-blue-300',
  bug:     'bg-red-500/15 text-red-300',
  fix:     'bg-amber-500/15 text-amber-300',
  chore:   'bg-slate-500/15 text-slate-400',
  spike:   'bg-violet-500/15 text-violet-300',
}

const priorityBadge: Record<string, string> = {
  critical: 'text-red-400',
  high:     'text-amber-400',
  medium:   'text-blue-400',
  low:      'text-white/40',
}
</script>

<template>
  <GlassModal :model-value="modelValue" title="Generate Tickets with AI" max-width="lg" @update:model-value="close" @close="close">
    <div class="space-y-4">
      <p class="text-sm text-[var(--text-muted)]">
        Analyze the codebase and generate actionable ticket suggestions using the AI agent.
      </p>

      <div v-if="!analyzed" class="flex justify-center py-4">
        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          :disabled="analyzing"
          @click="analyze"
        >
          <Loader2 v-if="analyzing" class="size-4 animate-spin" />
          <Wand2 v-else class="size-4" />
          {{ analyzing ? 'Analyzing codebase…' : 'Analyze project' }}
        </button>
      </div>

      <div v-if="error" class="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
        {{ error }}
        <button class="ml-2 underline" @click="analyze">Retry</button>
      </div>

      <div v-if="analyzed && suggestions.length" class="space-y-2 max-h-[360px] overflow-y-auto custom-scroll">
        <div
          v-for="(s, i) in suggestions"
          :key="i"
          class="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-[var(--border)] hover:border-indigo-500/30 transition-colors cursor-pointer"
          :class="s.selected ? 'bg-indigo-500/5' : 'bg-[var(--bg-card)] opacity-60'"
          @click="s.selected = !s.selected"
        >
          <GlassCheckbox v-model="s.selected" size="sm" class="mt-0.5 shrink-0" @click.stop />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-sm font-medium text-[var(--text)] truncate">{{ s.title }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase" :class="typeBadge[s.type] ?? 'bg-white/10 text-white/40'">{{ s.type }}</span>
              <span class="text-[10px] font-medium" :class="priorityBadge[s.priority] ?? 'text-white/40'">{{ s.priority }}</span>
            </div>
            <p v-if="s.description" class="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{{ s.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="analyzed && suggestions.length" class="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span class="text-xs text-[var(--text-muted)]">{{ selectedCount }} of {{ suggestions.length }} selected</span>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50"
            :disabled="!selectedCount || creating"
            @click="createSelected"
          >
            <Loader2 v-if="creating" class="size-3.5 animate-spin" />
            <Plus v-else class="size-3.5" />
            Create {{ selectedCount }} ticket{{ selectedCount !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>
  </GlassModal>
</template>
