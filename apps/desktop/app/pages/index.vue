<script setup lang="ts">
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  Newspaper,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { deriveProjectCode } from '~/utils/ticket'

const projects = useProjectsStore()
const wizard = useWizardStore()
const { createProject } = useVindictaJson()
const { notify } = useNotifications()

onMounted(async () => {
  await projects.loadProjects()
})

const activeProject = computed(() => projects.activeProject)
const toolCount = computed(() => activeProject.value?.aiTools?.length || (activeProject.value?.aiTool ? 1 : 0))

const stats = computed(() => [
  { label: 'Projects', value: projects.projects.length, icon: FolderOpen, tone: 'text-indigo-300' },
  { label: 'AI Tools', value: new Set(projects.projects.flatMap(p => p.aiTools?.length ? p.aiTools : [p.aiTool])).size, icon: Zap, tone: 'text-emerald-300' },
  { label: 'Guides', value: 4, icon: BookOpen, tone: 'text-sky-300' },
])

const guides = [
  { title: 'Plan a sprint with AI', detail: 'Start from a goal, clarify scope, then finalize tickets.', icon: Sparkles },
  { title: 'Keep one active project', detail: 'Use the sidebar selector to scope tools and workflows.', icon: FolderOpen },
  { title: 'Run Doctor first', detail: 'Check npm, Codex, and local app health before automation.', icon: Wrench },
  { title: 'Review before shipping', detail: 'Use boards, histories, and security checks to keep work visible.', icon: ShieldCheck },
]

const news = [
  { tag: 'New', title: 'Service Controller preview is available', detail: 'Postgres, Redis, RabbitMQ, and local stack controls now have a dedicated tool page.' },
  { tag: 'Update', title: 'Security Analyzer workspace added', detail: 'A project-aware analyzer shell is ready for future dependency, secret, and service-port scans.' },
  { tag: 'Guide', title: 'Active project selector moved to the sidebar', detail: 'Tools now follow the selected project, even outside the project workspace.' },
]

async function handleFinish() {
  if (!wizard.selectedPath || !wizard.projectName || !wizard.selectedEditor) return

  const data = await createProject(wizard.selectedPath, {
    name: wizard.projectName,
    description: wizard.projectDescription,
    absolutePath: wizard.selectedPath,
    githubRepo: null,
    editor: wizard.selectedEditor,
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
            <h1 class="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">Welcome back to Vindicta</h1>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              Plan focused sprints, keep AI work scoped to the selected project, and turn local tooling into a calmer command center.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <GlassButton @click="wizard.openWizard()">
              <Plus class="size-3.5" />
              Add Project
            </GlassButton>
            <NuxtLink
              :to="activeProject ? `/projects/${activeProject.id}` : '/services'"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.07] hover:text-[var(--text)]"
            >
              {{ activeProject ? 'Open Workspace' : 'Explore Tools' }}
              <ArrowRight class="size-3.5" />
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-xl border border-white/10 bg-black/15 p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]">Active Project</p>
              <p class="mt-1 truncate text-lg font-semibold text-[var(--text)]">{{ activeProject?.name ?? 'No project selected' }}</p>
            </div>
            <FolderOpen class="size-5 text-indigo-300" />
          </div>
          <p class="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
            {{ activeProject?.absolutePath ?? 'Add or select a project from the sidebar to scope tools, queues, and analyzer results.' }}
          </p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Code</p>
              <p class="mt-1 text-sm font-semibold text-[var(--text)]">{{ activeProject?.code ?? '-' }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">AI Tools</p>
              <p class="mt-1 text-sm font-semibold text-[var(--text)]">{{ toolCount }}</p>
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

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div class="flex items-center justify-between border-b border-[var(--border)] p-4">
            <div>
              <h2 class="text-sm font-semibold text-[var(--text)]">News & Updates</h2>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">What changed around your local workspace.</p>
            </div>
            <Newspaper class="size-4 text-violet-300" />
          </div>
          <div class="divide-y divide-[var(--border)]">
            <article
              v-for="item in news"
              :key="item.title"
              class="flex gap-3 p-4"
            >
              <span class="mt-0.5 shrink-0 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                {{ item.tag }}
              </span>
              <div>
                <h3 class="text-sm font-semibold text-[var(--text)]">{{ item.title }}</h3>
                <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ item.detail }}</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <aside class="space-y-6">
        <section class="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <div class="flex items-center gap-2">
            <Award class="size-4 text-amber-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Get Vindicta Certified</h2>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
            A future learning track for project setup, sprint planning, AI handoff, security review, and local service operations.
          </p>
          <button class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15">
            View Track
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
              to="/services"
              class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
            >
              Service Controller
              <ArrowRight class="size-3.5" />
            </NuxtLink>
            <NuxtLink
              to="/security"
              class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
            >
              Security Analyzer
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
              <p class="text-xs leading-relaxed text-[var(--text-muted)]">Pick an active project before opening tools.</p>
            </div>
            <div class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
              <p class="text-xs leading-relaxed text-[var(--text-muted)]">Use the project Info tab to review README context.</p>
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
