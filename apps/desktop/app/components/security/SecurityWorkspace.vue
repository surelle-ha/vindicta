<script setup lang="ts">
import {
  AlertTriangle,
  Bot,
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  FileJson,
  FileSearch,
  FileText,
  FolderOpen,
  History,
  KeyRound,
  Loader2,
  LockKeyhole,
  PackageSearch,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
  Trash2,
} from 'lucide-vue-next'
import { runCodexExec } from '~/composables/useCodexShell'
import { runClaudeExec } from '~/composables/useClaudeAI'
import { runOpenRouterChat } from '~/composables/useOpenRouterAI'
import { runOllamaChat } from '~/composables/useOllamaAI'
import type {
  ProjectMeta,
  SecurityFinding,
  SecurityFindingStatus,
  SecurityScan,
  SecurityScanEffort,
  SecurityScanFinding,
  SecuritySeverity,
} from '~/types/vindicta'
import { createVindictaSecurityDocx } from '~/utils/docx'

type SecurityAITool = 'codex' | 'claude' | 'openrouter' | 'ollama'
type SecurityWorkspaceTab = 'overview' | 'scanner' | 'findings' | 'dependencies' | 'secrets' | 'reports' | 'history' | 'settings'
type ScanActivityStatus = 'pending' | 'running' | 'done' | 'warning' | 'error'

interface ParsedScanResult {
  summary: string
  findings: SecurityScanFinding[]
  raw: string
}

interface ScanActivityItem {
  id: string
  label: string
  detail: string
  status: ScanActivityStatus
}

interface DependencyInventoryItem {
  manifest: string
  name: string
  version: string
  type: string
}

interface ConfigCheck {
  label: string
  status: 'ok' | 'warning' | 'info'
  detail: string
}

const props = defineProps<{
  project: ProjectMeta
  tab: SecurityWorkspaceTab
}>()

const emit = defineEmits<{
  changeTab: [SecurityWorkspaceTab]
}>()

const security = useSecurityStore()
const aiActivity = useAIActivityStore()
const app = useAppStore()
const { notify } = useNotifications()

const query = ref('')
const activeScanId = ref<string | null>(null)
const scanError = ref<string | null>(null)
const parseWarning = ref<string | null>(null)
const selectedAITool = ref<SecurityAITool>('codex')
const selectedScanEffort = ref<SecurityScanEffort>('medium')
const selectedFindingLimit = ref(10)
const metricsCollapsed = ref(false)
const showToolPicker = ref(false)
const aiScanRunning = ref(false)
const creatingRemediation = ref(false)
const exportingDocs = ref(false)
const confirmClearFindings = ref(false)

async function clearAllFindingsConfirmed() {
  await security.clearAllFindings()
  confirmClearFindings.value = false
  notify('All findings cleared.', 'success')
}
const dependencyLoading = ref(false)
const secretsLoading = ref(false)
const dependencyInventory = ref<DependencyInventoryItem[]>([])
const configChecks = ref<ConfigCheck[]>([])
const reportSection = ref<HTMLElement | null>(null)
const scanStartedAt = ref<string | null>(null)
const scanElapsedSeconds = ref(0)
const activeScanStage = ref(0)
const scanActivity = ref<ScanActivityItem[]>([])
let scanActivityTimer: ReturnType<typeof setInterval> | null = null
let activeSecurityJobId: string | null = null
let autoScanStartedForProject: string | null = null

function securityToolLabel(tool: SecurityAITool) {
  if (tool === 'claude') return 'Claude'
  if (tool === 'openrouter') return 'OpenRouter'
  if (tool === 'ollama') return 'Ollama'
  return 'Codex'
}

function securityToolAccentClass(tool: SecurityAITool) {
  if (tool === 'claude') return 'text-violet-300'
  if (tool === 'openrouter') return 'text-sky-300'
  if (tool === 'ollama') return 'text-orange-300'
  return 'text-emerald-300'
}

function securityToolRunButtonClass(tool: SecurityAITool) {
  if (tool === 'claude') return 'bg-violet-600 hover:bg-violet-500'
  if (tool === 'openrouter') return 'bg-sky-600 hover:bg-sky-500'
  if (tool === 'ollama') return 'bg-orange-600 hover:bg-orange-500'
  return 'bg-emerald-600 hover:bg-emerald-500'
}

function buildScanStageTemplates(tool: SecurityAITool) {
  const toolLabel = securityToolLabel(tool)
  const launchDetail = (tool === 'openrouter' || tool === 'ollama')
    ? `Sending the read-only security prompt to the configured ${toolLabel} model.`
    : `Launching ${toolLabel} CLI in read-only mode for the selected project.`
  return [
    { id: 'scope', label: 'Preparing scan scope', detail: 'Building a read-only security prompt for OWASP, configuration, dependency, secret, API, and Tauri review.' },
    { id: 'launch', label: `Starting ${toolLabel}`, detail: launchDetail },
    { id: 'inspect', label: 'Inspecting project files', detail: 'Reviewing source, configuration, auth boundaries, shell usage, data access, and local trust boundaries.' },
    { id: 'risk-map', label: 'Mapping risks', detail: 'Grouping concrete issues by severity, abuse path, evidence, and risk family.' },
    { id: 'parse', label: 'Parsing results', detail: `Converting the ${toolLabel} report into selectable remediation-ready security findings.` },
  ]
}
const scanStageTemplates = computed(() => buildScanStageTemplates(selectedAITool.value))

const scanEffortOptions: { value: SecurityScanEffort; label: string; detail: string; focus: string; tokenNote: string }[] = [
  {
    value: 'low',
    label: 'Quick',
    detail: 'Fast pass for obvious high-signal risks.',
    focus: 'Inspect only the most security-sensitive entry points and configuration. Prefer obvious, high-confidence issues over exhaustive coverage.',
    tokenNote: 'Lowest token use',
  },
  {
    value: 'medium',
    label: 'Balanced',
    detail: 'Default review depth for normal project checks.',
    focus: 'Review core source, configuration, API boundaries, dependency risk, Tauri permissions, and frontend trust boundaries with balanced depth.',
    tokenNote: 'Moderate token use',
  },
  {
    value: 'high',
    label: 'Deep',
    detail: 'Broader review for release or audit prep.',
    focus: 'Perform a deeper review across security-sensitive flows, cross-file interactions, auth boundaries, persistence, shell usage, dependencies, secrets handling, and configuration.',
    tokenNote: 'Highest token use',
  },
]

const severityClasses: Record<SecuritySeverity, string> = {
  critical: 'border-red-500/30 bg-red-500/10 text-red-300',
  high: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
  medium: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  low: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
}

const statusClasses: Record<SecurityFindingStatus, string> = {
  open: 'border-red-500/20 bg-red-500/10 text-red-300',
  triaged: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
  in_progress: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  resolved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  ignored: 'border-white/10 bg-white/[0.04] text-[var(--text-muted)]',
}

const scanActivityClasses: Record<ScanActivityStatus, string> = {
  pending: 'border-white/10 bg-white/[0.03] text-[var(--text-faint)]',
  running: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  done: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  error: 'border-red-500/25 bg-red-500/10 text-red-200',
}

