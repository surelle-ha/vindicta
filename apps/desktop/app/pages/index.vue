<script setup lang="ts">
import {
  ArrowRight,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { deriveProjectCode } from '~/utils/ticket'

const projects = useProjectsStore()
const security = useSecurityStore()
const wizard = useWizardStore()
const { createProject } = useVindictaJson()
const { notify } = useNotifications()

onMounted(async () => {
  await projects.loadProjects()
  await loadActiveSecurity()
})

const activeProject = computed(() => projects.activeProject)
const latestScanLabel = computed(() => security.latestScan ? new Date(security.latestScan.scannedAt).toLocaleDateString() : 'No scan')

const stats = computed(() => [
  { label: 'Projects', value: projects.projects.length, icon: FolderOpen, tone: 'text-indigo-300' },
  { label: 'Open Findings', value: security.openFindings, icon: AlertTriangle, tone: 'text-red-300' },
  { label: 'Saved Scans', value: security.scans.length, icon: Zap, tone: 'text-emerald-300' },
])

const guides = [
  { title: 'Run a security scan', detail: 'Select a project, choose effort, and let Codex inspect concrete risks.', icon: ShieldCheck },
  { title: 'Keep one active project', detail: 'Use the sidebar selector to scope scans, reports, and findings.', icon: FolderOpen },
  { title: 'Run Doctor first', detail: 'Check npm, Codex, and local app health before automation.', icon: Wrench },
  { title: 'Track remediation', detail: 'Convert scan results into security findings and move them to closure.', icon: Sparkles },
]


async function loadActiveSecurity() {
  if (!activeProject.value?.absolutePath) return
  await security.load(activeProject.value.absolutePath, activeProject.value.id).catch(() => {})
}

watch(() => activeProject.value?.id, () => {
  void loadActiveSecurity()
})

async function handleFinish() {
  if (!wizard.selectedPath || !wizard.projectName) return

  const data = await createProject(wizard.selectedPath, {
    name: wizard.projectName,
    description: wizard.projectDescription,
    absolutePath: wizard.selectedPath,
    githubRepo: null,
    editor: 'other',
    aiTool: wizard.selectedAITools[0] ?? 'codex',
    aiTools: wizard.selectedAITools,
    activeAITool: null,
    ownedBy: 'local',
    code: wizard.projectCode || deriveProjectCode(wizard.projectName),
  })

  await projects.addProject(data.meta)
  projects.setActive(data.meta.id)
  wizard.closeWizard()
  notify(`Project "${data.meta.name}" added`, 'success')
  await navigateTo(`/projects/${data.meta.id}`)
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section class="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_84%_20%,rgba(20,184,166,0.16),transparent_24%)]" />
      <div class="relative grid gap-6 p-5 lg:grid-cols-[1fr_22rem] lg:p-6">
        <div class="space-y-5">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300/70">Home</p>
            <div class="mt-2 flex items-center gap-3">
              <ProjectGuideOrb accent="#67e8f9" />
              <h1 class="text-3xl font-bold tracking-tight text-[var(--text)]">Welcome back to Vindicta</h1>
            </div>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              Scan local projects for vulnerabilities, keep findings scoped to the selected codebase, and turn security review into a calmer command center.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <GlassButton @click="wizard.openWizard()">
              <Plus class="size-3.5" />
              Add Project
            </GlassButton>
            <NuxtLink
              :to="activeProject ? `/projects/${activeProject.id}` : '/'"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.07] hover:text-[var(--text)]"
            >
              {{ activeProject ? 'Open Workspace' : 'Select Project' }}
              <ArrowRight class="size-3.5" />
            </NuxtLink>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-xl border border-white/10 bg-black/15 p-4">
          <div class="relative flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]">Active Project</p>
              <p class="mt-1 truncate text-lg font-semibold text-[var(--text)]">{{ activeProject?.name ?? 'No project selected' }}</p>
            </div>
            <FolderOpen class="size-5 text-indigo-300" />
          </div>
          <p class="relative mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
            {{ activeProject?.absolutePath ?? 'Add or select a project from the sidebar to scope tools, queues, and analyzer results.' }}
          </p>
          <div class="relative mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Code</p>
              <p class="mt-1 text-sm font-semibold text-[var(--text)]">{{ activeProject?.code ?? '-' }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Last Scan</p>
              <p class="mt-1 truncate text-sm font-semibold text-[var(--text)]">{{ latestScanLabel }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-3 sm:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">{{ stat.label }}</p>
          <component :is="stat.icon" class="size-3.5" :class="stat.tone" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ stat.value }}</p>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <main class="space-y-6">
        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div class="flex items-center justify-between border-b border-[var(--border)] p-4">
            <div>
              <h2 class="text-sm font-semibold text-[var(--text)]">Start Guide</h2>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">A short path through the current Vindicta workflow.</p>
            </div>
            <BookOpen class="size-4 text-sky-300" />
          </div>
          <div class="grid gap-3 p-4 md:grid-cols-2">
            <article
              v-for="guide in guides"
              :key="guide.title"
              class="rounded-lg border border-[var(--border)] bg-black/10 p-4"
            >
              <component :is="guide.icon" class="size-4 text-indigo-300" />
              <h3 class="mt-3 text-sm font-semibold text-[var(--text)]">{{ guide.title }}</h3>
              <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ guide.detail }}</p>
            </article>
          </div>
        </section>

      </main>

      <aside class="space-y-6">
        <section class="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <div class="flex items-center gap-2">
            <ShieldCheck class="size-4 text-amber-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Security Routine</h2>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
            Keep a quick scan fresh, review new evidence, and export a report before release decisions.
          </p>
          <button class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15">
            View Workspace
            <ArrowRight class="size-3.5" />
          </button>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <Rocket class="size-4 text-emerald-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Quick Actions</h2>
          </div>
          <div class="mt-4 space-y-2">
            <NuxtLink
              :to="activeProject ? `/projects/${activeProject.id}?tab=scanner` : '/'"
              class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
            >
              Run Scanner
              <ArrowRight class="size-3.5" />
            </NuxtLink>
            <button
              class="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
              @click="wizard.openWizard()"
            >
              Add Project
              <Plus class="size-3.5" />
            </button>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <CalendarDays class="size-4 text-indigo-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Today</h2>
          </div>
          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
              <p class="text-xs leading-relaxed text-[var(--text-muted)]">Pick an active project before running scans.</p>
            </div>
            <div class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
              <p class="text-xs leading-relaxed text-[var(--text-muted)]">Open findings with full evidence before creating remediation items.</p>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <GlassModal
      v-model="wizard.open"
      title="Add Project"
      max-width="md"
      @close="wizard.closeWizard()"
    >
      <WizardShell @finish="handleFinish" />
    </GlassModal>
  </div>
</template>
