<script setup lang="ts">
import { Zap, Plus, Calendar, Target, Play, Wand2, Loader2, Eye, Edit3, AlertCircle, ChevronDown, ChevronRight, Bot } from 'lucide-vue-next'
import type { Sprint, Ticket, TicketType } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'
import { runCodexExec } from '~/composables/useCodexShell'
import { renderMarkdown } from '~/utils/markdown'

const sprint = useSprintStore()
const kanban = useKanbanStore()
const projects = useProjectsStore()
const aiActivity = useAIActivityStore()
const { notify } = useNotifications()
const emit = defineEmits<{
  aiHandoverStarted: []
}>()

const showCreate = ref(false)
const showTicketPicker = ref(false)
const pickerSprint = ref<Sprint | null>(null)
const showHandoverPicker = ref(false)
const handoverSprint = ref<Sprint | null>(null)
const selectedHandoverTool = ref<'codex' | 'claude'>('codex')
const selectedHandoverEffort = ref<'low' | 'medium' | 'high'>('medium')
const handoverRunning = ref(false)
const handoverError = ref<string | null>(null)

function openTicketPicker(s: Sprint) {
  pickerSprint.value = s
  showTicketPicker.value = true
}

// Wizard state
const wizardStep = ref<1 | 2 | 3>(1)
const newSprintName = ref('')
const newSprintGoal = ref('')
const newStartDate = ref('')
const newEndDate = ref('')
const selectedExistingTicketIds = ref<string[]>([])

// Step 2 — plan + clarifications
const sprintPlanMarkdown = ref('')
const planPreviewMode = ref(false)
const planHtml = computed(() => {
  const md = sprintPlanMarkdown.value.trim()
  return md ? renderMarkdown(md) : '<p class="text-white/30 italic">Nothing to preview yet.</p>'
})

interface SuggestedTicket {
  title: string
  type: string
  priority: string
  description: string
  selected: boolean
}
const aiAnalyzing = ref(false)
const aiError = ref<string | null>(null)
const aiSuggestions = ref<SuggestedTicket[]>([])
const aiAnalyzed = ref(false)
const creatingTickets = ref(false)

interface ClarificationOption {
  label: string
  description?: string
}

interface ClarificationQuestion {
  question: string
  options: ClarificationOption[]
  selectedOption: string
  customAnswer: string
}
const clarifying = ref(false)
const clarificationError = ref<string | null>(null)
const clarificationQuestions = ref<ClarificationQuestion[]>([])
const clarificationAsked = ref(false)
const useClarificationPass = ref(true)
const activeClarificationIndex = ref(0)
const answeredClarifications = computed(() =>
  clarificationQuestions.value
    .map((item) => {
      const answer = [
        item.selectedOption.trim(),
        item.customAnswer.trim() ? `Notes: ${item.customAnswer.trim()}` : '',
      ].filter(Boolean).join('\n')
      return { question: item.question.trim(), answer }
    })
    .filter(item => item.question && item.answer),
)
const currentClarification = computed(() => clarificationQuestions.value[activeClarificationIndex.value] ?? null)
const sprintPlanContinueLabel = computed(() => {
  if (clarifying.value) return 'Checking...'
  if (!useClarificationPass.value) return 'Generate tickets'
  if (!clarificationAsked.value) return 'Continue'
  if (!clarificationQuestions.value.length) return 'Generate tickets'
  return activeClarificationIndex.value < clarificationQuestions.value.length - 1 ? 'Next question' : 'Generate tickets'
})

// No-tickets warning
const showNoTicketsWarning = ref(false)
const pendingStartId = ref<string | null>(null)

const activeSprint = computed(() => sprint.activeSprint)
const plannedSprints = computed(() => sprint.plannedSprints)
const expandedSprintIds = ref<string[]>([])
const eligibleExistingTickets = computed(() =>
  kanban.tickets
    .filter(ticket => !ticket.sprintId && ticket.status !== 'done' && ticket.status !== 'cancelled')
    .slice()
    .sort((a, b) => (b.number ?? 0) - (a.number ?? 0)),
)
const selectedExistingCount = computed(() => selectedExistingTicketIds.value.length)
const handoverEffortOptions = [
  {
    value: 'low' as const,
    label: 'Quick',
    detail: 'Review the sprint, make only obvious low-risk progress, and report blockers quickly.',
    tokenNote: 'Lowest token use',
  },
  {
    value: 'medium' as const,
    label: 'Balanced',
    detail: 'Default handover depth for implementing focused tickets and documenting follow-ups.',
    tokenNote: 'Moderate token use',
  },
  {
    value: 'high' as const,
    label: 'Deep',
    detail: 'More thorough pass across tickets, code paths, tests, and integration risks.',
    tokenNote: 'Highest token use',
  },
]
const selectedHandoverEffortOption = computed(() =>
  handoverEffortOptions.find(option => option.value === selectedHandoverEffort.value) ?? handoverEffortOptions[1]!,
)

const ticketTypeOrder: TicketType[] = ['feature', 'bug', 'fix', 'chore', 'spike']

const activeTickets = computed(() => {
  if (!activeSprint.value) return []
  return activeSprint.value.ticketIds
    .map((id) => kanban.tickets.find((t) => t.id === id))
    .filter(Boolean) as typeof kanban.tickets
})

function ticketsForSprint(s: Sprint): Ticket[] {
  return s.ticketIds
    .map((id) => kanban.tickets.find((t) => t.id === id))
    .filter(Boolean) as Ticket[]
}

function groupedTicketsForSprint(s: Sprint) {
  const groups = new Map<TicketType, Ticket[]>()
  for (const ticket of ticketsForSprint(s)) {
    if (!groups.has(ticket.type)) groups.set(ticket.type, [])
    groups.get(ticket.type)!.push(ticket)
  }
  return ticketTypeOrder
    .filter(type => groups.has(type))
    .map(type => ({ type, tickets: groups.get(type)! }))
}

function isSprintExpanded(id: string) {
  return expandedSprintIds.value.includes(id)
}

function toggleSprintTickets(id: string) {
  expandedSprintIds.value = isSprintExpanded(id)
    ? expandedSprintIds.value.filter(existing => existing !== id)
    : [...expandedSprintIds.value, id]
}

