<script setup lang="ts">
import { AlertTriangle, Bot, CheckCircle2, Clock3, FileDiff, Loader2, Play, Terminal } from 'lucide-vue-next'
import { runCodexExec } from '~/composables/useCodexShell'
import type { Sprint, Ticket } from '~/types/vindicta'
import { ticketKey } from '~/utils/ticket'

const props = defineProps<{
  projectId: string
}>()

const aiActivity = useAIActivityStore()
const projects = useProjectsStore()
const sprint = useSprintStore()
const kanban = useKanbanStore()
const { notify } = useNotifications()
const ticker = ref(Date.now())
const resuming = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const projectJobs = computed(() => aiActivity.projectJobs(props.projectId))
const project = computed(() => projects.projects.find(item => item.id === props.projectId) ?? projects.activeProject)
const selectedJobId = computed({
  get: () => aiActivity.activeJobId && projectJobs.value.some(job => job.id === aiActivity.activeJobId)
    ? aiActivity.activeJobId
    : projectJobs.value[0]?.id ?? '',
  set: (id: string) => aiActivity.setActive(id),
})
const selectedJob = computed(() => projectJobs.value.find(job => job.id === selectedJobId.value) ?? projectJobs.value[0] ?? null)
const canResumeSelectedJob = computed(() =>
  Boolean(
    selectedJob.value
    && selectedJob.value.kind === 'sprint-handover'
    && selectedJob.value.sprintId
    && (selectedJob.value.status === 'interrupted' || selectedJob.value.status === 'error'),
  ),
)