const statusOptions: SecurityFindingStatus[] = ['open', 'triaged', 'in_progress', 'resolved', 'ignored']
const selectedEffortOption = computed(() => scanEffortOptions.find(option => option.value === selectedScanEffort.value) ?? scanEffortOptions[1]!)
const normalizedFindingLimit = computed(() => Math.max(0, Math.min(50, Math.floor(Number(selectedFindingLimit.value) || 0))))
const selectedAIToolLabel = computed(() => securityToolLabel(selectedAITool.value))
const canUseSelectedAITool = computed(() => {
  if (selectedAITool.value === 'openrouter') return app.openRouter.enabled && Boolean(app.openRouter.apiKey.trim())
  if (selectedAITool.value === 'ollama') return Boolean(app.ollama.url.trim())
  return true
})
const latestScan = computed(() => security.latestScan)
const activeScan = computed(() => security.scans.find(scan => scan.id === activeScanId.value) ?? latestScan.value)
const scanFindings = computed(() => activeScan.value?.findings ?? [])
const selectedScanFindings = computed(() => scanFindings.value.filter(finding => finding.selected))
const canRunAIScan = computed(() => Boolean(props.project.absolutePath) && !aiScanRunning.value && canUseSelectedAITool.value)
const canExportDocs = computed(() => Boolean(activeScan.value || security.findings.length) && !exportingDocs.value)
const formattedLastScan = computed(() => latestScan.value ? new Date(latestScan.value.scannedAt).toLocaleString() : 'Not run')
const highRiskScans = computed(() => scanFindings.value.filter(finding => finding.severity === 'critical' || finding.severity === 'high').length)
const filteredFindings = computed(() => {
  const text = query.value.trim().toLowerCase()
  if (!text) return security.findings
  return security.findings.filter(finding =>
    [
      finding.title,
      finding.area,
      finding.severity,
      finding.status,
      finding.detail,
      finding.category,
      finding.source,
    ].some(value => String(value).toLowerCase().includes(text)),
  )
})
const filteredScanFindings = computed(() => {
  const text = query.value.trim().toLowerCase()
  if (!text) return scanFindings.value
  return scanFindings.value.filter(finding =>
    [finding.title, finding.area, finding.severity, finding.detail, finding.category].some(value => value.toLowerCase().includes(text)),
  )
})
const scanElapsedLabel = computed(() => {
  const minutes = Math.floor(scanElapsedSeconds.value / 60)
  const seconds = scanElapsedSeconds.value % 60
  return minutes ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`
})
const scanStatusText = computed(() => {
  if (aiScanRunning.value) return scanActivity.value[activeScanStage.value]?.label ?? 'Scanning'
  if (parseWarning.value) return 'Scan completed with parser warning'
  if (scanError.value) return 'Scan failed'
  if (latestScan.value) return 'Scan complete'
  return 'Idle'
})
const dependencyCount = computed(() => dependencyInventory.value.length)
const secretFindings = computed(() => security.secretFindings)
const dependencyFindings = computed(() => security.dependencyFindings)

onMounted(async () => {
  if (typeof localStorage !== 'undefined') {
    metricsCollapsed.value = localStorage.getItem('vindicta-security-metrics-collapsed') === 'true'
  }
  await initializeWorkspace()
})

watch(() => props.project.id, async () => {
  await initializeWorkspace()
})

watch(() => props.tab, async (tab) => {
  if (tab === 'dependencies' && !dependencyLoading.value && !dependencyInventory.value.length) {
    await scanDependencies(false)
  }
})

watch(() => aiActivity.jobs, () => {
  restoreActiveSecurityJob()
}, { deep: true })

watch(metricsCollapsed, (value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('vindicta-security-metrics-collapsed', String(value))
  }
})

onUnmounted(() => {
  stopScanActivityTimer()
})

async function initializeWorkspace() {
  await aiActivity.load()
  await security.load(props.project.absolutePath, props.project.id)
  activeScanId.value = security.latestScan?.id ?? null
  selectedFindingLimit.value = security.settings.aiFindingLimit
  restoreActiveSecurityJob()
  await Promise.allSettled([scanDependencies(false), scanSecrets(false), scanConfig()])
  if (security.shouldAutoScan() && autoScanStartedForProject !== props.project.id && !hasRunningSecurityJob()) {
    autoScanStartedForProject = props.project.id
    selectedScanEffort.value = security.settings.autoScanEffort
    selectedFindingLimit.value = security.settings.aiFindingLimit
    void runAIScan(security.settings.autoScanEffort, true)
  }
}

function hasRunningSecurityJob() {
  return aiActivity.jobs.some(job =>
    job.kind === 'security-scan'
    && job.projectId === props.project.id
    && (job.status === 'running' || job.status === 'pending'),
  )
}

function openAIScanPicker() {
  scanError.value = null
  selectedAITool.value = 'codex'
  showToolPicker.value = true
}

function scrollToReport() {
  reportSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function stopScanActivityTimer() {
  if (!scanActivityTimer) return
  clearInterval(scanActivityTimer)
  scanActivityTimer = null
}

function activityStatusForScan(status: string): ScanActivityStatus {
  if (status === 'pending' || status === 'running' || status === 'done' || status === 'warning' || status === 'error') return status
  return 'warning'
}

function startElapsedTimer(startedAt: string) {
  stopScanActivityTimer()
  scanElapsedSeconds.value = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  scanActivityTimer = setInterval(() => {
    scanElapsedSeconds.value = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  }, 1000)
}

function restoreActiveSecurityJob() {
  const job = aiActivity.jobs.find(item =>
    item.kind === 'security-scan'
    && item.projectId === props.project.id
    && (item.status === 'running' || item.status === 'pending')
  )
  if (!job) {
    const finished = activeSecurityJobId
      ? aiActivity.jobs.find(item => item.id === activeSecurityJobId)
      : null
    if (finished && finished.kind === 'security-scan' && finished.status !== 'running' && finished.status !== 'pending') {
      aiScanRunning.value = false
      stopScanActivityTimer()
      scanError.value = finished.status === 'error' ? finished.error || finished.summary : null
    }
    return
  }

  const shouldRestartTimer = activeSecurityJobId !== job.id
  activeSecurityJobId = job.id
  aiScanRunning.value = true
  scanStartedAt.value = job.startedAt
  scanError.value = null
  parseWarning.value = null
  scanActivity.value = job.events
    .slice()
    .reverse()
    .map(event => ({
      id: event.id,
      label: event.label,
      detail: event.detail,
      status: activityStatusForScan(event.status),
    }))
  activeScanStage.value = Math.max(0, scanActivity.value.findIndex(item => item.status === 'running'))
  if (shouldRestartTimer || !scanActivityTimer) startElapsedTimer(job.startedAt)
}

function setScanStage(index: number, status: ScanActivityStatus = 'running') {
  const previousStage = activeScanStage.value
  activeScanStage.value = Math.min(index, scanActivity.value.length - 1)
  scanActivity.value = scanActivity.value.map((item, itemIndex) => ({
    ...item,
    status: itemIndex < activeScanStage.value ? 'done' : itemIndex === activeScanStage.value ? status : 'pending',
  }))
  const activeItem = scanActivity.value[activeScanStage.value]
  if (activeSecurityJobId && activeItem && (previousStage !== activeScanStage.value || status !== 'running')) {
    aiActivity.addEvent(activeSecurityJobId, activeItem.label, activeItem.detail, status)
  }
}

function beginScanActivity(effort: typeof scanEffortOptions[number], tool: SecurityAITool) {
  stopScanActivityTimer()
  scanStartedAt.value = new Date().toISOString()
  scanElapsedSeconds.value = 0
  activeScanStage.value = 0
  const stages = buildScanStageTemplates(tool)
  scanActivity.value = stages.map((stage, index) => ({
    ...stage,
    status: index === 0 ? 'running' : 'pending',
  }))
  activeSecurityJobId = aiActivity.startJob({
    kind: 'security-scan',
    title: `Security scan: ${props.project.name}`,
    projectId: props.project.id,
    projectName: props.project.name,
    projectPath: props.project.absolutePath,
    tool,
    effort: effort.value,
    firstStep: stages[0]?.label,
    firstDetail: stages[0]?.detail,
  })

  scanActivityTimer = setInterval(() => {
    scanElapsedSeconds.value += 1
    if (scanElapsedSeconds.value >= 3 && activeScanStage.value < 1) setScanStage(1)
    if (scanElapsedSeconds.value >= 8 && activeScanStage.value < 2) setScanStage(2)
    if (scanElapsedSeconds.value >= 16 && activeScanStage.value < 3) setScanStage(3)
  }, 1000)
}

function finishScanActivity(status: ScanActivityStatus, detail?: string, output?: string) {
  stopScanActivityTimer()
  const finalStageIndex = scanActivity.value.length - 1
  activeScanStage.value = finalStageIndex
  scanActivity.value = scanActivity.value.map((item, index) => ({
    ...item,
    detail: index === finalStageIndex && detail ? detail : item.detail,
    status: index < finalStageIndex ? 'done' : status,
  }))
  aiActivity.finishJob(activeSecurityJobId, status, detail ?? scanActivity.value[finalStageIndex]?.detail ?? 'Security scan finished.', output)
  activeSecurityJobId = null
}

function buildExistingSecurityContext() {
  const persisted = security.findings
    .slice()
    .sort((a, b) => b.number - a.number)
    .slice(0, 40)
    .map(finding => `#${finding.number} [${finding.status}/${finding.severity}/${finding.source}] ${finding.title}; area: ${finding.area}; category: ${finding.category}; detail: ${finding.detail.replace(/\s+/g, ' ').slice(0, 220)}`)
  if (!persisted.length) return 'No existing security remediation items were loaded.'
  return persisted.join('\n')
}

function buildSecurityScanPrompt(projectName: string, existingFindingContext: string, effort: typeof scanEffortOptions[number], findingLimit: number) {
  const limitInstruction = findingLimit > 0
    ? `Return at most ${findingLimit} findings. Prioritize concrete, exploitable risks with specific evidence. Avoid broad speculation.`
    : 'Return every concrete, exploitable risk you can substantiate with specific evidence. Avoid broad speculation.'

  return `You are running a read-only security review for the project "${projectName}".

Do not edit files. Inspect the application source and configuration for concrete, abusable security risks.

Effort level: ${effort.label} (${effort.value})
Effort instructions: ${effort.focus}
${limitInstruction}

Scope:
- OWASP Top 10 style issues, especially injection, broken access control, auth/session mistakes, insecure configuration, SSRF/path traversal, unsafe deserialization, vulnerable dependency patterns, and secrets handling.
- Desktop/Tauri risks such as shell execution, filesystem permissions, command argument handling, and unsafe local privilege boundaries.
- API/backend risks such as tenant isolation, authorization checks, input validation, CORS, and persistence boundaries.
- Frontend risks such as unsafe HTML rendering, token exposure, secret leakage, and trust boundary mistakes.

Ignore generated or vendored artifacts unless they create a project risk: node_modules, dist, .nuxt, .output, target, build output, and lockfile noise.

Existing security remediation items for duplicate avoidance:
${existingFindingContext}

Before returning a finding, compare it against the existing remediation items above. Do not return findings that substantially duplicate an existing item title, affected area, evidence, or remediation work.

Return ONLY valid JSON with this exact shape and no markdown fences:
{
  "summary": "1-3 sentence executive summary.",
  "findings": [
    {
      "id": "AI-SEC-001",
      "title": "Short finding title",
      "area": "File or subsystem",
      "severity": "critical|high|medium|low",
      "category": "OWASP category or risk family",
      "detail": "What is wrong and how it could be abused.",
      "evidence": "Specific files, functions, or code paths reviewed.",
      "recommendation": "Concrete remediation steps."
    }
  ]
}

If no concrete issues are found, return an empty findings array with a brief summary.`
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeSeverity(value: unknown): SecuritySeverity {
  const text = String(value ?? '').toLowerCase()
  if (text === 'critical' || text === 'high' || text === 'medium' || text === 'low') return text
  return 'medium'
}

function stripJsonFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

function findBalancedJson(value: string, start: number) {
  const opening = value[start]
  const closing = opening === '{' ? '}' : opening === '[' ? ']' : ''
  if (!closing) return null
  const stack = [closing]
  let inString = false
  let escaped = false
  for (let i = start + 1; i < value.length; i += 1) {
    const char = value[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = inString
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (char === '{') stack.push('}')
    else if (char === '[') stack.push(']')
    else if (char === stack[stack.length - 1]) {
      stack.pop()
      if (!stack.length) return value.slice(start, i + 1)
    }
  }
  return null
}

function parseJsonPayload(text: string): unknown {
  const trimmed = stripJsonFence(text)
  try {
    return JSON.parse(trimmed)
  }
  catch {
    const fencedBlocks = [...trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)]
      .map(match => stripJsonFence(match[1] ?? ''))
    for (const candidate of fencedBlocks) {
      try {
        return JSON.parse(candidate)
      }
      catch { /* keep looking */ }
    }
    for (let i = 0; i < trimmed.length; i += 1) {
      if (trimmed[i] !== '{' && trimmed[i] !== '[') continue
      const candidate = findBalancedJson(trimmed, i)
      if (!candidate) continue
      try {
        return JSON.parse(candidate)
      }
      catch { /* keep looking */ }
    }
    throw new Error('No valid JSON object or array found in AI response')
  }
}

function parseAiScanResponse(text: string): ParsedScanResult {
  const parsed = parseJsonPayload(text) as Record<string, unknown>
  const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed.findings) ? parsed.findings : []
  const findings = items.map((item, index) => {
    const value = item as Record<string, unknown>
    const evidence = Array.isArray(value.evidence)
      ? value.evidence.map(entry => String(entry)).join('\n')
      : stringValue(value.evidence)

    return {
      id: stringValue(value.id, `AI-SEC-${String(index + 1).padStart(3, '0')}`),
      title: stringValue(value.title, 'Untitled security finding'),
      area: stringValue(value.area, 'Project'),
      severity: normalizeSeverity(value.severity),
      category: stringValue(value.category ?? value.owaspCategory, 'Security review'),
      source: 'ai_review' as const,
      detail: stringValue(value.detail, 'The AI scan did not include a detailed explanation.'),
      recommendation: stringValue(value.recommendation, 'Review the referenced code path and add a remediation plan.'),
      evidence,
      selected: true,
    }
  })

  return {
    summary: Array.isArray(parsed) ? '' : stringValue(parsed.summary),
    findings,
    raw: text,
  }
}

async function runAIScan(effortOverride?: SecurityScanEffort, automatic = false) {
  if (!props.project.absolutePath) {
    notify('Select a project before running an AI security scan.', 'warning')
    return
  }

  const tool: SecurityAITool = automatic ? (props.project.activeAITool === 'claude_code' ? 'claude' : 'codex') : selectedAITool.value
  const effort = scanEffortOptions.find(option => option.value === (effortOverride ?? selectedEffortOption.value.value)) ?? scanEffortOptions[1]!
  const findingLimit = automatic ? security.settings.aiFindingLimit : normalizedFindingLimit.value
  const toolLabel = securityToolLabel(tool)

  if (tool === 'openrouter' && (!app.openRouter.enabled || !app.openRouter.apiKey.trim())) {
    notify('Configure and enable OpenRouter in AI Models before running this scan.', 'warning')
    showToolPicker.value = true
    return
  }

  if (tool === 'ollama' && !app.ollama.url.trim()) {
    notify('Configure Ollama URL in AI Models before running this scan.', 'warning')
    showToolPicker.value = true
    return
  }

  if (!automatic) {
    selectedFindingLimit.value = findingLimit
    await security.updateSettings({ aiFindingLimit: findingLimit })
  }
  showToolPicker.value = false
  aiScanRunning.value = true
  beginScanActivity(effort, tool)
  scanError.value = null
  parseWarning.value = null
  if (!automatic) emit('changeTab', 'scanner')

  try {
    const prompt = buildSecurityScanPrompt(props.project.name, buildExistingSecurityContext(), effort, findingLimit)

    let result: { stdout: string; stderr: string }
    if (tool === 'openrouter') {
      const output = await runOpenRouterChat({
        apiKey: app.openRouter.apiKey,
        model: app.openRouter.model,
        messages: [
          {
            role: 'system',
            content: 'You are Vindicta, an AI security reviewer. Return only the JSON requested by the user.',
          },
          { role: 'user', content: prompt },
        ],
      })
      result = { stdout: output, stderr: '' }
    }
    else if (tool === 'ollama') {
      const output = await runOllamaChat({
        url: app.ollama.url,
        model: app.ollama.model,
        messages: [
          {
            role: 'system',
            content: 'You are Vindicta, an AI security reviewer. Return only the JSON requested by the user.',
          },
          { role: 'user', content: prompt },
        ],
      })
      result = { stdout: output, stderr: '' }
    }
    else if (tool === 'claude') {
      result = await runClaudeExec({
        projectPath: props.project.absolutePath,
        prompt,
        model: `Claude CLI default (${effort.value} effort)`,
        reasoningEffort: effort.value,
      })
    }
    else {
      result = await runCodexExec({
        projectPath: props.project.absolutePath,
        prompt,
        model: `Codex CLI default (${effort.value} effort)`,
        reasoningEffort: effort.value,
      })
    }

    const responseText = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    if (!responseText) throw new Error(`${toolLabel} completed without returning scan output.`)

    try {
      setScanStage(4)
      const parsed = parseAiScanResponse(responseText)
      const scan = await security.recordScan(props.project, {
        effort: effort.value,
        status: 'done',
        summary: parsed.summary,
        rawReport: parsed.raw,
        findings: parsed.findings,
        parseWarning: null,
      })
      activeScanId.value = scan.id
      finishScanActivity('done', `Parsed ${parsed.findings.length} structured finding${parsed.findings.length === 1 ? '' : 's'} from the ${toolLabel} report.`, parsed.raw)
      notify(`AI security scan complete: ${parsed.findings.length} finding${parsed.findings.length === 1 ? '' : 's'}.`, 'success')
    }
    catch (e: any) {
      parseWarning.value = e?.message ?? `${toolLabel} returned a report, but Vindicta could not parse structured findings.`
      const scan = await security.recordScan(props.project, {
        effort: effort.value,
        status: 'warning',
        summary: `${toolLabel} returned a report, but Vindicta could not parse it into structured findings.`,
        rawReport: responseText,
        findings: [],
        parseWarning: parseWarning.value,
      })
      activeScanId.value = scan.id
      finishScanActivity('warning', `${toolLabel} returned a report, but Vindicta could not parse it into structured findings.`, responseText)
      notify('AI scan finished, but the findings could not be parsed into remediation-ready items.', 'warning')
    }
  }
  catch (e: any) {
    scanError.value = e?.message ?? 'AI security scan failed.'
    finishScanActivity('error', scanError.value)
    notify('AI security scan failed.', 'error')
  }
  finally {
    stopScanActivityTimer()
    aiScanRunning.value = false
  }
}

function sanitizeFileName(value: string) {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 96) || 'security-report'
}