function openAIHandover(s: Sprint) {
  handoverSprint.value = s
  selectedHandoverTool.value = 'codex'
  selectedHandoverEffort.value = 'medium'
  handoverError.value = null
  showHandoverPicker.value = true
}

function buildSprintHandoverPrompt(s: Sprint, tickets: Ticket[], effort: typeof handoverEffortOptions[number]) {
  const ticketPayload = tickets.map(ticket => ({
    key: projects.activeProject?.code && ticket.number ? ticketKey(projects.activeProject.code, ticket.number) : `#${ticket.number}`,
    id: ticket.id,
    title: ticket.title,
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    labels: ticket.labels,
    description: ticket.description,
  }))

  return `You are Codex working inside Vindicta. The user is handing over an entire sprint to you.

Project: ${projects.activeProject?.name ?? 'Unknown project'}
Sprint: ${s.name}
Sprint goal: ${s.goal || '(no goal provided)'}
Sprint status: ${s.status}
Sprint window: ${s.startDate} to ${s.endDate}

Effort level: ${effort.label} (${effort.value})
Effort guidance: ${effort.detail}

Tickets:
${JSON.stringify(ticketPayload, null, 2)}

Instructions:
- Work through the sprint tickets where practical.
- Inspect the codebase before changing files.
- Keep edits focused on the sprint scope and avoid unrelated refactors.
- Do not commit, push, install new dependencies, or run destructive commands.
- If a ticket is too large or unclear, make the safest useful progress and document the blocker.
- Run relevant lightweight checks when available.

Return a concise markdown handover report with these sections:
## Summary
## Tickets Worked
## Changed Files
## Checks Run
## Blockers
## Follow-ups

Report observable actions and output only. Do not include private chain-of-thought.`
}

async function runAIHandover() {
  const s = handoverSprint.value
  const project = projects.activeProject
  if (!s || !project?.absolutePath) return

  if (selectedHandoverTool.value === 'claude') {
    handoverError.value = 'Claude handover integration is not available yet. Use Codex for now.'
    return
  }

  const effort = selectedHandoverEffortOption.value
  const sprintTickets = ticketsForSprint(s)
  showHandoverPicker.value = false
  handoverRunning.value = true
  handoverError.value = null

  const jobId = aiActivity.startJob({
    kind: 'sprint-handover',
    title: `AI handover: ${s.name}`,
    projectId: project.id,
    projectName: project.name,
    projectPath: project.absolutePath,
    sprintId: s.id,
    sprintName: s.name,
    tool: 'codex',
    effort: effort.value,
    ticketCount: sprintTickets.length,
    firstStep: 'Preparing sprint handover',
    firstDetail: `Bundling ${sprintTickets.length} sprint ticket${sprintTickets.length === 1 ? '' : 's'} for Codex.`,
  })

  emit('aiHandoverStarted')

  try {
    aiActivity.addEvent(jobId, 'Launching Codex', 'Starting Codex with workspace-write access for this project.', 'running')
    const result = await runCodexExec({
      projectPath: project.absolutePath,
      prompt: buildSprintHandoverPrompt(s, sprintTickets, effort),
      model: `Codex CLI default (${effort.value} handover)`,
      reasoningEffort: effort.value,
      sandbox: 'workspace-write',
    })
    const responseText = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    if (result.code !== 0) {
      throw new Error(responseText || 'Codex handover failed.')
    }
    if (!responseText) {
      throw new Error('Codex completed without returning a handover report.')
    }
    aiActivity.finishJob(jobId, 'done', `Codex finished handover for ${s.name}.`, responseText)
    notify(`AI handover complete for "${s.name}".`, 'success')
  }
  catch (e: any) {
    const message = friendlyCodexError(e?.message ?? 'AI handover failed.')
    handoverError.value = message
    aiActivity.finishJob(jobId, 'error', message)
    notify('AI handover failed.', 'error')
  }
  finally {
    handoverRunning.value = false
  }
}

const progressPercent = computed(() => {
  if (!activeTickets.value.length) return 0
  const done = activeTickets.value.filter((t) => t.status === 'done').length
  return Math.round((done / activeTickets.value.length) * 100)
})

const startsImmediately = computed(() => {
  if (!newStartDate.value) return true
  return new Date(newStartDate.value) <= new Date()
})