onMounted(() => {
  timer = setInterval(() => {
    ticker.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function elapsedLabel(startedAt: string, endedAt?: string | null) {
  const end = endedAt ? new Date(endedAt).getTime() : ticker.value
  const total = Math.max(0, Math.floor((end - new Date(startedAt).getTime()) / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return minutes ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`
}

function statusClass(status: string) {
  if (status === 'done') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
  if (status === 'warning') return 'border-amber-500/25 bg-amber-500/10 text-amber-200'
  if (status === 'interrupted') return 'border-amber-500/25 bg-amber-500/10 text-amber-200'
  if (status === 'error') return 'border-red-500/25 bg-red-500/10 text-red-200'
  return 'border-indigo-500/25 bg-indigo-500/10 text-indigo-200'
}

function ticketsForSprint(s: Sprint): Ticket[] {
  return s.ticketIds
    .map(id => kanban.tickets.find(ticket => ticket.id === id))
    .filter(Boolean) as Ticket[]
}

function effortDetail(effort: string) {
  if (effort === 'low') return 'Review the sprint, make only obvious low-risk progress, and report blockers quickly.'
  if (effort === 'high' || effort === 'xhigh') return 'Make a thorough pass across tickets, code paths, tests, and integration risks.'
  return 'Default handover depth for implementing focused tickets and documenting follow-ups.'
}

function buildSprintHandoverPrompt(s: Sprint, tickets: Ticket[], effort: string) {
  const ticketPayload = tickets.map(ticket => ({
    key: project.value?.code && ticket.number ? ticketKey(project.value.code, ticket.number) : `#${ticket.number}`,
    id: ticket.id,
    title: ticket.title,
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    labels: ticket.labels,
    description: ticket.description,
  }))

  return `You are Codex working inside Vindicta. The user is resuming an interrupted AI handover for an entire sprint.

Project: ${project.value?.name ?? 'Unknown project'}
Sprint: ${s.name}
Sprint goal: ${s.goal || '(no goal provided)'}
Sprint status: ${s.status}
Sprint window: ${s.startDate} to ${s.endDate}

Effort level: ${effort}
Effort guidance: ${effortDetail(effort)}

Tickets:
${JSON.stringify(ticketPayload, null, 2)}

Instructions:
- Inspect the codebase and current git/worktree state before changing files.
- Continue useful work for the sprint tickets where practical.
- Keep edits focused on the sprint scope and avoid unrelated refactors.
- Do not commit, push, install new dependencies, or run destructive commands.
- If previous partial edits exist, work with them instead of reverting them.
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

function friendlyCodexError(message: string) {
  if (/@openai\/codex-win32-x64|Missing optional dependency/i.test(message)) {
    return 'Codex CLI is installed but its Windows runtime dependency is missing. Open Settings > Doctor and use Install/Repair Codex, or run npm install -g @openai/codex@latest.'
  }
  return message
}

async function resumeSelectedHandover() {
  const interruptedJob = selectedJob.value
  const activeProject = project.value
  if (!interruptedJob?.sprintId || !activeProject?.absolutePath) return
  const selectedSprint = sprint.sprints.find(item => item.id === interruptedJob.sprintId)
  if (!selectedSprint) {
    notify('Could not find the sprint for this handover.', 'warning')
    return
  }

  const sprintTickets = ticketsForSprint(selectedSprint)
  resuming.value = true
  const effort = interruptedJob.effort
  const jobId = aiActivity.startJob({
    kind: 'sprint-handover',
    title: `Resume handover: ${selectedSprint.name}`,
    projectId: activeProject.id,
    projectName: activeProject.name,
    projectPath: activeProject.absolutePath,
    sprintId: selectedSprint.id,
    sprintName: selectedSprint.name,
    tool: 'codex',
    effort,
    ticketCount: sprintTickets.length,
    firstStep: 'Resuming sprint handover',
    firstDetail: `Starting a new Codex run for ${sprintTickets.length} sprint ticket${sprintTickets.length === 1 ? '' : 's'}.`,
  })

  try {
    aiActivity.addEvent(jobId, 'Launching Codex', 'Starting Codex with workspace-write access for this project.', 'running')
    const result = await runCodexExec({
      projectPath: activeProject.absolutePath,
      prompt: buildSprintHandoverPrompt(selectedSprint, sprintTickets, effort),
      model: `Codex CLI default (${effort} resumed handover)`,
      reasoningEffort: effort,
      sandbox: 'workspace-write',
    })
    const responseText = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    if (result.code !== 0) throw new Error(responseText || 'Codex handover failed.')
    if (!responseText) throw new Error('Codex completed without returning a handover report.')
    aiActivity.finishJob(jobId, 'done', `Codex finished resumed handover for ${selectedSprint.name}.`, responseText)
    notify(`AI handover resumed and completed for "${selectedSprint.name}".`, 'success')
  }
  catch (e: any) {
    const message = friendlyCodexError(e?.message ?? 'AI handover resume failed.')
    aiActivity.finishJob(jobId, 'error', message)
    notify('AI handover resume failed.', 'error')
  }
  finally {
    resuming.value = false
  }
}
</script>

<template>
  <div class="grid gap-5 xl:grid-cols-[19rem_1fr]">
    <aside class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
      <div class="flex items-center gap-2 px-1 pb-3">
        <Bot class="size-4 text-indigo-300" />
        <div>
          <h2 class="text-sm font-semibold text-[var(--text)]">AI Workspace</h2>
          <p class="text-[10px] text-[var(--text-faint)]">Activity, output, and handover history.</p>
        </div>
      </div>

      <div v-if="projectJobs.length" class="space-y-2">
        <button
          v-for="job in projectJobs"
          :key="job.id"
          class="w-full rounded-lg border px-3 py-2 text-left transition-colors"
          :class="job.id === selectedJobId ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
          @click="selectedJobId = job.id"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-xs font-semibold text-[var(--text)]">{{ job.title }}</span>
            <span class="rounded-full border px-1.5 py-0.5 text-[10px] capitalize" :class="statusClass(job.status)">
              {{ job.status }}
            </span>
          </div>
          <p class="mt-1 truncate text-[10px] text-[var(--text-muted)]">{{ job.currentStep }}</p>
          <p class="mt-1 text-[10px] text-[var(--text-faint)]">{{ elapsedLabel(job.startedAt, job.endedAt) }} - {{ job.effort }} effort</p>
        </button>
      </div>

      <div v-else class="rounded-lg border border-dashed border-[var(--border)] bg-black/10 px-3 py-8 text-center">
        <Bot class="mx-auto size-5 text-[var(--text-faint)]" />
        <p class="mt-2 text-xs text-[var(--text-muted)]">No AI workspace runs yet.</p>
      </div>
    </aside>

    <section v-if="selectedJob" class="space-y-5">
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="statusClass(selectedJob.status)">
                {{ selectedJob.status }}
              </span>
              <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[var(--text-muted)] capitalize">
                {{ selectedJob.tool }}
              </span>
              <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                {{ selectedJob.effort }} effort
              </span>
            </div>
            <h1 class="mt-2 text-lg font-semibold text-[var(--text)]">{{ selectedJob.title }}</h1>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              {{ selectedJob.summary || selectedJob.currentStep }}
            </p>
            <button
              v-if="canResumeSelectedJob"
              class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="resuming"
              @click="resumeSelectedHandover"
            >
              <Loader2 v-if="resuming" class="size-3.5 animate-spin" />
              <Play v-else class="size-3.5" />
              Resume Handover
            </button>
          </div>
          <div class="rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-right">
            <div class="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
              <Clock3 class="size-3" />
              Elapsed
            </div>
            <p class="mt-1 font-mono text-sm text-[var(--text)]">{{ elapsedLabel(selectedJob.startedAt, selectedJob.endedAt) }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <Loader2 v-if="selectedJob.status === 'running'" class="size-3.5 animate-spin text-indigo-300" />
            <CheckCircle2 v-else-if="selectedJob.status === 'done'" class="size-3.5 text-emerald-300" />
            <AlertTriangle v-else class="size-3.5 text-amber-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Activity</h2>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            Vindicta shows observable tool progress and output. Private model thoughts are not exposed.
          </p>
          <div class="mt-3 space-y-2">
            <div
              v-for="event in selectedJob.events"
              :key="event.id"
              class="rounded-lg border px-3 py-2"
              :class="statusClass(event.status)"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-medium">{{ event.label }}</p>
                <span class="text-[10px]">{{ new Date(event.at).toLocaleTimeString() }}</span>
              </div>
              <p class="mt-1 text-[10px] leading-relaxed opacity-80">{{ event.detail }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <FileDiff class="size-3.5 text-violet-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Changes & Handover</h2>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            Codex reports completed work, changed files, risks, and follow-ups here after the handover run.
          </p>
          <pre v-if="selectedJob.output" class="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/20 p-3 text-[11px] leading-relaxed text-[var(--text-muted)] custom-scroll">{{ selectedJob.output }}</pre>
          <div v-else class="mt-3 rounded-lg border border-dashed border-[var(--border)] bg-black/10 px-3 py-8 text-center">
            <Terminal class="mx-auto size-5 text-[var(--text-faint)]" />
            <p class="mt-2 text-xs text-[var(--text-muted)]">Codex output will appear when the run reports back.</p>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