function ensureDocxExtension(path: string) {
  return path.toLowerCase().endsWith('.docx') ? path : `${path}.docx`
}

function currentDocxReport() {
  const scan = activeScan.value
  return {
    projectName: props.project.name,
    projectCode: props.project.code,
    projectPath: props.project.absolutePath,
    generatedAt: new Date().toISOString(),
    scannedAt: scan?.scannedAt ?? new Date().toISOString(),
    summary: scan?.summary || 'No summary was captured for this security workspace.',
    rawReport: scan?.rawReport || '',
    findings: (scan?.findings.length ? scan.findings : security.findings).map(finding => ({
      id: 'number' in finding ? `SEC-${finding.number}` : finding.id,
      title: finding.title,
      area: finding.area,
      severity: finding.severity,
      status: 'status' in finding ? finding.status : 'open',
      owaspCategory: 'category' in finding ? finding.category : 'Security review',
      detail: finding.detail,
      evidence: finding.evidence,
      recommendation: finding.recommendation,
    })),
  }
}

function scanFindingRoute(finding: SecurityScanFinding) {
  return {
    path: `/findings/${encodeURIComponent(finding.id)}`,
    query: {
      project: props.project.id,
      type: 'scan',
      ...(activeScan.value?.id ? { scan: activeScan.value.id } : {}),
    },
  }
}