function nowDateTimeLocal(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function twoWeeksDateTimeLocal(): string {
  const d = new Date(Date.now() + 14 * 86400000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

onMounted(() => {
  newStartDate.value = nowDateTimeLocal()
  newEndDate.value = twoWeeksDateTimeLocal()
})

function openCreate() {
  wizardStep.value = 1
  sprintPlanMarkdown.value = ''
  planPreviewMode.value = false
  selectedExistingTicketIds.value = []
  aiSuggestions.value = []
  aiAnalyzed.value = false
  aiError.value = null
  clarificationQuestions.value = []
  clarificationAsked.value = false
  clarificationError.value = null
  useClarificationPass.value = true
  activeClarificationIndex.value = 0
  showCreate.value = true
}

function toggleExistingTicket(id: string) {
  selectedExistingTicketIds.value = selectedExistingTicketIds.value.includes(id)
    ? selectedExistingTicketIds.value.filter(existing => existing !== id)
    : [...selectedExistingTicketIds.value, id]
}

function goToStep2() {
  if (!newSprintName.value.trim()) {
    newSprintName.value = `Vibe Sprint ${sprint.sprints.length + 1}`
  }
  // Pre-fill plan with goal if the user typed one
  if (!sprintPlanMarkdown.value && newSprintGoal.value) {
    sprintPlanMarkdown.value = `## Goal\n${newSprintGoal.value}\n\n## Possible tasks\n- `
  }
  wizardStep.value = 2
}

function extractJsonArray(value: string) {
  const jsonMatch = value.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in Codex response.')
  return JSON.parse(jsonMatch[0])
}

function friendlyCodexError(message: string) {
  if (/@openai\/codex-win32-x64|Missing optional dependency/i.test(message)) {
    return 'Codex CLI is installed but its Windows runtime dependency is missing. Open Settings > Doctor and use Install/Repair Codex, or run npm install -g @openai/codex@latest.'
  }
  return message
}

async function requestClarifications(): Promise<'questions' | 'none' | 'error'> {
  const projectPath = projects.activeProject?.absolutePath
  if (!projectPath) return 'error'
  clarifying.value = true
  clarificationError.value = null
  clarificationAsked.value = true

  const planContext = sprintPlanMarkdown.value.trim()
    ? `Sprint plan:\n${sprintPlanMarkdown.value.trim()}`
    : `Sprint goal: ${newSprintGoal.value || newSprintName.value}`

  const prompt = `You are Codex helping plan a Vindicta sprint. Before generating tickets, decide whether the plan needs clarification.

${planContext}

Return ONLY a JSON array of 0-5 concise questions. No markdown fences, no prose.
Schema:
[{"question":"...","options":[{"label":"...","description":"..."}]}]

Return [] if the plan is already clear enough to generate tickets.
Prefer questions that change scope, priority, acceptance criteria, integration constraints, or testing expectations.
Each question should include 2-4 concrete options that help the user answer quickly. Do not include a free-text option because Vindicta already provides a notes field.`

  try {
    const output = await runCodexExec({ prompt, projectPath })
    if (output.code !== 0) {
      throw new Error(output.stderr || 'Codex failed to create clarification questions.')
    }
    const parsed: any[] = extractJsonArray(output.stdout)
    clarificationQuestions.value = parsed
      .map((item) => {
        const options = Array.isArray(item.options)
          ? item.options
              .map((option: any) => ({
                label: String(option?.label ?? option ?? '').trim(),
                description: String(option?.description ?? '').trim(),
              }))
              .filter((option: ClarificationOption) => option.label)
              .slice(0, 4)
          : []

        return {
          question: String(item.question ?? '').trim(),
          options: options.length ? options : [
            { label: 'Use Codex recommendation', description: 'Let Codex choose the most practical path.' },
            { label: 'Keep scope minimal', description: 'Bias toward the smallest useful sprint.' },
          ],
          selectedOption: '',
          customAnswer: '',
        }
      })
      .filter(item => item.question)
      .slice(0, 5)
    activeClarificationIndex.value = 0
    return clarificationQuestions.value.length ? 'questions' : 'none'
  }
  catch (e: any) {
    clarificationError.value = friendlyCodexError(e?.message ?? 'Failed to ask Codex for clarification questions.')
    return 'error'
  }
  finally {
    clarifying.value = false
  }
}

async function goToTicketSuggestions() {
  wizardStep.value = 3
  aiSuggestions.value = []
  aiAnalyzed.value = false
  aiError.value = null
  await nextTick()
  await generateTickets()
}

async function continueSprintPlan() {
  if (!useClarificationPass.value) {
    await goToTicketSuggestions()
    return
  }

  if (!clarificationAsked.value) {
    const result = await requestClarifications()
    if (result === 'error') return
    if (result === 'questions') return
  }

  if (clarificationQuestions.value.length && activeClarificationIndex.value < clarificationQuestions.value.length - 1) {
    activeClarificationIndex.value += 1
    return
  }

  await goToTicketSuggestions()
}

function backFromSprintPlan() {
  if (clarificationQuestions.value.length && activeClarificationIndex.value > 0) {
    activeClarificationIndex.value -= 1
    return
  }
  wizardStep.value = 1
}

async function generateTickets() {
  const projectPath = projects.activeProject?.absolutePath
  if (!projectPath) return
  aiAnalyzing.value = true
  aiError.value = null
  aiSuggestions.value = []

  const planContext = sprintPlanMarkdown.value.trim()
    ? `Sprint plan:\n${sprintPlanMarkdown.value.trim()}`
    : `Sprint goal: ${newSprintGoal.value || newSprintName.value}`

  const ticketSummary = kanban.tickets.slice(0, 20)
    .map(t => `- ${t.title} [${t.status}]`)
    .join('\n')

  const clarificationContext = answeredClarifications.value.length
    ? `Clarifications from user:\n${answeredClarifications.value.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}`
    : 'Clarifications from user: none provided.'

  const prompt = `You are Codex working inside Vindicta. Generate 5-8 actionable development tickets for this sprint plan.

${planContext}

${clarificationContext}

Existing tickets for context:
${ticketSummary || '(none yet)'}

Return ONLY a JSON array. No markdown fences, no prose.
Schema:
[{"title":"...","type":"feature|bug|fix|chore|spike","priority":"low|medium|high|critical","description":"..."}]

Keep each description under 80 words.`

  try {
    const output = await runCodexExec({ prompt, projectPath })
    aiAnalyzed.value = true
    if (output.code !== 0) {
      throw new Error(output.stderr || 'Codex failed to generate ticket suggestions.')
    }
    const parsed: any[] = extractJsonArray(output.stdout)
    aiSuggestions.value = parsed.map(item => ({
      title: item.title ?? 'Untitled',
      type: item.type ?? 'feature',
      priority: item.priority ?? 'medium',
      description: item.description ?? '',
      selected: true,
    }))
    if (!aiSuggestions.value.length) aiError.value = 'No suggestions returned. Try again.'
  }
  catch (e: any) {
    aiAnalyzed.value = true
    aiError.value = friendlyCodexError(e?.message ?? 'Failed to generate tickets with Codex.')
  }
  finally {
    aiAnalyzing.value = false
  }
}

const selectedCount = computed(() => aiSuggestions.value.filter(s => s.selected).length)

const typeBadge: Record<string, string> = {
  feature: 'bg-blue-500/15 text-blue-300',
  bug: 'bg-red-500/15 text-red-300',
  fix: 'bg-amber-500/15 text-amber-300',
  chore: 'bg-slate-500/15 text-slate-400',
  spike: 'bg-violet-500/15 text-violet-300',
}

const priorityBadge: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-amber-400',
  medium: 'text-blue-400',
  low: 'text-white/40',
}

async function finishCreate(withTickets: boolean, includeExistingTickets = true) {
  const startISO = newStartDate.value ? new Date(newStartDate.value).toISOString() : new Date().toISOString()
  const endISO = newEndDate.value ? new Date(newEndDate.value).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString()

  await sprint.createSprint({
    name: newSprintName.value || undefined,
    goal: newSprintGoal.value,
    startDate: startISO,
    endDate: endISO,
  })

  const newSprint = sprint.sprints[sprint.sprints.length - 1]
  let autoStarted = false
  if (newSprint && new Date(startISO) <= new Date()) {
    await sprint.startSprint(newSprint.id)
    autoStarted = true
  }

  const existingTicketIds = newSprint && includeExistingTickets ? [...selectedExistingTicketIds.value] : []
  if (newSprint) {
    for (const ticketId of existingTicketIds) {
      const ticket = kanban.tickets.find(item => item.id === ticketId)
      if (!ticket || ticket.sprintId) continue
      await kanban.updateTicket(ticketId, {
        sprintId: newSprint.id,
        status: ticket.status === 'backlog' ? 'todo' : ticket.status,
      })
      await sprint.assignTicket(ticketId, newSprint.id)
    }
  }

  if (withTickets && newSprint) {
    creatingTickets.value = true
    const toCreate = aiSuggestions.value.filter(s => s.selected)
    for (const s of toCreate) {
      const ticket = await kanban.createTicket({
        title: s.title,
        type: s.type as any,
        priority: s.priority as any,
        description: s.description,
        status: 'todo',
        sprintId: newSprint.id,
      }, 'Codex')
      await sprint.assignTicket(ticket.id, newSprint.id)
    }
    if (toCreate.length) notify(`Created ${toCreate.length} ticket${toCreate.length !== 1 ? 's' : ''} for sprint`, 'success')
    creatingTickets.value = false
  }

  if (existingTicketIds.length) {
    notify(`Added ${existingTicketIds.length} existing ticket${existingTicketIds.length === 1 ? '' : 's'} to sprint`, 'success')
  }

  showCreate.value = false
  newSprintName.value = ''
  newSprintGoal.value = ''
  newStartDate.value = nowDateTimeLocal()
  newEndDate.value = twoWeeksDateTimeLocal()
  sprintPlanMarkdown.value = ''
  selectedExistingTicketIds.value = []
  aiSuggestions.value = []
  aiAnalyzed.value = false

  if (autoStarted) notify(`Sprint "${newSprint?.name}" is now active`, 'success')
}

function tryStartNow(sprintId: string) {
  const s = sprint.sprints.find(sp => sp.id === sprintId)
  if (!s) return
  if (s.ticketIds.length === 0) {
    pendingStartId.value = sprintId
    showNoTicketsWarning.value = true
  }
  else {
    confirmStartSprint(sprintId)
  }
}

async function confirmStartSprint(sprintId: string) {
  showNoTicketsWarning.value = false
  await sprint.startSprint(sprintId)
  const s = sprint.sprints.find(sp => sp.id === sprintId)
  if (s) notify(`Sprint "${s.name}" started`, 'success')
  pendingStartId.value = null
}

async function addToActiveSprint(ticketId: string) {
  if (!activeSprint.value) return
  await sprint.assignTicket(ticketId, activeSprint.value.id)
  // Update ticket's sprintId so it leaves the unassigned list
  await kanban.updateTicket(ticketId, { sprintId: activeSprint.value.id, status: 'todo' })
  notify('Ticket added to sprint', 'success')
}

async function markDone(ticketId: string) {
  await kanban.moveTicket(ticketId, 'done')
}

async function completeActiveSprint() {
  if (!activeSprint.value) return
  const sprintId = activeSprint.value.id
  const tickets = activeTickets.value
  const completedIds = tickets
    .filter(ticket => ticket.status === 'done')
    .map(ticket => ticket.id)
  const incompleteTickets = tickets.filter(ticket => ticket.status !== 'done')

  for (const ticket of incompleteTickets) {
    await kanban.updateTicket(ticket.id, {
      status: 'backlog',
      sprintId: null,
      resolvedAt: null,
    })
  }

  await sprint.completeSprint(sprintId, completedIds)
  notify(
    incompleteTickets.length
      ? `Sprint ended. ${incompleteTickets.length} incomplete ticket${incompleteTickets.length !== 1 ? 's' : ''} moved to backlog.`
      : 'Sprint ended.',
    'success',
  )
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="handoverError" class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
      {{ handoverError }}
    </div>

    <!-- Active sprint -->
    <template v-if="activeSprint">
      <div class="glass p-5 rounded-xl">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <Zap class="size-4 text-indigo-400" />
              <h3 class="font-semibold text-white">{{ activeSprint.name }}</h3>
              <GlassBadge variant="success" size="sm">Active</GlassBadge>
            </div>
            <p v-if="activeSprint.goal" class="text-sm text-white/50 flex items-center gap-1.5">
              <Target class="size-3.5" />
              {{ activeSprint.goal }}
            </p>
            <p class="text-xs text-white/30 flex items-center gap-1.5 mt-1">
              <Calendar class="size-3" />
              {{ formatDate(activeSprint.startDate) }} → {{ formatDate(activeSprint.endDate) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <GlassButton variant="ghost" size="sm" :disabled="handoverRunning" @click="openAIHandover(activeSprint)">
              <Loader2 v-if="handoverRunning && handoverSprint?.id === activeSprint.id" class="size-3.5 animate-spin" />
              <Bot v-else class="size-3.5" />
              AI Handover
            </GlassButton>
            <GlassButton variant="ghost" size="sm" @click="openTicketPicker(activeSprint)">
              <Plus class="size-3.5" />
              Add tickets
            </GlassButton>
            <GlassButton variant="ghost" size="sm" @click="completeActiveSprint">
              End Sprint
            </GlassButton>
          </div>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between text-xs text-white/40 mb-1.5">
            <span>{{ activeTickets.filter((t) => t.status === 'done').length }} / {{ activeTickets.length }} done</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
        </div>

        <div class="space-y-2">
          <SprintCard
            v-for="ticket in activeTickets"
            :key="ticket.id"
            :ticket="ticket"
            @mark-done="markDone"
          />
          <p v-if="activeTickets.length === 0" class="text-sm text-white/30 text-center py-4">
            No tickets in this sprint yet. Use "Add tickets" to add some.
          </p>
        </div>
      </div>

      <!-- Unassigned tickets -->
      <div v-if="kanban.tickets.filter((t) => !t.sprintId && t.status !== 'done').length > 0">
        <h4 class="text-sm font-semibold text-white/50 mb-3">Unassigned tickets</h4>
        <div class="space-y-2">
          <div
            v-for="ticket in kanban.tickets.filter((t) => !t.sprintId && t.status !== 'done')"
            :key="ticket.id"
            class="flex items-center gap-3 glass-sm p-3 rounded-lg"
          >
            <span v-if="projects.activeProject?.code && ticket.number" class="text-[10px] font-mono text-white/30 shrink-0">
              {{ ticketKey(projects.activeProject.code, ticket.number) }}
            </span>
            <span class="flex-1 text-sm text-white/60 truncate">{{ ticket.title }}</span>
            <GlassButton variant="ghost" size="sm" @click="addToActiveSprint(ticket.id)">
              <Plus class="size-3.5" />
              Add to sprint
            </GlassButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Planned sprints -->
    <template v-if="!activeSprint && plannedSprints.length">
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-white/40 uppercase tracking-wider">Planned Sprints</h4>
        <div v-for="s in plannedSprints" :key="s.id" class="glass rounded-xl overflow-hidden">
          <div class="p-4 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <Zap class="size-3.5 text-white/40" />
                <p class="text-sm font-medium text-white/80">{{ s.name }}</p>
                <GlassBadge variant="default" size="sm">Planned</GlassBadge>
                <span v-if="!s.ticketIds.length" class="text-[10px] text-amber-400/70 flex items-center gap-0.5">
                  <AlertCircle class="size-3" /> No tickets
                </span>
              </div>
              <p v-if="s.goal" class="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                <Target class="size-3" />{{ s.goal }}
              </p>
              <p class="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                <Calendar class="size-3" />
                {{ formatDate(s.startDate) }} → {{ formatDate(s.endDate) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <GlassButton variant="ghost" size="sm" :disabled="handoverRunning" @click="openAIHandover(s)">
                <Loader2 v-if="handoverRunning && handoverSprint?.id === s.id" class="size-3.5 animate-spin" />
                <Bot v-else class="size-3.5" />
                AI Handover
              </GlassButton>
              <GlassButton variant="ghost" size="sm" @click="toggleSprintTickets(s.id)">
                <component :is="isSprintExpanded(s.id) ? ChevronDown : ChevronRight" class="size-3.5" />
                {{ s.ticketIds.length }} ticket{{ s.ticketIds.length !== 1 ? 's' : '' }}
              </GlassButton>
              <GlassButton variant="ghost" size="sm" @click="openTicketPicker(s)">
                <Plus class="size-3.5" />
                Add tickets
              </GlassButton>
              <GlassButton size="sm" @click="tryStartNow(s.id)">
                <Play class="size-3.5" />
                Start Now
              </GlassButton>
            </div>
          </div>

          <div v-if="isSprintExpanded(s.id)" class="border-t border-[var(--border)] px-4 py-3 space-y-3 bg-black/10">
            <p v-if="!ticketsForSprint(s).length" class="text-sm text-white/30 text-center py-3">
              No tickets assigned yet.
            </p>
            <div v-for="group in groupedTicketsForSprint(s)" :key="group.type" class="space-y-1.5">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-white/30">{{ group.type }}</p>
              <SprintCard
                v-for="ticket in group.tickets"
                :key="ticket.id"
                :ticket="ticket"
                @mark-done="markDone"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-if="!activeSprint && !plannedSprints.length">
      <div class="text-center py-16">
        <div class="size-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
          <Zap class="size-8 text-indigo-400" />
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">No active sprint</h3>
        <p class="text-sm text-white/40 mb-6 max-w-xs mx-auto">
          Start a sprint to focus your team on what matters most right now.
        </p>
        <GlassButton @click="openCreate">
          <Plus class="size-4" />
          Create a Vibe Sprint
        </GlassButton>
      </div>
    </template>

    <div v-if="!activeSprint" class="flex justify-end">
      <button
        class="text-xs text-indigo-400/60 hover:text-indigo-300 transition-colors"
        @click="openCreate"
      >
        + New sprint
      </button>
    </div>

    <!-- Sprint creation wizard -->
    <GlassModal
      v-model="showCreate"
      :title="wizardStep === 1 ? 'Create Sprint' : wizardStep === 2 ? 'Sprint Plan & Clarifications' : 'Sprint Plan & AI Tickets'"
      max-width="lg"
    >
      <!-- Step indicator -->
      <div class="flex items-center gap-2 mb-5">
        <div
          class="flex items-center justify-center size-6 rounded-full text-xs font-bold"
          :class="wizardStep === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'"
        >
          {{ wizardStep === 1 ? '1' : '✓' }}
        </div>
        <div class="flex-1 h-px" :class="wizardStep >= 2 ? 'bg-indigo-500/50' : 'bg-white/[0.08]'" />
        <div
          class="flex items-center justify-center size-6 rounded-full text-xs font-bold"
          :class="wizardStep === 2 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'"
        >
          {{ wizardStep > 2 ? '✓' : '2' }}
        </div>
        <div class="flex-1 h-px" :class="wizardStep === 3 ? 'bg-indigo-500/50' : 'bg-white/[0.08]'" />
        <div
          class="flex items-center justify-center size-6 rounded-full text-xs font-bold"
          :class="wizardStep === 3 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'"
        >3</div>
      </div>

      <!-- Step 1: Details -->
      <div v-if="wizardStep === 1" class="space-y-4">
        <GlassInput v-model="newSprintName" label="Sprint name" placeholder="Vibe Sprint 1" />
        <GlassInput v-model="newSprintGoal" label="Sprint goal" placeholder="Ship the login and dashboard" />
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Start</label>
            <input
              v-model="newStartDate"
              type="datetime-local"
              class="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"
            >
          </div>
          <div>
            <label class="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">End</label>
            <input
              v-model="newEndDate"
              type="datetime-local"
              class="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"
            >
          </div>
        </div>

        <div class="rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] p-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-indigo-200">Skip AI planning</p>
              <p class="mt-1 text-xs leading-relaxed text-indigo-100/60">
                Create the sprint now, with or without selected existing tickets.
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <button
                class="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-100 transition-colors hover:bg-indigo-500/15 disabled:opacity-50"
                :disabled="creatingTickets"
                @click="finishCreate(false, false)"
              >
                Create sprint only
              </button>
              <button
                v-if="selectedExistingCount"
                class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                :disabled="creatingTickets"
                @click="finishCreate(false, true)"
              >
                Create + {{ selectedExistingCount }} existing
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="startsImmediately"
          class="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300"
        >
          <Zap class="size-3.5 mt-0.5 shrink-0 text-amber-400" />
          <p class="text-xs leading-relaxed">
            <span class="font-semibold">This sprint will start immediately</span> — the start time is now or in the past.
            Change the date to schedule it later, or proceed to launch now.
          </p>
        </div>

        <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] p-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-white/50">Existing tickets</p>
              <p class="mt-0.5 text-xs text-white/35">Optional tickets to attach without using AI planning.</p>
            </div>
            <span v-if="selectedExistingCount" class="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-200">
              {{ selectedExistingCount }} selected
            </span>
          </div>

          <div v-if="eligibleExistingTickets.length" class="mt-3 max-h-44 space-y-1.5 overflow-y-auto custom-scroll">
            <button
              v-for="ticket in eligibleExistingTickets"
              :key="ticket.id"
              type="button"
              class="flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors"
              :class="selectedExistingTicketIds.includes(ticket.id)
                ? 'border-indigo-500/40 bg-indigo-500/10'
                : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
              @click="toggleExistingTicket(ticket.id)"
            >
              <input
                type="checkbox"
                class="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-black/20 accent-indigo-500"
                :checked="selectedExistingTicketIds.includes(ticket.id)"
                @click.stop="toggleExistingTicket(ticket.id)"
              >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span v-if="projects.activeProject?.code && ticket.number" class="shrink-0 font-mono text-[10px] text-white/30">
                    {{ ticketKey(projects.activeProject.code, ticket.number) }}
                  </span>
                  <span class="truncate text-xs font-medium text-white/75">{{ ticket.title }}</span>
                </div>
                <div class="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                  <span class="rounded bg-white/10 px-1.5 py-0.5 uppercase text-white/45">{{ ticket.status }}</span>
                  <span class="rounded bg-white/10 px-1.5 py-0.5 uppercase text-white/45">{{ ticket.priority }}</span>
                  <span class="rounded bg-white/10 px-1.5 py-0.5 uppercase text-white/45">{{ ticket.type }}</span>
                </div>
              </div>
            </button>
          </div>

          <p v-else class="mt-3 rounded-lg border border-dashed border-[var(--border)] bg-black/10 px-3 py-4 text-center text-xs text-white/35">
            No unassigned existing tickets are available.
          </p>
        </div>

        <div class="flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button class="text-xs text-white/40 hover:text-white/60 transition-colors" @click="showCreate = false">
            Cancel
          </button>
          <div class="flex flex-wrap justify-end gap-2">
            <button
              class="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-50"
              :disabled="creatingTickets"
              @click="finishCreate(false, false)"
            >
              Create sprint only
            </button>
            <button
              v-if="selectedExistingCount"
              class="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 transition-colors hover:bg-indigo-500/15 disabled:opacity-50"
              :disabled="creatingTickets"
              @click="finishCreate(false, true)"
            >
              Create + {{ selectedExistingCount }} existing
            </button>
          </div>
          <GlassButton @click="goToStep2">
            Next — Sprint Plan →
          </GlassButton>
        </div>
      </div>

      <!-- Step 2: Clarifications -->
      <div v-else-if="wizardStep === 2" class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Sprint Plan</label>
            <div class="flex items-center gap-1 bg-white/[0.04] rounded-md p-0.5">
              <button
                class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                :class="!planPreviewMode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="planPreviewMode = false"
              >
                <Edit3 class="size-3" /> Write
              </button>
              <button
                class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                :class="planPreviewMode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="planPreviewMode = true"
              >
                <Eye class="size-3" /> Preview
              </button>
            </div>
          </div>

          <textarea
            v-if="!planPreviewMode"
            v-model="sprintPlanMarkdown"
            rows="7"
            placeholder="## Goal&#10;Describe the sprint goal...&#10;&#10;## Possible tasks&#10;- Build login page&#10;- Fix authentication bug&#10;- Deploy to staging"
            class="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/50 transition-colors resize-none font-mono leading-relaxed"
          />
          <div
            v-else
            class="min-h-[168px] bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3 markdown-preview overflow-y-auto custom-scroll"
            v-html="planHtml"
          />
        </div>

        <div
          class="rounded-lg border px-3 py-2.5"
          :class="useClarificationPass ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-amber-500/25 bg-amber-500/10'"
        >
          <GlassCheckbox v-model="useClarificationPass" size="sm" class="text-xs font-medium" :class="useClarificationPass ? 'text-indigo-100' : 'text-amber-200'">
            Use Codex clarification pass
          </GlassCheckbox>
          <p class="text-xs mt-1 leading-relaxed" :class="useClarificationPass ? 'text-indigo-100/60' : 'text-amber-100/70'">
            Recommended: leave this enabled so Codex can ask focused questions before it turns the plan into tickets.
          </p>
        </div>

        <div v-if="clarifying" class="flex items-center gap-2 text-sm text-white/50 py-6 justify-center">
          <Loader2 class="size-4 animate-spin text-indigo-300" />
          Codex is asking the right questions...
        </div>

        <div v-if="clarificationError" class="text-xs text-amber-300 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
          {{ clarificationError }}
          <button class="ml-2 underline" @click="requestClarifications">Retry</button>
        </div>

        <div v-if="!clarifying && useClarificationPass && currentClarification" class="rounded-lg border border-[var(--border)] bg-white/[0.03] p-3 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
              Question {{ activeClarificationIndex + 1 }} of {{ clarificationQuestions.length }}
            </p>
            <div class="flex gap-1">
              <span
                v-for="(_, i) in clarificationQuestions"
                :key="i"
                class="h-1.5 w-4 rounded-full"
                :class="i <= activeClarificationIndex ? 'bg-indigo-400' : 'bg-white/10'"
              />
            </div>
          </div>

          <p class="text-sm font-medium text-[var(--text)] leading-relaxed">
            {{ currentClarification.question }}
          </p>

          <div class="grid gap-2">
            <button
              v-for="option in currentClarification.options"
              :key="option.label"
              type="button"
              class="rounded-lg border px-3 py-2 text-left transition-colors"
              :class="currentClarification.selectedOption === option.label
                ? 'border-indigo-500/50 bg-indigo-500/15'
                : 'border-[var(--border)] bg-black/10 hover:border-indigo-500/30 hover:bg-indigo-500/5'"
              @click="currentClarification.selectedOption = option.label"
            >
              <span class="block text-xs font-medium text-[var(--text)]">{{ option.label }}</span>
              <span v-if="option.description" class="block text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{{ option.description }}</span>
            </button>
          </div>

          <textarea
            v-model="currentClarification.customAnswer"
            rows="2"
            placeholder="Free text notes, constraints, or a different answer..."
            class="w-full bg-black/20 border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/50 transition-colors resize-none"
          />
        </div>

        <div v-if="!clarifying && useClarificationPass && clarificationAsked && !clarificationQuestions.length" class="text-sm text-white/40 text-center py-6">
          No clarification questions are available. You can continue to ticket generation.
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <button class="text-xs text-white/40 hover:text-white/60 transition-colors" @click="backFromSprintPlan">
            ← Back
          </button>
          <div class="flex items-center gap-2">
            <GlassButton size="sm" :disabled="clarifying" @click="continueSprintPlan">
              <Loader2 v-if="clarifying" class="size-3.5 animate-spin" />
              {{ sprintPlanContinueLabel }}
            </GlassButton>
          </div>
        </div>
      </div>

      <!-- Step 3: Plan + AI -->
      <div v-else class="space-y-4">

        <!-- Markdown plan editor -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Sprint Plan</label>
            <div class="flex items-center gap-1 bg-white/[0.04] rounded-md p-0.5">
              <button
                class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                :class="!planPreviewMode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="planPreviewMode = false"
              >
                <Edit3 class="size-3" /> Write
              </button>
              <button
                class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                :class="planPreviewMode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="planPreviewMode = true"
              >
                <Eye class="size-3" /> Preview
              </button>
            </div>
          </div>

          <textarea
            v-if="!planPreviewMode"
            v-model="sprintPlanMarkdown"
            rows="7"
            placeholder="## Goal&#10;Describe the sprint goal…&#10;&#10;## Possible tasks&#10;- Build login page&#10;- Fix authentication bug&#10;- Deploy to staging"
            class="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/50 transition-colors resize-none font-mono leading-relaxed"
          />
          <div
            v-else
            class="min-h-[168px] bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3 markdown-preview overflow-y-auto custom-scroll"
            v-html="planHtml"
          />
        </div>

        <div class="border-t border-[var(--border)] pt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-white/50 uppercase tracking-wider">AI Ticket Suggestions</span>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
              :disabled="aiAnalyzing"
              @click="generateTickets"
            >
              <Loader2 v-if="aiAnalyzing" class="size-3.5 animate-spin" />
              <Wand2 v-else class="size-3.5" />
              {{ aiAnalyzing ? 'Generating…' : 'Generate from plan' }}
            </button>
          </div>

          <div v-if="aiError" class="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20 mb-2">
            {{ aiError }}
            <button class="ml-2 underline" @click="generateTickets">Retry</button>
          </div>

          <div v-if="aiAnalyzed && aiSuggestions.length" class="space-y-1.5 max-h-[200px] overflow-y-auto custom-scroll">
            <div
              v-for="(s, i) in aiSuggestions"
              :key="i"
              class="flex items-start gap-2.5 px-2.5 py-2 rounded-lg border border-[var(--border)] hover:border-indigo-500/30 transition-colors cursor-pointer"
              :class="s.selected ? 'bg-indigo-500/5' : 'opacity-50'"
              @click="s.selected = !s.selected"
            >
              <GlassCheckbox v-model="s.selected" size="sm" class="mt-0.5 shrink-0" @click.stop />
              <div class="flex-1 min-w-0">
                <span class="text-xs font-medium text-[var(--text)] block truncate">{{ s.title }}</span>
                <div class="flex gap-1.5 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase" :class="typeBadge[s.type] ?? 'bg-white/10 text-white/40'">{{ s.type }}</span>
                  <span class="text-[10px] font-medium" :class="priorityBadge[s.priority] ?? 'text-white/40'">{{ s.priority }}</span>
                </div>
              </div>
            </div>
          </div>

          <p v-if="aiAnalyzed && aiSuggestions.length" class="text-[10px] text-white/30 mt-1.5">
            {{ selectedCount }} of {{ aiSuggestions.length }} selected
          </p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <button class="text-xs text-white/40 hover:text-white/60 transition-colors" @click="wizardStep = 2">
            ← Back
          </button>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
              :disabled="creatingTickets"
              @click="finishCreate(false)"
            >
              Create sprint only
            </button>
            <button
              v-if="aiAnalyzed && selectedCount > 0"
              class="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50"
              :disabled="creatingTickets"
              @click="finishCreate(true)"
            >
              <Loader2 v-if="creatingTickets" class="size-3.5 animate-spin" />
              <Plus v-else class="size-3.5" />
              Create sprint + {{ selectedCount }} ticket{{ selectedCount !== 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </div>
    </GlassModal>

    <GlassModal v-model="showHandoverPicker" title="AI Handover" max-width="md">
      <div class="space-y-4">
        <p class="text-sm text-[var(--text-muted)]">
          Hand over {{ handoverSprint?.name ?? 'this sprint' }} and its tickets to an AI tool.
        </p>

        <div class="grid gap-3">
          <button
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
            :class="selectedHandoverTool === 'codex' ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
            @click="selectedHandoverTool = 'codex'"
          >
            <div class="grid size-9 place-items-center rounded-lg border border-indigo-500/30 bg-indigo-500/15 text-sm font-semibold text-indigo-200">
              C
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[var(--text)]">Codex</p>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Runs against the project with workspace-write access.</p>
            </div>
          </button>

          <button
            class="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-[var(--border)] bg-black/10 px-4 py-3 text-left opacity-55"
            disabled
          >
            <div class="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-[var(--text-muted)]">
              Cl
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[var(--text-muted)]">Claude</p>
              <p class="mt-0.5 text-xs text-[var(--text-faint)]">Claude handover integration is not available yet.</p>
            </div>
          </button>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-[var(--text-muted)]">Effort Level</p>
          <div class="grid gap-2 sm:grid-cols-3">
            <button
              v-for="option in handoverEffortOptions"
              :key="option.value"
              class="rounded-xl border px-3 py-3 text-left transition-colors"
              :class="selectedHandoverEffort === option.value ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
              @click="selectedHandoverEffort = option.value"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold text-[var(--text)]">{{ option.label }}</p>
                <span class="text-[10px] text-[var(--text-faint)]">{{ option.value }}</span>
              </div>
              <p class="mt-1 text-[10px] leading-relaxed text-[var(--text-muted)]">{{ option.detail }}</p>
              <p class="mt-2 text-[10px] font-medium text-indigo-300">{{ option.tokenNote }}</p>
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200/80">
          Codex may edit files in the selected project for this handover. It will not commit or push changes.
        </div>

        <div class="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <button
            class="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            @click="showHandoverPicker = false"
          >
            Cancel
          </button>
          <button
            class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="handoverRunning"
            @click="runAIHandover"
          >
            <Loader2 v-if="handoverRunning" class="size-3.5 animate-spin" />
            <Bot v-else class="size-3.5" />
            Start {{ selectedHandoverEffortOption.label }} Handover
          </button>
        </div>
      </div>
    </GlassModal>

    <!-- No-tickets warning modal -->
    <GlassModal v-model="showNoTicketsWarning" title="Sprint has no tickets" max-width="sm">
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle class="size-4 text-amber-400 mt-0.5 shrink-0" />
          <p class="text-sm text-amber-200/80">
            This sprint has no tickets assigned. Starting an empty sprint makes it harder to track progress.
          </p>
        </div>
        <p class="text-xs text-white/40">You can add tickets before or after starting the sprint.</p>
        <div class="flex items-center gap-2 justify-end">
          <button
            class="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            @click="showNoTicketsWarning = false"
          >
            Cancel
          </button>
          <button
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            @click="pendingStartId && confirmStartSprint(pendingStartId)"
          >
            <Play class="size-3.5" />
            Start anyway
          </button>
        </div>
      </div>
    </GlassModal>

    <!-- Past sprints -->
    <div v-if="sprint.completedSprints.length > 0" class="mt-8">
      <h4 class="text-sm font-semibold text-white/40 mb-3 uppercase tracking-wider">Completed Sprints</h4>
      <div class="space-y-2">
        <div v-for="s in sprint.completedSprints" :key="s.id" class="glass-sm rounded-xl overflow-hidden">
          <button
            class="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
            @click="toggleSprintTickets(s.id)"
          >
            <div>
              <p class="text-sm font-medium text-white/60">{{ s.name }}</p>
              <p class="text-xs text-white/30">{{ formatDate(s.startDate) }} → {{ formatDate(s.endDate) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <GlassBadge variant="default">{{ s.ticketIds.length }} tickets</GlassBadge>
              <component :is="isSprintExpanded(s.id) ? ChevronDown : ChevronRight" class="size-3.5 text-white/30" />
            </div>
          </button>
          <div v-if="isSprintExpanded(s.id)" class="border-t border-[var(--border)] px-4 py-3 space-y-3 bg-black/10">
            <p v-if="!ticketsForSprint(s).length" class="text-sm text-white/30 text-center py-3">
              No tickets assigned.
            </p>
            <div v-for="group in groupedTicketsForSprint(s)" :key="group.type" class="space-y-1.5">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-white/30">{{ group.type }}</p>
              <SprintCard
                v-for="ticket in group.tickets"
                :key="ticket.id"
                :ticket="ticket"
                @mark-done="markDone"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sprint ticket picker -->
  <SprintTicketPicker
    v-if="pickerSprint && showTicketPicker"
    v-model="showTicketPicker"
    :sprint="pickerSprint"
    @update:model-value="(v) => { if (!v) pickerSprint = null }"
  />
</template>

<style scoped>
.markdown-preview :deep(h1) { font-size: 1.125rem; font-weight: 700; color: white; margin-top: 1rem; margin-bottom: 0.5rem; }
.markdown-preview :deep(h2) { font-size: 1rem; font-weight: 600; color: white; margin-top: 0.75rem; margin-bottom: 0.375rem; }
.markdown-preview :deep(h3) { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.8); margin-top: 0.5rem; margin-bottom: 0.25rem; }
.markdown-preview :deep(p)  { font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-bottom: 0.5rem; }
.markdown-preview :deep(ul) { list-style-type: disc; margin-left: 1rem; }
.markdown-preview :deep(ol) { list-style-type: decimal; margin-left: 1rem; }
.markdown-preview :deep(li) { font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-bottom: 0.125rem; }
.markdown-preview :deep(strong) { font-weight: 600; color: rgba(255,255,255,0.8); }
.markdown-preview :deep(em)     { font-style: italic; color: rgba(255,255,255,0.6); }
.markdown-preview :deep(code)   { font-size: 0.6875rem; font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: #c4b5fd; }
.markdown-preview :deep(pre)    { background: rgba(255,255,255,0.06); border-radius: 0.375rem; padding: 0.75rem; overflow-x: auto; margin-bottom: 0.5rem; }
.markdown-preview :deep(pre code) { background: transparent; padding: 0; }
.markdown-preview :deep(blockquote) { border-left: 2px solid rgba(99,102,241,0.4); padding-left: 0.75rem; color: rgba(255,255,255,0.4); font-style: italic; }
.markdown-preview :deep(hr) { border-color: rgba(255,255,255,0.1); margin: 0.75rem 0; }
</style>
