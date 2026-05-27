<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Loader2, Terminal } from 'lucide-vue-next'
import type { SecurityFindingStatus } from '~/types/vindicta'

const route = useRoute()
const projects = useProjectsStore()
const security = useSecurityStore()

const loading = ref(true)

const findingId = computed(() => decodeURIComponent(route.params.findingId as string))
const projectId = computed(() => String(route.query.project ?? ''))
const scanId = computed(() => route.query.scan ? String(route.query.scan) : null)
const project = computed(() => projects.projects.find(item => item.id === projectId.value) ?? projects.activeProject ?? null)
const scan = computed(() => scanId.value ? security.scans.find(item => item.id === scanId.value) ?? null : null)
const scanFinding = computed(() => scan.value?.findings.find(item => item.id === findingId.value) ?? null)
const remediationFinding = computed(() => security.findings.find(item => item.id === findingId.value) ?? null)
const finding = computed(() => remediationFinding.value ?? scanFinding.value)
const statusOptions: SecurityFindingStatus[] = ['open', 'triaged', 'in_progress', 'resolved', 'ignored']

const severityClasses: Record<string, string> = {
  critical: 'border-red-500/30 bg-red-500/10 text-red-300',
  high: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
  medium: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  low: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
}

const backTarget = computed(() => {
  if (!project.value) return '/'
  return remediationFinding.value
    ? `/projects/${project.value.id}?tab=findings`
    : `/projects/${project.value.id}?tab=scanner`
})

onMounted(async () => {
  try {
    if (!projects.projects.length) await projects.loadProjects()
    if (project.value) {
      projects.setActive(project.value.id)
      if (project.value.absolutePath) {
        await security.load(project.value.absolutePath, project.value.id)
      }
    }
  }
  finally {
    loading.value = false
  }
})

watch(() => project.value?.id, async (id) => {
  if (id && project.value?.absolutePath) {
    await security.load(project.value.absolutePath, project.value.id)
  }
})

async function updateStatus(value: SecurityFindingStatus) {
  if (!remediationFinding.value) return
  await security.updateFindingStatus(remediationFinding.value.id, value)
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-5">
    <NuxtLink
      :to="backTarget"
      class="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
    >
      <ArrowLeft class="size-3.5" />
      Back to {{ remediationFinding ? 'findings' : 'scanner' }}
    </NuxtLink>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <Loader2 class="size-5 animate-spin text-indigo-300" />
    </div>

    <section v-else-if="finding" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="border-b border-[var(--border)] p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-[10px] text-[var(--text-faint)]">
                {{ remediationFinding ? `SEC-${remediationFinding.number}` : finding.id }}
              </span>
              <span
                class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize"
                :class="severityClasses[finding.severity] ?? 'border-white/10 bg-white/[0.04] text-[var(--text-muted)]'"
              >
                {{ finding.severity }}
              </span>
              <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                {{ finding.category }}
              </span>
              <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                {{ finding.source.replace('_', ' ') }}
              </span>
            </div>
            <h1 class="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">{{ finding.title }}</h1>
            <p class="mt-2 break-words text-sm leading-relaxed text-[var(--text-muted)]">{{ finding.detail }}</p>
          </div>

          <select
            v-if="remediationFinding"
            class="h-9 rounded-lg border border-[var(--border)] bg-black/20 px-2 text-xs text-[var(--text)] outline-none"
            :value="remediationFinding.status"
            @change="updateStatus(($event.target as HTMLSelectElement).value as SecurityFindingStatus)"
          >
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status.replace('_', ' ') }}</option>
          </select>
        </div>
      </div>

      <div class="grid gap-5 p-5 lg:grid-cols-[1fr_18rem]">
        <main class="space-y-5">
          <section class="rounded-lg border border-[var(--border)] bg-black/10 p-4">
            <div class="flex items-center gap-2">
              <Terminal class="size-3.5 text-indigo-300" />
              <h2 class="text-sm font-semibold text-[var(--text)]">Evidence</h2>
            </div>
            <pre class="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-black/20 p-3 text-xs leading-relaxed text-[var(--text-muted)] custom-scroll">{{ finding.evidence || 'No evidence was captured for this finding.' }}</pre>
          </section>

          <section class="rounded-lg border border-indigo-500/15 bg-indigo-500/[0.06] p-4">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="size-3.5 text-indigo-300" />
              <h2 class="text-sm font-semibold text-[var(--text)]">Recommended Remediation</h2>
            </div>
            <p class="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text-muted)]">{{ finding.recommendation || 'No recommendation was captured for this finding.' }}</p>
          </section>
        </main>

        <aside class="space-y-3">
          <div class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Area</p>
            <p class="mt-1 break-words text-xs text-[var(--text-muted)]">{{ finding.area }}</p>
          </div>
          <div v-if="project" class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Project</p>
            <p class="mt-1 break-words text-xs text-[var(--text-muted)]">{{ project.name }}</p>
          </div>
          <div v-if="scan" class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Scan</p>
            <p class="mt-1 text-xs text-[var(--text-muted)]">{{ new Date(scan.scannedAt).toLocaleString() }}</p>
          </div>
          <div v-if="remediationFinding" class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Created</p>
            <p class="mt-1 text-xs text-[var(--text-muted)]">{{ new Date(remediationFinding.createdAt).toLocaleString() }}</p>
          </div>
          <div v-if="remediationFinding?.resolvedAt" class="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] p-3">
            <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Resolved</p>
            <p class="mt-1 text-xs text-emerald-300">{{ new Date(remediationFinding.resolvedAt).toLocaleString() }}</p>
          </div>
        </aside>
      </div>
    </section>

    <section v-else class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-14 text-center">
      <p class="text-sm text-[var(--text-muted)]">Finding not found. It may have been removed or the link is invalid.</p>
      <NuxtLink :to="backTarget" class="mt-3 inline-block text-xs text-indigo-400 hover:text-indigo-300">
        Back to project
      </NuxtLink>
    </section>
  </div>
</template>