function remediationFindingRoute(finding: SecurityFinding) {
  return {
    path: `/findings/${encodeURIComponent(finding.id)}`,
    query: {
      project: props.project.id,
      type: 'remediation',
      ...(finding.scanId ? { scan: finding.scanId } : {}),
    },
  }
}

async function exportDocs() {
  const report = currentDocxReport()
  exportingDocs.value = true
  try {
    const dialog = useTauriDialog()
    const date = new Date(report.scannedAt).toISOString().slice(0, 10)
    const defaultName = sanitizeFileName(`Vindicta Security Review - ${report.projectCode || report.projectName} - ${date}.docx`)
    const selected = await dialog.saveFile({
      title: 'Export Security Review',
      defaultPath: defaultName,
      filters: [{ name: 'Word Document', extensions: ['docx'] }],
    })
    if (!selected) return
    const fs = useTauriFs()
    await fs.writeFile(ensureDocxExtension(selected), createVindictaSecurityDocx(report))
    notify('Security report exported as DOCX.', 'success')
  }
  catch (e: any) {
    notify(e?.message ?? 'Could not export security report.', 'error')
  }
  finally {
    exportingDocs.value = false
  }
}

async function createRemediationItems() {
  const selected = selectedScanFindings.value
  if (!selected.length) return
  creatingRemediation.value = true
  try {
    await security.createRemediationItems(activeScan.value?.id ?? null, selected)
    notify(`Created ${selected.length} remediation item${selected.length === 1 ? '' : 's'}.`, 'success')
    emit('changeTab', 'findings')
  }
  catch (e: any) {
    notify(e?.message ?? 'Could not create remediation items.', 'error')
  }
  finally {
    creatingRemediation.value = false
  }
}

async function updateFindingStatus(finding: SecurityFinding, status: SecurityFindingStatus) {
  await security.updateFindingStatus(finding.id, status)
}

function joinPath(base: string, child: string) {
  const sep = base.includes('\\') ? '\\' : '/'
  return `${base}${sep}${child}`
}

async function readJsonFile(path: string) {
  const fs = useTauriFs()
  const raw = await fs.readTextFile(path)
  return JSON.parse(raw)
}

async function scanDependencies(showNotice = true) {
  dependencyLoading.value = true
  try {
    const fs = useTauriFs()
    const manifestNames = new Set([
      'package.json',
      'Cargo.toml',
      'Cargo.lock',
      'requirements.txt',
      'pyproject.toml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'build.gradle.kts',
      'composer.json',
      'Gemfile',
      'Directory.Packages.props',
    ])
    const ignoredDirs = new Set(['.git', 'node_modules', 'dist', '.nuxt', '.output', 'target', 'build', '.cache', 'bin', 'obj'])
    const manifestPaths = new Set<string>()

    async function collectManifests(dir: string, depth: number) {
      if (depth > 3) return
      const entries = await fs.readDir(dir).catch(() => [])
      for (const entry of entries) {
        if (entry.isDir) {
          if (!ignoredDirs.has(entry.name)) await collectManifests(entry.path, depth + 1)
          continue
        }
        if (manifestNames.has(entry.name) || /\.csproj$/i.test(entry.name) || /\.fsproj$/i.test(entry.name) || /\.vbproj$/i.test(entry.name)) {
          manifestPaths.add(entry.path)
        }
      }
    }

    await collectManifests(props.project.absolutePath, 0)

    const inventory: DependencyInventoryItem[] = []

    function addDependency(manifest: string, name: string, version: string, type: string) {
      const cleanName = name.trim()
      if (!cleanName || cleanName.startsWith('#')) return
      inventory.push({ manifest, name: cleanName, version: version.trim() || 'unspecified', type })
    }

    for (const manifestPath of manifestPaths) {
      const fileName = manifestPath.split(/[\\/]/).pop() ?? manifestPath
      const text = await fs.readTextFile(manifestPath).catch(() => '')
      if (!text) continue

      if (fileName === 'package.json' || fileName === 'composer.json') {
        const manifest = JSON.parse(text)
        const sections = fileName === 'package.json'
          ? ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
          : ['require', 'require-dev']
        for (const type of sections) {
          const deps = manifest[type] as Record<string, string> | undefined
          if (!deps) continue
          for (const [name, version] of Object.entries(deps)) addDependency(manifestPath, name, String(version), type)
        }
        continue
      }

      if (fileName === 'Cargo.toml') {
        let section = ''
        for (const line of text.split(/\r?\n/)) {
          const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/)
          if (sectionMatch) {
            section = sectionMatch[1] ?? ''
            continue
          }
          if (!/dependencies/i.test(section)) continue
          const simple = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*["']([^"']+)["']/)
          const table = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*\{[^}]*version\s*=\s*["']([^"']+)["']/)
          const match = simple ?? table
          if (match) addDependency(manifestPath, match[1] ?? '', match[2] ?? '', section)
        }
        continue
      }

      if (/\.csproj$|\.fsproj$|\.vbproj$|Directory\.Packages\.props$/i.test(fileName)) {
        for (const match of text.matchAll(/<PackageReference[^>]*Include=["']([^"']+)["'][^>]*(?:Version=["']([^"']+)["'])?|<PackageVersion[^>]*Include=["']([^"']+)["'][^>]*Version=["']([^"']+)["']/gi)) {
          addDependency(manifestPath, match[1] ?? match[3] ?? '', match[2] ?? match[4] ?? 'central', '.NET')
        }
        continue
      }

      if (fileName === 'requirements.txt') {
        for (const line of text.split(/\r?\n/)) {
          const match = line.trim().match(/^([A-Za-z0-9_.-]+)\s*([<>=!~]=?.*)?$/)
          if (match) addDependency(manifestPath, match[1] ?? '', match[2] ?? 'unspecified', 'python')
        }
        continue
      }

      if (fileName === 'pyproject.toml') {
        for (const match of text.matchAll(/["']([A-Za-z0-9_.-]+)(?:[<>=!~][^"']*)?["']/g)) {
          addDependency(manifestPath, match[1] ?? '', 'pyproject', 'python')
        }
        continue
      }

      if (fileName === 'go.mod') {
        for (const line of text.split(/\r?\n/)) {
          const match = line.trim().match(/^([A-Za-z0-9_.~/-]+)\s+(v[^\s]+)(?:\s+\/\/.*)?$/)
          if (match && !['module', 'go', 'require', 'replace', 'exclude'].includes(match[1] ?? '')) {
            addDependency(manifestPath, match[1] ?? '', match[2] ?? '', 'go')
          }
        }
        continue
      }

      if (fileName === 'pom.xml') {
        for (const block of text.matchAll(/<dependency>[\s\S]*?<\/dependency>/g)) {
          const value = block[0]
          const group = value.match(/<groupId>([^<]+)<\/groupId>/)?.[1] ?? ''
          const artifact = value.match(/<artifactId>([^<]+)<\/artifactId>/)?.[1] ?? ''
          const version = value.match(/<version>([^<]+)<\/version>/)?.[1] ?? 'managed'
          if (artifact) addDependency(manifestPath, group ? `${group}:${artifact}` : artifact, version, 'maven')
        }
        continue
      }

      if (fileName === 'build.gradle' || fileName === 'build.gradle.kts') {
        for (const match of text.matchAll(/(?:implementation|api|compileOnly|runtimeOnly|testImplementation)\s*\(?\s*["']([^:"']+):([^:"']+):([^"']+)["']/g)) {
          addDependency(manifestPath, `${match[1]}:${match[2]}`, match[3] ?? '', 'gradle')
        }
        continue
      }

      if (fileName === 'Gemfile') {
        for (const match of text.matchAll(/^\s*gem\s+["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?/gm)) {
          addDependency(manifestPath, match[1] ?? '', match[2] ?? 'unspecified', 'ruby')
        }
      }
    }
    dependencyInventory.value = inventory.sort((a, b) => a.name.localeCompare(b.name))

    const findings: Omit<SecurityScanFinding, 'selected'>[] = []
    const lockExists = await Promise.all([
      fs.exists(joinPath(props.project.absolutePath, 'pnpm-lock.yaml')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'package-lock.json')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'yarn.lock')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'Cargo.lock')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'packages.lock.json')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'poetry.lock')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'uv.lock')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'go.sum')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'composer.lock')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'Gemfile.lock')).catch(() => false),
      fs.exists(joinPath(props.project.absolutePath, 'gradle.lockfile')).catch(() => false),
    ])
    if (inventory.length && !lockExists.some(Boolean)) {
      findings.push({
        id: 'DEP-LOCKFILE',
        title: 'Dependency manifests have no recognized lockfile',
        severity: 'medium',
        category: 'Dependency integrity',
        source: 'dependency',
        area: 'dependency manifests',
        detail: 'Dependency manifests were found without a recognized lockfile or checksum file, which can make dependency resolution less reproducible.',
        evidence: [...manifestPaths].join('\n'),
        recommendation: 'Commit the package manager lockfile generated by the project and use frozen installs in automation.',
      })
    }
    if (inventory.some(item => item.version === '*' || item.version.toLowerCase() === 'latest')) {
      findings.push({
        id: 'DEP-FLOATING',
        title: 'Floating dependency versions detected',
        severity: 'low',
        category: 'Dependency hygiene',
        source: 'dependency',
        area: 'dependency manifests',
        detail: 'One or more dependencies use latest or wildcard versions, increasing supply-chain drift risk.',
        evidence: inventory.filter(item => item.version === '*' || item.version.toLowerCase() === 'latest').map(item => `${item.name}@${item.version} in ${item.manifest}`).join('\n'),
        recommendation: 'Pin package ranges intentionally and rely on reviewed dependency update workflows.',
      })
    }
    await security.upsertLocalFindings('dependency', findings)
    if (showNotice) notify(`Dependency inventory refreshed: ${inventory.length} package${inventory.length === 1 ? '' : 's'}.`, 'success')
  }
  catch (e: any) {
    if (showNotice) notify(e?.message ?? 'Could not inspect dependencies.', 'error')
  }
  finally {
    dependencyLoading.value = false
  }
}

