<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Files,
  FolderOpen,
  Loader2,
  RefreshCw,
  ScanSearch,
  Shield,
} from 'lucide-vue-next'

const projects = useProjectsStore()
const security = useSecurityStore()

const loading = ref(false)
const activeDocType = ref<'scans' | 'findings' | 'exports'>('scans')

const activeProject = computed(() => projects.activeProject)

// Load security data when active project changes
watch(
  () => activeProject.value,
  async (proj) => {
    if (proj?.absolutePath) {
      loading.value = true
      try {
        await security.load(proj.absolutePath, proj.id)
      }
      finally {
        loading.value = false
      }
    }
  },
  { immediate: true },
)

// ── Scan reports ──────────────────────────────────────────────────────────

const scans = computed(() => security.scans)

function scanStatusColor(status: string) {
  if (status === 'done') return 'text-emerald-400 bg-emerald-500/10'
  if (status === 'warning') return 'text-amber-400 bg-amber-500/10'
  return 'text-rose-400 bg-rose-500/10'
}

function scanStatusLabel(status: string) {
  if (status === 'done') return 'Completed'
  if (status === 'warning') return 'With Warnings'
  return 'Error'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function effortLabel(effort: string) {
  return effort.charAt(0).toUpperCase() + effort.slice(1)
}

// ── Findings ─────────────────────────────────────────────────────────────

const findings = computed(() => security.findings)

const findingsBySeverity = computed(() => ({
  critical: findings.value.filter(f => f.severity === 'critical').length,
  high: findings.value.filter(f => f.severity === 'high').length,
  medium: findings.value.filter(f => f.severity === 'medium').length,
  low: findings.value.filter(f => f.severity === 'low').length,
}))

// ── Export functions ──────────────────────────────────────────────────────

const exportLoading = ref<string | null>(null)

async function exportFindingsCSV() {
  exportLoading.value = 'findings-csv'
  try {
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Category', 'Area', 'Source', 'Created At', 'Recommendation']
    const rows = findings.value.map(f => [
      `FIND-${String(f.number).padStart(3, '0')}`,
      `"${f.title.replace(/"/g, '""')}"`,
      f.severity,
      f.status,
      `"${f.category.replace(/"/g, '""')}"`,
      `"${f.area.replace(/"/g, '""')}"`,
      f.source,
      formatDate(f.createdAt),
      `"${f.recommendation.replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    await downloadText(csv, `${activeProject.value?.code ?? 'project'}-findings-${Date.now()}.csv`, 'text/csv')
  }
  finally {
    exportLoading.value = null
  }
}

async function exportFindingsJSON() {
  exportLoading.value = 'findings-json'
  try {
    const data = {
      project: {
        id: activeProject.value?.id,
        name: activeProject.value?.name,
        code: activeProject.value?.code,
        exportedAt: new Date().toISOString(),
      },
      findings: findings.value,
    }
    await downloadText(JSON.stringify(data, null, 2), `${activeProject.value?.code ?? 'project'}-findings-${Date.now()}.json`, 'application/json')
  }
  finally {
    exportLoading.value = null
  }
}

async function exportScanReport(scanId: string) {
  exportLoading.value = scanId
  try {
    const scan = scans.value.find(s => s.id === scanId)
    if (!scan) return
    const data = {
      project: {
        id: activeProject.value?.id,
        name: activeProject.value?.name,
        code: activeProject.value?.code,
      },
      scan,
    }
    await downloadText(JSON.stringify(data, null, 2), `scan-report-${scanId.slice(0, 8)}.json`, 'application/json')
  }
  finally {
    exportLoading.value = null
  }
}

async function downloadText(content: string, filename: string, mimeType: string) {
  try {
    // Try Tauri dialog save
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    const path = await save({ defaultPath: filename, filters: [{ name: filename, extensions: [filename.split('.').pop() ?? 'txt'] }] })
    if (path) {
      await writeTextFile(path, content)
    }
  }
  catch {
    // Fallback to browser download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="shrink-0 border-b border-[var(--border)] px-5 py-4">
      <div class="flex items-center gap-3">
        <div class="grid size-9 shrink-0 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
          <Files class="size-4.5 text-indigo-300" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-base font-bold text-[var(--text)]">Documents</h1>
          <p class="text-xs text-[var(--text-muted)] truncate">
            <template v-if="activeProject">{{ activeProject.name }} — scan reports, findings &amp; exports</template>
            <template v-else>No active project selected</template>
          </p>
        </div>
        <button
          v-if="activeProject"
          class="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
          :disabled="loading"
          @click="security.load(activeProject.absolutePath, activeProject.id)"
        >
          <RefreshCw class="size-3.5" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div>

      <!-- Tab bar -->
      <div v-if="activeProject" class="mt-3 flex gap-1">
        <button
          v-for="tab in [
            { id: 'scans', label: 'Scan Reports', icon: ScanSearch, count: scans.length },
            { id: 'findings', label: 'Findings', icon: AlertTriangle, count: findings.length },
            { id: 'exports', label: 'Exports', icon: Download, count: null },
          ]"
          :key="tab.id"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          :class="activeDocType === tab.id
            ? 'bg-indigo-600/15 text-indigo-400'
            : 'text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-[var(--text)]'"
          @click="activeDocType = tab.id as typeof activeDocType"
        >
          <component :is="tab.icon" class="size-3.5" />
          {{ tab.label }}
          <span v-if="tab.count !== null" class="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- No project state -->
    <div v-if="!activeProject" class="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div class="grid size-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <FolderOpen class="size-7 text-[var(--text-faint)]" />
      </div>
      <p class="text-sm font-medium text-[var(--text)]">No project selected</p>
      <p class="text-xs text-[var(--text-muted)] max-w-xs">Select an active project from the sidebar to view its documents, scan reports, and findings.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="flex-1 flex items-center justify-center">
      <Loader2 class="size-6 animate-spin text-[var(--text-faint)]" />
    </div>

    <!-- Content -->
    <div v-else class="flex-1 min-h-0 overflow-y-auto custom-scroll p-5">

      <!-- ── SCAN REPORTS ──────────────────────────────────────── -->
      <div v-if="activeDocType === 'scans'" class="space-y-4">
        <div v-if="scans.length === 0" class="flex flex-col items-center gap-3 py-16 text-center">
          <ScanSearch class="size-10 text-[var(--text-faint)] opacity-40" />
          <p class="text-sm text-[var(--text-muted)]">No scan reports yet</p>
          <p class="text-xs text-[var(--text-faint)]">Run an AI scan from the Workspace to generate your first report.</p>
        </div>

        <div
          v-for="scan in scans"
          :key="scan.id"
          class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
        >
          <!-- Scan header -->
          <div class="flex items-center gap-3 p-4 border-b border-[var(--border)]">
            <div class="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-white/[0.04]">
              <Shield class="size-4 text-[var(--text-muted)]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-semibold text-[var(--text)]">AI Security Scan</p>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="scanStatusColor(scan.status)"
                >
                  {{ scanStatusLabel(scan.status) }}
                </span>
                <span class="rounded-full border border-[var(--border)] bg-white/[0.04] px-2 py-0.5 text-[10px] text-[var(--text-faint)]">
                  {{ effortLabel(scan.effort) }} effort
                </span>
              </div>
              <div class="mt-0.5 flex items-center gap-1.5 text-[var(--text-faint)]">
                <Clock class="size-3" />
                <span class="text-[11px]">{{ formatDate(scan.scannedAt) }}</span>
              </div>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-40"
              :disabled="exportLoading === scan.id"
              @click="exportScanReport(scan.id)"
            >
              <Loader2 v-if="exportLoading === scan.id" class="size-3.5 animate-spin" />
              <Download v-else class="size-3.5" />
              Export
            </button>
          </div>

          <!-- Scan body -->
          <div class="p-4 space-y-3">
            <!-- Summary -->
            <div v-if="scan.summary" class="text-xs leading-relaxed text-[var(--text-muted)]">
              {{ scan.summary }}
            </div>

            <!-- Parse warning -->
            <div v-if="scan.parseWarning" class="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2">
              <AlertTriangle class="size-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p class="text-[11px] text-amber-300">{{ scan.parseWarning }}</p>
            </div>

            <!-- Finding stats -->
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(sev, label) in { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }"
                :key="label"
                class="rounded-lg border border-[var(--border)] bg-white/[0.03] p-2.5 text-center"
              >
                <p class="text-lg font-bold tabular-nums"
                  :class="{
                    'text-rose-400': sev === 'critical',
                    'text-orange-400': sev === 'high',
                    'text-amber-400': sev === 'medium',
                    'text-sky-400': sev === 'low',
                  }"
                >
                  {{ scan.findings.filter(f => f.severity === sev).length }}
                </p>
                <p class="text-[10px] text-[var(--text-faint)]">{{ label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── FINDINGS ───────────────────────────────────────────── -->
      <div v-else-if="activeDocType === 'findings'" class="space-y-3">
        <!-- Stats row -->
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="(count, sev) in findingsBySeverity"
            :key="sev"
            class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center"
          >
            <p class="text-xl font-bold tabular-nums"
              :class="{
                'text-rose-400': sev === 'critical',
                'text-orange-400': sev === 'high',
                'text-amber-400': sev === 'medium',
                'text-sky-400': sev === 'low',
              }"
            >
              {{ count }}
            </p>
            <p class="text-[10px] capitalize text-[var(--text-faint)]">{{ sev }}</p>
          </div>
        </div>

        <div v-if="findings.length === 0" class="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 class="size-10 text-emerald-400/40" />
          <p class="text-sm text-[var(--text-muted)]">No findings recorded</p>
          <p class="text-xs text-[var(--text-faint)]">Run an AI scan and promote findings to see them here.</p>
        </div>

        <!-- Findings list -->
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)] overflow-hidden">
          <div
            v-for="finding in findings"
            :key="finding.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <span
              class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
              :class="{
                'bg-rose-500/15 text-rose-400': finding.severity === 'critical',
                'bg-orange-500/15 text-orange-400': finding.severity === 'high',
                'bg-amber-500/15 text-amber-400': finding.severity === 'medium',
                'bg-sky-500/15 text-sky-400': finding.severity === 'low',
              }"
            >
              {{ finding.severity }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-[var(--text)] truncate">{{ finding.title }}</p>
              <p class="text-[10px] text-[var(--text-faint)] truncate">FIND-{{ String(finding.number).padStart(3, '0') }} · {{ finding.category }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
              :class="{
                'bg-blue-500/10 text-blue-400': finding.status === 'open',
                'bg-amber-500/10 text-amber-400': finding.status === 'triaged',
                'bg-indigo-500/10 text-indigo-400': finding.status === 'in_progress',
                'bg-emerald-500/10 text-emerald-400': finding.status === 'resolved',
                'bg-white/[0.06] text-[var(--text-faint)]': finding.status === 'ignored',
              }"
            >
              {{ finding.status.replace('_', ' ') }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── EXPORTS ────────────────────────────────────────────── -->
      <div v-else-if="activeDocType === 'exports'" class="space-y-4">
        <p class="text-xs text-[var(--text-muted)]">
          Export project data for reporting, compliance, or integration with other tools.
        </p>

        <!-- Findings exports -->
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)] overflow-hidden">
          <div class="px-4 py-3 bg-white/[0.02]">
            <p class="text-xs font-semibold text-[var(--text)]">Findings</p>
            <p class="text-[11px] text-[var(--text-muted)]">Export all {{ findings.length }} findings from this project</p>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="grid size-9 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <FileSpreadsheet class="size-4 text-emerald-300" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-[var(--text)]">Findings CSV</p>
              <p class="text-[11px] text-[var(--text-muted)]">Spreadsheet format — ID, title, severity, status, category, recommendation</p>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-600/30 disabled:opacity-40"
              :disabled="findings.length === 0 || exportLoading === 'findings-csv'"
              @click="exportFindingsCSV"
            >
              <Loader2 v-if="exportLoading === 'findings-csv'" class="size-3.5 animate-spin" />
              <Download v-else class="size-3.5" />
              Export CSV
            </button>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="grid size-9 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
              <FileJson class="size-4 text-indigo-300" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-[var(--text)]">Findings JSON</p>
              <p class="text-[11px] text-[var(--text-muted)]">Full structured data with all fields — suitable for API integrations</p>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-600/30 disabled:opacity-40"
              :disabled="findings.length === 0 || exportLoading === 'findings-json'"
              @click="exportFindingsJSON"
            >
              <Loader2 v-if="exportLoading === 'findings-json'" class="size-3.5 animate-spin" />
              <Download v-else class="size-3.5" />
              Export JSON
            </button>
          </div>
        </div>

        <!-- Scan report exports -->
        <div v-if="scans.length > 0" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)] overflow-hidden">
          <div class="px-4 py-3 bg-white/[0.02]">
            <p class="text-xs font-semibold text-[var(--text)]">Scan Reports</p>
            <p class="text-[11px] text-[var(--text-muted)]">Export individual scan results as JSON</p>
          </div>
          <div
            v-for="scan in scans.slice(0, 10)"
            :key="scan.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <div class="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-white/[0.03]">
              <FileText class="size-4 text-[var(--text-faint)]" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-[var(--text)]">Scan — {{ formatDate(scan.scannedAt) }}</p>
              <p class="text-[11px] text-[var(--text-muted)]">{{ scan.findings.length }} findings · {{ effortLabel(scan.effort) }} effort</p>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)] disabled:opacity-40"
              :disabled="exportLoading === scan.id"
              @click="exportScanReport(scan.id)"
            >
              <Loader2 v-if="exportLoading === scan.id" class="size-3.5 animate-spin" />
              <Download v-else class="size-3.5" />
              JSON
            </button>
          </div>
        </div>

        <!-- Info note -->
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-1.5">
          <p class="text-xs font-semibold text-[var(--text)]">About Exports</p>
          <p class="text-xs leading-relaxed text-[var(--text-muted)]">
            All exports contain only data from the currently active project ({{ activeProject?.name }}). Documents are never shared cross-project.
            Exports are saved to a location you choose on your machine.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