async function scanSecrets(showNotice = true) {
  secretsLoading.value = true
  try {
    const fs = useTauriFs()
    const ignoredDirs = new Set(['.git', 'node_modules', 'dist', '.nuxt', '.output', 'target', 'build', '.cache'])
    const allowedExtensions = /\.(env|ts|js|vue|json|yml|yaml|toml|rs|md|txt)$/i
    const patterns = [
      { label: 'API key-like assignment', regex: /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*['"][^'"\n]{16,}['"]/i },
      { label: 'OpenAI key pattern', regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
      { label: 'GitHub token pattern', regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
      { label: 'Private key marker', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
    ]
    const matches: string[] = []

    async function walk(dir: string, depth: number) {
      if (depth > 3 || matches.length >= 20) return
      const entries = await fs.readDir(dir).catch(() => [])
      for (const entry of entries) {
        if (matches.length >= 20) return
        if (entry.isDir) {
          if (!ignoredDirs.has(entry.name)) await walk(entry.path, depth + 1)
          continue
        }
        if (!allowedExtensions.test(entry.name)) continue
        const text = await fs.readTextFile(entry.path).catch(() => '')
        if (!text || text.length > 300000) continue
        for (const pattern of patterns) {
          if (pattern.regex.test(text)) {
            matches.push(`${pattern.label}: ${entry.path}`)
            break
          }
        }
      }
    }

    await walk(props.project.absolutePath, 0)
    const findings = matches.length
      ? [{
          id: 'SECRET-PATTERN',
          title: 'Potential secret values detected in project files',
          severity: 'high' as SecuritySeverity,
          category: 'Secrets management',
          source: 'secret' as const,
          area: 'project files',
          detail: 'Local pattern scanning found values that look like secrets, tokens, passwords, or private key material.',
          evidence: matches.join('\n'),
          recommendation: 'Move real secrets into environment-specific secret storage, rotate exposed credentials, and keep only examples in committed files.',
        }]
      : []
    await security.upsertLocalFindings('secret', findings)
    if (showNotice) notify(matches.length ? `Secret scan found ${matches.length} suspicious file${matches.length === 1 ? '' : 's'}.` : 'Secret scan finished with no obvious matches.', matches.length ? 'warning' : 'success')
  }
  catch (e: any) {
    if (showNotice) notify(e?.message ?? 'Could not run secret scan.', 'error')
  }
  finally {
    secretsLoading.value = false
  }
}

async function scanConfig() {
  const fs = useTauriFs()
  const envExists = await fs.exists(joinPath(props.project.absolutePath, '.env')).catch(() => false)
  const envExampleExists = await fs.exists(joinPath(props.project.absolutePath, '.env.example')).catch(() => false)
  const tauriConfigExists = await fs.exists(joinPath(props.project.absolutePath, 'apps/desktop/tauri/tauri.conf.json')).catch(() => false)
  const checks: ConfigCheck[] = [
    {
      label: '.env hygiene',
      status: envExists && !envExampleExists ? 'warning' : 'ok',
      detail: envExists && !envExampleExists ? '.env exists without a matching .env.example.' : 'Environment file shape has a safer baseline.',
    },
    {
      label: 'Desktop permissions',
      status: tauriConfigExists ? 'info' : 'ok',
      detail: tauriConfigExists ? 'Tauri configuration detected. Review capabilities and shell permissions during AI scans.' : 'No Tauri desktop configuration detected at the default path.',
    },
    {
      label: 'Automatic scan',
      status: security.settings.autoScanEnabled ? 'ok' : 'warning',
      detail: security.settings.autoScanEnabled ? `Existing scan history refreshes when older than ${security.settings.autoScanStaleHours} hours. New projects wait for a manual scan.` : 'Automatic scans are disabled for this project.',
    },
  ]
  configChecks.value = checks
}

async function clearScanHistory() {
  await security.clearScans()
  activeScanId.value = null
  notify('Security scan history cleared.', 'success')
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-5 pb-8">
    <div class="flex justify-end">
      <button
        class="grid size-6 place-items-center rounded text-[var(--text-faint)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-muted)]"
        :title="metricsCollapsed ? 'Show metrics' : 'Hide metrics'"
        @click="metricsCollapsed = !metricsCollapsed"
      >
        <ChevronDown v-if="metricsCollapsed" class="size-3" />
        <ChevronUp v-else class="size-3" />
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      enter-from-class="opacity-0 -translate-y-2 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-96"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      leave-from-class="opacity-100 translate-y-0 max-h-96"
      leave-to-class="opacity-0 -translate-y-2 max-h-0"
    >
      <section v-if="!metricsCollapsed" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-[var(--text-muted)]">Open Findings</p>
            <AlertTriangle class="size-3.5 text-red-300" />
          </div>
          <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ security.openFindings }}</p>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-[var(--text-muted)]">High Risk</p>
            <Bug class="size-3.5 text-orange-300" />
          </div>
          <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ security.highRiskFindings + highRiskScans }}</p>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-[var(--text-muted)]">Last Scan</p>
            <Clock3 class="size-3.5 text-indigo-300" />
          </div>
          <p class="mt-2 truncate text-lg font-semibold text-[var(--text)]">{{ formattedLastScan }}</p>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-[var(--text-muted)]">Packages</p>
            <PackageSearch class="size-3.5 text-violet-300" />
          </div>
          <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ dependencyCount }}</p>
        </div>
      </section>
    </Transition>

    <div v-if="scanError" class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {{ scanError }}
    </div>
    <div v-if="parseWarning" class="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      {{ parseWarning }}
    </div>

    <section v-if="tab === 'overview'" class="grid gap-5 xl:grid-cols-[1fr_22rem]">
      <main class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div class="flex items-center justify-between border-b border-[var(--border)] p-4">
          <div>
            <h2 class="text-sm font-semibold text-[var(--text)]">Security Overview</h2>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">Current vulnerability posture for the selected project.</p>
          </div>
          <ShieldCheck class="size-4 text-emerald-300" />
        </div>
        <div class="grid gap-3 p-4 md:grid-cols-2">
          <button class="rounded-lg border border-[var(--border)] bg-black/10 p-4 text-left hover:bg-white/[0.05]" @click="emit('changeTab', 'scanner')">
            <Bot class="size-4 text-emerald-300" />
            <h3 class="mt-3 text-sm font-semibold text-[var(--text)]">AI Vulnerability Scan</h3>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ scanStatusText }}</p>
          </button>
          <button class="rounded-lg border border-[var(--border)] bg-black/10 p-4 text-left hover:bg-white/[0.05]" @click="emit('changeTab', 'findings')">
            <AlertTriangle class="size-4 text-red-300" />
            <h3 class="mt-3 text-sm font-semibold text-[var(--text)]">Remediation Queue</h3>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ security.findings.length }} tracked finding{{ security.findings.length === 1 ? '' : 's' }}.</p>
          </button>
          <button class="rounded-lg border border-[var(--border)] bg-black/10 p-4 text-left hover:bg-white/[0.05]" @click="emit('changeTab', 'dependencies')">
            <PackageSearch class="size-4 text-violet-300" />
            <h3 class="mt-3 text-sm font-semibold text-[var(--text)]">Dependencies</h3>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ dependencyInventory.length }} package{{ dependencyInventory.length === 1 ? '' : 's' }} indexed.</p>
          </button>
          <button class="rounded-lg border border-[var(--border)] bg-black/10 p-4 text-left hover:bg-white/[0.05]" @click="emit('changeTab', 'secrets')">
            <KeyRound class="size-4 text-amber-300" />
            <h3 class="mt-3 text-sm font-semibold text-[var(--text)]">Secrets</h3>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ secretFindings.length }} active secret finding{{ secretFindings.length === 1 ? '' : 's' }}.</p>
          </button>
        </div>
      </main>
      <aside class="space-y-5">
        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <FileSearch class="size-3.5 text-sky-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Config Checks</h2>
          </div>
          <div class="mt-3 space-y-2">
            <div v-for="check in configChecks" :key="check.label" class="rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-medium text-[var(--text)]">{{ check.label }}</p>
                <span class="text-[10px] font-medium capitalize" :class="check.status === 'ok' ? 'text-emerald-300' : check.status === 'warning' ? 'text-amber-300' : 'text-indigo-300'">{{ check.status }}</span>
              </div>
              <p class="mt-1 text-[10px] leading-relaxed text-[var(--text-muted)]">{{ check.detail }}</p>
            </div>
          </div>
        </section>
      </aside>
    </section>

    <section v-else-if="tab === 'scanner'" class="grid gap-5 xl:grid-cols-[1fr_24rem]">
      <main class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div class="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-semibold text-[var(--text)]">AI Scanner</h2>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">{{ activeScan?.summary || 'Run an AI scan against this project to collect vulnerability findings.' }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canRunAIScan" @click="openAIScanPicker">
              <Loader2 v-if="aiScanRunning" class="size-3.5 animate-spin" />
              <Bot v-else class="size-3.5" />
              {{ aiScanRunning ? 'AI Scanning' : 'Run AI Scan' }}
            </button>
            <button class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-white/[0.07] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!activeScan?.rawReport" @click="scrollToReport">
              <Terminal class="size-3.5" />
              View Report
            </button>
            <button class="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canExportDocs" @click="exportDocs">
              <Loader2 v-if="exportingDocs" class="size-3.5 animate-spin" />
              <Download v-else class="size-3.5" />
              Export Docs
            </button>
          </div>
        </div>

        <div v-if="scanFindings.length" class="border-b border-[var(--border)] px-4 py-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs text-[var(--text-muted)]">{{ selectedScanFindings.length }} of {{ scanFindings.length }} selected for remediation</p>
            <button class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!selectedScanFindings.length || creatingRemediation" @click="createRemediationItems">
              <Loader2 v-if="creatingRemediation" class="size-3.5 animate-spin" />
              <Plus v-else class="size-3.5" />
              Create remediation items
            </button>
          </div>
        </div>

        <div class="divide-y divide-[var(--border)]">
          <article v-for="finding in filteredScanFindings" :key="finding.id" class="px-4 py-4">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <NuxtLink :to="scanFindingRoute(finding)" class="min-w-0 rounded-lg outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-indigo-500/40">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    role="checkbox"
                    tabindex="0"
                    :aria-checked="finding.selected"
                    class="grid size-4 shrink-0 place-items-center rounded-md border transition-colors"
                    :class="finding.selected ? 'border-indigo-400 bg-indigo-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.3)]' : 'border-white/15 bg-white/[0.04] text-transparent hover:border-indigo-400/50'"
                    @click.stop.prevent="finding.selected = !finding.selected"
                    @keydown.space.stop.prevent="finding.selected = !finding.selected"
                  >
                    <Check class="size-3" stroke-width="3" />
                  </span>
                  <span class="font-mono text-[10px] text-[var(--text-faint)]">{{ finding.id }}</span>
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="severityClasses[finding.severity]">{{ finding.severity }}</span>
                  <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">{{ finding.category }}</span>
                </div>
                <h3 class="mt-2 text-sm font-semibold text-[var(--text)]">{{ finding.title }}</h3>
                <p class="mt-1 line-clamp-3 break-words text-xs leading-relaxed text-[var(--text-muted)]">{{ finding.detail }}</p>
                <p v-if="finding.evidence" class="mt-2 line-clamp-2 break-words text-[11px] leading-relaxed text-[var(--text-faint)]">{{ finding.evidence }}</p>
              </NuxtLink>
              <div class="rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 lg:w-52">
                <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Area</p>
                <p class="mt-1 truncate text-xs text-[var(--text-muted)]">{{ finding.area }}</p>
              </div>
            </div>
            <div class="mt-3 flex items-start gap-2 rounded-lg border border-indigo-500/15 bg-indigo-500/[0.06] p-3">
              <CheckCircle2 class="mt-0.5 size-3.5 shrink-0 text-indigo-300" />
              <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ finding.recommendation }}</p>
            </div>
          </article>

          <div v-if="aiScanRunning" class="px-4 py-14 text-center">
            <Loader2 class="mx-auto size-5 animate-spin text-emerald-300" />
            <p class="mt-3 text-sm text-[var(--text-muted)]">{{ scanStatusText }}</p>
            <p class="mt-1 text-xs text-[var(--text-faint)]">{{ scanActivity[activeScanStage]?.detail ?? 'The AI agent is reviewing the project for security findings.' }}</p>
          </div>
          <div v-else-if="!scanFindings.length" class="px-4 py-14 text-center">
            <p class="text-sm text-[var(--text-muted)]">No AI scan findings yet. Run AI Scan to analyze this project.</p>
          </div>
        </div>
      </main>

      <aside class="space-y-5">
        <section v-if="scanActivity.length || aiScanRunning" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Bot class="size-3.5 text-emerald-300" />
              <h2 class="text-sm font-semibold text-[var(--text)]">AI Scan Activity</h2>
            </div>
            <span class="font-mono text-[10px] text-[var(--text-faint)]">{{ scanElapsedLabel }}</span>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">Vindicta shows scan phases and tool output status. Private model thoughts are not exposed.</p>
          <div class="mt-3 space-y-2">
            <div v-for="item in scanActivity" :key="item.id" class="rounded-lg border px-3 py-2" :class="scanActivityClasses[item.status]">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-medium">{{ item.label }}</p>
                <span class="text-[10px] font-medium capitalize">{{ item.status }}</span>
              </div>
              <p class="mt-1 text-[10px] leading-relaxed opacity-75">{{ item.detail }}</p>
            </div>
          </div>
        </section>
        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <LockKeyhole class="size-3.5 text-emerald-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Scan Modules</h2>
          </div>
          <div class="mt-3 space-y-2">
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2"><span class="text-xs text-[var(--text-muted)]">AI Code Review</span><span class="text-[10px]" :class="securityToolAccentClass(selectedAITool)">{{ selectedAIToolLabel }}</span></div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2"><span class="text-xs text-[var(--text-muted)]">Effort</span><span class="text-[10px] text-indigo-300">{{ selectedEffortOption.label }}</span></div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2"><span class="text-xs text-[var(--text-muted)]">OWASP Mapping</span><span class="text-[10px]" :class="latestScan ? 'text-emerald-300' : 'text-[var(--text-faint)]'">{{ latestScan ? 'Done' : 'Pending' }}</span></div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2"><span class="text-xs text-[var(--text-muted)]">OpenRouter Scan</span><span class="text-[10px]" :class="app.openRouter.enabled && app.openRouter.apiKey ? 'text-emerald-300' : 'text-[var(--text-faint)]'">{{ app.openRouter.enabled && app.openRouter.apiKey ? 'Available' : 'Configure' }}</span></div>
          </div>
        </section>
        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <FolderOpen class="size-3.5 text-violet-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Project Scope</h2>
          </div>
          <div class="mt-3 rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <p class="text-xs font-medium text-[var(--text)]">{{ project.name }}</p>
            <p class="mt-1 break-words text-[10px] leading-relaxed text-[var(--text-muted)]">{{ project.absolutePath }}</p>
          </div>
        </section>
      </aside>
    </section>

    <section v-else-if="tab === 'findings'" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-sm font-semibold text-[var(--text)]">Security Findings</h2>
          <p class="mt-0.5 text-xs text-[var(--text-muted)]">Remediation items created from scans and local checks.</p>
        </div>
        <label class="relative w-full sm:w-72">
          <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-faint)]" />
          <input v-model="query" class="h-9 w-full rounded-lg border border-[var(--border)] bg-black/10 pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-indigo-500/40" placeholder="Search findings">
        </label>
      </div>
      <div class="divide-y divide-[var(--border)]">
        <article v-for="finding in filteredFindings" :key="finding.id" class="px-4 py-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <NuxtLink :to="remediationFindingRoute(finding)" class="min-w-0 rounded-lg outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-indigo-500/40">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-mono text-[10px] text-[var(--text-faint)]">SEC-{{ finding.number }}</span>
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="severityClasses[finding.severity]">{{ finding.severity }}</span>
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="statusClasses[finding.status]">{{ finding.status.replace('_', ' ') }}</span>
                  <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">{{ finding.source.replace('_', ' ') }}</span>
                  <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">{{ finding.category }}</span>
                </div>
                <h3 class="mt-2 text-sm font-semibold text-[var(--text)]">{{ finding.title }}</h3>
                <p class="mt-1 line-clamp-3 break-words text-xs leading-relaxed text-[var(--text-muted)]">{{ finding.detail }}</p>
                <p v-if="finding.evidence" class="mt-2 line-clamp-2 break-words text-[11px] leading-relaxed text-[var(--text-faint)]">{{ finding.evidence }}</p>
              </NuxtLink>
            <div class="space-y-2 lg:w-56">
              <select class="h-9 w-full rounded-lg border border-[var(--border)] bg-black/20 px-2 text-xs text-[var(--text)] outline-none" :value="finding.status" @change="updateFindingStatus(finding, ($event.target as HTMLSelectElement).value as SecurityFindingStatus)">
                <option v-for="status in statusOptions" :key="status" :value="status">{{ status.replace('_', ' ') }}</option>
              </select>
              <div class="rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
                <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Area</p>
                <p class="mt-1 truncate text-xs text-[var(--text-muted)]">{{ finding.area }}</p>
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-start gap-2 rounded-lg border border-indigo-500/15 bg-indigo-500/[0.06] p-3">
            <CheckCircle2 class="mt-0.5 size-3.5 shrink-0 text-indigo-300" />
            <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ finding.recommendation }}</p>
          </div>
        </article>
        <div v-if="!filteredFindings.length" class="px-4 py-14 text-center text-sm text-[var(--text-muted)]">No remediation items yet.</div>
      </div>
    </section>

    <section v-else-if="tab === 'dependencies'" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
        <div>
          <h2 class="text-sm font-semibold text-[var(--text)]">Dependencies</h2>
          <p class="mt-0.5 text-xs text-[var(--text-muted)]">Manifest inventory for Node, Rust, .NET, Python, Go, Java, PHP, and Ruby projects.</p>
        </div>
        <button class="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/15" @click="scanDependencies()">
          <Loader2 v-if="dependencyLoading" class="size-3.5 animate-spin" />
          <PackageSearch v-else class="size-3.5" />
          Refresh
        </button>
      </div>
      <div class="divide-y divide-[var(--border)]">
        <article v-for="item in dependencyInventory" :key="`${item.manifest}:${item.name}`" class="grid gap-2 px-4 py-3 text-xs md:grid-cols-[1fr_8rem_9rem]">
          <div class="min-w-0">
            <p class="truncate font-medium text-[var(--text)]">{{ item.name }}</p>
            <p class="mt-0.5 truncate text-[10px] text-[var(--text-faint)]">{{ item.manifest }}</p>
          </div>
          <p class="font-mono text-[var(--text-muted)]">{{ item.version }}</p>
          <p class="text-[var(--text-faint)]">{{ item.type }}</p>
        </article>
        <div v-if="dependencyLoading && !dependencyInventory.length" class="px-4 py-14 text-center text-sm text-[var(--text-muted)]">Indexing package manifests...</div>
        <div v-else-if="!dependencyInventory.length" class="px-4 py-14 text-center text-sm text-[var(--text-muted)]">No package manifests indexed yet.</div>
      </div>
    </section>

    <section v-else-if="tab === 'secrets'" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
        <div>
          <h2 class="text-sm font-semibold text-[var(--text)]">Secrets</h2>
          <p class="mt-0.5 text-xs text-[var(--text-muted)]">Conservative local pattern checks for likely credentials.</p>
        </div>
        <button class="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/15" @click="scanSecrets()">
          <Loader2 v-if="secretsLoading" class="size-3.5 animate-spin" />
          <KeyRound v-else class="size-3.5" />
          Scan
        </button>
      </div>
      <div class="p-4">
        <div v-if="secretFindings.length" class="space-y-3">
          <article v-for="finding in secretFindings" :key="finding.id" class="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <h3 class="text-sm font-semibold text-[var(--text)]">{{ finding.title }}</h3>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ finding.detail }}</p>
            <pre class="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/20 p-3 text-[11px] text-[var(--text-faint)]">{{ finding.evidence }}</pre>
          </article>
        </div>
        <div v-else class="py-12 text-center text-sm text-[var(--text-muted)]">No active secret pattern findings.</div>
      </div>
    </section>

    <section v-else-if="tab === 'reports'" class="space-y-5">
      <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <FileText class="size-4 text-indigo-300" />
            <div>
              <h2 class="text-sm font-semibold text-[var(--text)]">Reports</h2>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Export the selected scan or current remediation queue.</p>
            </div>
          </div>
          <button class="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canExportDocs" @click="exportDocs">
            <Loader2 v-if="exportingDocs" class="size-3.5 animate-spin" />
            <Download v-else class="size-3.5" />
            Export DOCX
          </button>
        </div>
      </section>
      <section v-if="activeScan?.rawReport" ref="reportSection" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center gap-2">
          <Terminal class="size-3.5 text-indigo-300" />
          <h2 class="text-sm font-semibold text-[var(--text)]">Latest AI Report</h2>
        </div>
        <pre class="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/20 p-3 text-[11px] leading-relaxed text-[var(--text-muted)] custom-scroll">{{ activeScan.rawReport }}</pre>
      </section>
    </section>

    <section v-else-if="tab === 'history'" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <History class="size-4 text-indigo-300" />
          <h2 class="text-sm font-semibold text-[var(--text)]">Scan History</h2>
        </div>
        <button v-if="security.scans.length" class="grid size-7 place-items-center rounded-lg border border-white/10 text-[var(--text-faint)] hover:bg-white/[0.06] hover:text-red-300" title="Clear history" @click="clearScanHistory">
          <Trash2 class="size-3.5" />
        </button>
      </div>
      <div v-if="security.scans.length" class="mt-3 space-y-2">
        <button v-for="scan in security.scans" :key="scan.id" class="w-full rounded-lg border px-3 py-2 text-left transition-colors" :class="scan.id === activeScanId ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'" @click="activeScanId = scan.id; emit('changeTab', 'scanner')">
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-xs font-medium text-[var(--text)]">{{ new Date(scan.scannedAt).toLocaleString() }}</span>
            <span class="shrink-0 text-[10px] text-[var(--text-faint)]">{{ scan.findings.length }} finding{{ scan.findings.length === 1 ? '' : 's' }}</span>
          </div>
          <p class="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[var(--text-muted)]">{{ scan.summary || scan.parseWarning || 'No summary captured.' }}</p>
        </button>
      </div>
      <div v-else class="mt-3 rounded-lg border border-dashed border-[var(--border)] bg-black/10 px-3 py-8 text-center">
        <FileJson class="mx-auto size-4 text-[var(--text-faint)]" />
        <p class="mt-2 text-xs text-[var(--text-muted)]">No saved scans yet.</p>
      </div>
    </section>

    <section v-else-if="tab === 'settings'" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div class="flex items-center gap-2">
        <Settings class="size-4 text-indigo-300" />
        <h2 class="text-sm font-semibold text-[var(--text)]">Security Settings</h2>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-[var(--border)] bg-black/10 p-4">
          <span class="text-xs font-medium text-[var(--text)]">Automatic scan</span>
          <button
            type="button"
            class="mt-2 flex items-center gap-2 text-left text-xs text-[var(--text-muted)]"
            @click="security.updateSettings({ autoScanEnabled: !security.settings.autoScanEnabled })"
          >
            <span
              class="grid size-4 shrink-0 place-items-center rounded-md border transition-colors"
              :class="security.settings.autoScanEnabled ? 'border-indigo-400 bg-indigo-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.3)]' : 'border-white/15 bg-white/[0.04] text-transparent hover:border-indigo-400/50'"
            >
              <Check class="size-3" stroke-width="3" />
            </span>
            Refresh existing scans when stale
          </button>
        </div>
        <label class="rounded-lg border border-[var(--border)] bg-black/10 p-4">
          <span class="text-xs font-medium text-[var(--text)]">Stale after hours</span>
          <input :value="security.settings.autoScanStaleHours" type="number" min="1" class="mt-2 h-9 w-full rounded-lg border border-[var(--border)] bg-black/20 px-2 text-xs text-[var(--text)] outline-none" @change="security.updateSettings({ autoScanStaleHours: Number(($event.target as HTMLInputElement).value) || 24 })">
        </label>
        <label class="rounded-lg border border-[var(--border)] bg-black/10 p-4">
          <span class="text-xs font-medium text-[var(--text)]">Auto effort</span>
          <select :value="security.settings.autoScanEffort" class="mt-2 h-9 w-full rounded-lg border border-[var(--border)] bg-black/20 px-2 text-xs text-[var(--text)] outline-none" @change="security.updateSettings({ autoScanEffort: ($event.target as HTMLSelectElement).value as SecurityScanEffort })">
            <option value="low">Quick</option>
            <option value="medium">Balanced</option>
            <option value="high">Deep</option>
          </select>
        </label>
        <label class="rounded-lg border border-[var(--border)] bg-black/10 p-4 md:col-span-3">
          <span class="text-xs font-medium text-[var(--text)]">Default AI finding limit</span>
          <input :value="security.settings.aiFindingLimit" type="number" min="0" max="50" class="mt-2 h-9 w-full rounded-lg border border-[var(--border)] bg-black/20 px-2 text-xs text-[var(--text)] outline-none" @change="security.updateSettings({ aiFindingLimit: Math.max(0, Math.min(50, Math.floor(Number(($event.target as HTMLInputElement).value) || 0))) })">
          <span class="mt-2 block text-[10px] leading-relaxed text-[var(--text-faint)]">Use 0 to remove the explicit cap from the AI prompt. Manual scans can override this in the run modal.</span>
        </label>
      </div>

      <!-- Danger zone -->
      <div class="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 space-y-3">
        <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-400/70">Danger Zone</p>

        <div class="flex items-center justify-between gap-4 rounded-lg border border-red-500/10 bg-black/10 px-4 py-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-[var(--text)]">Reset All Findings</p>
            <p class="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
              Permanently deletes all {{ security.findings.length }} finding{{ security.findings.length === 1 ? '' : 's' }} for this project. Scans and settings are kept.
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <Transition
              enter-active-class="transition-all duration-150"
              enter-from-class="opacity-0 translate-x-2"
              enter-to-class="opacity-100 translate-x-0"
            >
              <GlassCheckbox
                v-if="confirmClearFindings"
                v-model="confirmClearFindings"
                size="sm"
                class="text-[11px] text-red-200"
              >
                Confirm
              </GlassCheckbox>
            </Transition>
            <GlassButton
              size="sm"
              :class="confirmClearFindings
                ? 'border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15'"
              :disabled="security.findings.length === 0"
              @click="confirmClearFindings ? clearAllFindingsConfirmed() : (confirmClearFindings = true)"
            >
              <Trash2 class="size-3.5" />
              {{ confirmClearFindings ? 'Yes, delete all' : 'Reset findings' }}
            </GlassButton>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 rounded-lg border border-red-500/10 bg-black/10 px-4 py-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-[var(--text)]">Clear Scan History</p>
            <p class="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">Removes all past scan records. Findings are not affected.</p>
          </div>
          <GlassButton
            size="sm"
            class="shrink-0 border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
            :disabled="security.scans.length === 0"
            @click="security.clearScans(); notify('Scan history cleared.', 'success')"
          >
            <Trash2 class="size-3.5" />
            Clear history
          </GlassButton>
        </div>
      </div>
    </section>

    <GlassModal v-model="showToolPicker" title="Run AI Scan" max-width="md">
      <div class="space-y-4">
        <p class="text-sm text-[var(--text-muted)]">Choose the AI tool Vindicta should use for this security review.</p>
        <div class="grid gap-3">
          <button class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors" :class="selectedAITool === 'codex' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'" @click="selectedAITool = 'codex'">
            <div class="grid size-9 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-sm font-semibold text-emerald-200">C</div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-semibold text-[var(--text)]">Codex</p>
                <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-300">Suggested</span>
              </div>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Runs a read-only security review with the local Codex CLI.</p>
            </div>
          </button>
          <button class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors" :class="selectedAITool === 'claude' ? 'border-violet-500/30 bg-violet-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'" @click="selectedAITool = 'claude'">
            <div class="grid size-9 place-items-center rounded-lg border border-violet-500/30 bg-violet-500/15 text-sm font-semibold text-violet-200">Cl</div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-semibold text-[var(--text)]">Claude</p>
                <span class="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-violet-300">Suggested</span>
              </div>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Runs a read-only security review with the local Claude CLI.</p>
            </div>
          </button>
          <button class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors" :class="selectedAITool === 'openrouter' ? 'border-sky-500/30 bg-sky-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'" @click="selectedAITool = 'openrouter'">
            <div class="grid size-9 place-items-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sm font-semibold text-sky-200">OR</div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[var(--text)]">OpenRouter</p>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Runs this review with the configured OpenRouter API model.</p>
              <p class="mt-1 text-[10px]" :class="app.openRouter.enabled && app.openRouter.apiKey ? 'text-sky-300' : 'text-amber-300'">
                {{ app.openRouter.enabled && app.openRouter.apiKey ? app.openRouter.model : 'Configure API key in AI Models' }}
              </p>
            </div>
          </button>
          <button class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors" :class="selectedAITool === 'ollama' ? 'border-orange-500/30 bg-orange-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'" @click="selectedAITool = 'ollama'">
            <div class="grid size-9 place-items-center rounded-lg border border-orange-500/30 bg-orange-500/15 text-sm font-semibold text-orange-200">Ol</div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[var(--text)]">Ollama</p>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Runs this review with a local Ollama model. No data leaves your machine.</p>
              <p class="mt-1 text-[10px]" :class="app.ollama.url ? 'text-orange-300' : 'text-amber-300'">
                {{ app.ollama.url ? `${app.ollama.model} · ${app.ollama.url}` : 'Configure Ollama URL in AI Models' }}
              </p>
            </div>
          </button>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-medium text-[var(--text-muted)]">Effort Level</p>
          <div class="grid gap-2 sm:grid-cols-3">
            <button v-for="option in scanEffortOptions" :key="option.value" class="rounded-xl border px-3 py-3 text-left transition-colors" :class="selectedScanEffort === option.value ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'" @click="selectedScanEffort = option.value">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold text-[var(--text)]">{{ option.label }}</p>
                <span class="text-[10px] text-[var(--text-faint)]">{{ option.value }}</span>
              </div>
              <p class="mt-1 text-[10px] leading-relaxed text-[var(--text-muted)]">{{ option.detail }}</p>
              <p class="mt-2 text-[10px] font-medium text-indigo-300">{{ option.tokenNote }}</p>
            </button>
          </div>
        </div>
        <label class="block rounded-xl border border-[var(--border)] bg-black/10 p-3">
          <span class="text-xs font-medium text-[var(--text)]">Finding limit</span>
          <input v-model.number="selectedFindingLimit" type="number" min="0" max="50" class="mt-2 h-9 w-full rounded-lg border border-[var(--border)] bg-black/20 px-2 text-xs text-[var(--text)] outline-none">
          <span class="mt-2 block text-[10px] leading-relaxed text-[var(--text-faint)]">Set the maximum number of AI findings for this scan. Use 0 for no explicit cap.</span>
        </label>
        <div class="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <button class="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]" @click="showToolPicker = false">Cancel</button>
          <button class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50" :class="securityToolRunButtonClass(selectedAITool)" :disabled="!canRunAIScan" @click="runAIScan()">
            <Bot class="size-3.5" />
            Run {{ selectedEffortOption.label }} Scan with {{ selectedAIToolLabel }}
          </button>
        </div>
      </div>
    </GlassModal>
  </div>
</template>
