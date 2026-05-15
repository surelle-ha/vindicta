<script setup lang="ts">
import {
  AlertTriangle,
  Bot,
  Bug,
  CheckCircle2,
  Clock3,
  Download,
  FileWarning,
  FileText,
  FolderKanban,
  History,
  KeyRound,
  Loader2,
  LockKeyhole,
  Play,
  Plus,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Terminal,
  Trash2,
} from 'lucide-vue-next'
import { runCodexExec } from '~/composables/useCodexShell'
import type { TicketPriority, TicketType } from '~/types/vindicta'
import { createVindictaSecurityDocx } from '~/utils/docx'
import { generateId } from '~/utils/id'

type FindingSeverity = 'critical' | 'high' | 'medium' | 'low'
type FindingStatus = 'open' | 'triaged' | 'ignored'
type SecurityAITool = 'codex' | 'claude'
type SecurityScanEffort = 'low' | 'medium' | 'high'
type ScanActivityStatus = 'pending' | 'running' | 'done' | 'warning' | 'error'

interface SecurityFinding {
  id: string
  title: string
  area: string
  severity: FindingSeverity
  status: FindingStatus
  detail: string
  recommendation: string
  evidence: string
  owaspCategory: string
  selected: boolean
}

interface ParsedScanResult {
  summary: string
  findings: SecurityFinding[]
  raw: string
}

interface ScanActivityItem {
  id: string
  label: string
  detail: string
  status: ScanActivityStatus
}

interface SecurityScanHistoryItem {
  id: string
  projectId: string
  projectName: string
  projectCode: string
  projectPath: string
  scannedAt: string
  summary: string
  rawReport: string
  findings: SecurityFinding[]
  parseWarning: string | null
}

const projects = useProjectsStore()
const kanban = useKanbanStore()
const aiActivity = useAIActivityStore()
const { notify } = useNotifications()

const activeProject = computed(() => projects.activeProject)
const query = ref('')
const findings = ref<SecurityFinding[]>([])
const scanSummary = ref('')
const scanReport = ref('')
const scanError = ref<string | null>(null)
const parseWarning = ref<string | null>(null)
const lastScanAt = ref<string | null>(null)
const selectedAITool = ref<SecurityAITool>('codex')
const selectedScanEffort = ref<SecurityScanEffort>('medium')
const showToolPicker = ref(false)
const aiScanRunning = ref(false)
const creatingBacklog = ref(false)
const exportingDocs = ref(false)
const reportSection = ref<HTMLElement | null>(null)
const scanStartedAt = ref<string | null>(null)
const scanElapsedSeconds = ref(0)
const activeScanStage = ref(0)
const scanActivity = ref<ScanActivityItem[]>([])
const scanHistory = ref<SecurityScanHistoryItem[]>([])
const activeHistoryId = ref<string | null>(null)
let scanActivityTimer: ReturnType<typeof setInterval> | null = null
let activeSecurityJobId: string | null = null

const scanStageTemplates = [
  {
    id: 'scope',
    label: 'Preparing scan scope',
    detail: 'Building the read-only Codex prompt for OWASP, Tauri, API, and frontend review.',
  },
  {
    id: 'launch',
    label: 'Starting Codex',
    detail: 'Launching Codex CLI in read-only mode for the selected project.',
  },
  {
    id: 'inspect',
    label: 'Inspecting project files',
    detail: 'Reviewing source, configuration, auth boundaries, shell usage, and data access patterns.',
  },
  {
    id: 'risk-map',
    label: 'Mapping risks',
    detail: 'Asking Codex to group concrete issues by severity, abuse path, evidence, and OWASP family.',
  },
  {
    id: 'parse',
    label: 'Parsing results',
    detail: 'Converting the AI report into selectable findings and backlog-ready remediation items.',
  },
]

const scanEffortOptions: { value: SecurityScanEffort; label: string; detail: string; maxFindings: number; focus: string; tokenNote: string }[] = [
  {
    value: 'low',
    label: 'Quick',
    detail: 'Fast pass for obvious high-signal risks.',
    maxFindings: 5,
    focus: 'Inspect only the most security-sensitive entry points and configuration. Prefer obvious, high-confidence issues over exhaustive coverage.',
    tokenNote: 'Lowest token use',
  },
  {
    value: 'medium',
    label: 'Balanced',
    detail: 'Default review depth for normal project checks.',
    maxFindings: 10,
    focus: 'Review core source, configuration, API boundaries, Tauri permissions, and frontend trust boundaries with balanced depth.',
    tokenNote: 'Moderate token use',
  },
  {
    value: 'high',
    label: 'Deep',
    detail: 'Broader review for release or audit prep.',
    maxFindings: 15,
    focus: 'Perform a deeper review across security-sensitive flows, cross-file interactions, auth boundaries, persistence, shell usage, and configuration.',
    tokenNote: 'Highest token use',
  },
]

const severityClasses: Record<FindingSeverity, string> = {
  critical: 'border-red-500/30 bg-red-500/10 text-red-300',
  high: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
  medium: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  low: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
}

const statusClasses: Record<FindingStatus, string> = {
  open: 'border-red-500/20 bg-red-500/10 text-red-300',
  triaged: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
  ignored: 'border-white/10 bg-white/[0.04] text-[var(--text-muted)]',
}

const scanActivityClasses: Record<ScanActivityStatus, string> = {
  pending: 'border-white/10 bg-white/[0.03] text-[var(--text-faint)]',
  running: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  done: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  error: 'border-red-500/25 bg-red-500/10 text-red-200',
}

const filteredFindings = computed(() => {
  const text = query.value.trim().toLowerCase()
  if (!text) return findings.value
  return findings.value.filter(finding =>
    [
      finding.title,
      finding.area,
      finding.severity,
      finding.status,
      finding.detail,
      finding.owaspCategory,
    ].some(value => value.toLowerCase().includes(text)),
  )
})

const openFindings = computed(() => findings.value.filter(finding => finding.status === 'open').length)
const highRiskFindings = computed(() => findings.value.filter(finding => finding.severity === 'critical' || finding.severity === 'high').length)
const selectedFindings = computed(() => findings.value.filter(finding => finding.selected))
const formattedLastScan = computed(() => lastScanAt.value ? new Date(lastScanAt.value).toLocaleString() : 'Not run')
const canRunAIScan = computed(() => Boolean(activeProject.value?.absolutePath) && !aiScanRunning.value)
const canExportDocs = computed(() => Boolean(activeProject.value && (scanReport.value || findings.value.length || scanSummary.value)) && !exportingDocs.value)
const selectedEffortOption = computed(() => scanEffortOptions.find(option => option.value === selectedScanEffort.value) ?? scanEffortOptions[1]!)
const scanElapsedLabel = computed(() => {
  const minutes = Math.floor(scanElapsedSeconds.value / 60)
  const seconds = scanElapsedSeconds.value % 60
  return minutes ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`
})
const activeHistoryItem = computed(() => scanHistory.value.find(item => item.id === activeHistoryId.value) ?? null)
const scanStatusText = computed(() => {
  if (aiScanRunning.value) return scanActivity.value[activeScanStage.value]?.label ?? 'Scanning'
  if (parseWarning.value) return 'Scan completed with parser warning'
  if (scanError.value) return 'Scan failed'
  if (lastScanAt.value) return 'Scan complete'
  return 'Idle'
})

onMounted(async () => {
  await aiActivity.load()
  if (!projects.projects.length) {
    await projects.loadProjects()
  }
  await loadActiveProjectTickets()
  await loadScanHistory()
  restoreActiveSecurityJob()
})

watch(() => activeProject.value?.absolutePath, () => {
  void loadActiveProjectTickets()
  void loadScanHistory()
  restoreActiveSecurityJob()
})

watch(() => aiActivity.jobs, () => {
  restoreActiveSecurityJob()
}, { deep: true })

onUnmounted(() => {
  stopScanActivityTimer()
})

async function loadActiveProjectTickets() {
  const projectPath = activeProject.value?.absolutePath
  if (!projectPath || kanban.projectPath === projectPath) return
  const { read } = useVindictaJson()
  try {
    const data = await read(projectPath)
    kanban.load(data.tickets, projectPath)
  }
  catch {
    kanban.load([], projectPath)
  }
}

function scanHistoryKey(projectId: string) {
  return `security-scan-history:${projectId}`
}

function cloneFinding(finding: SecurityFinding): SecurityFinding {
  return { ...finding, selected: false }
}

async function loadScanHistory() {
  const project = activeProject.value
  if (!project) {
    scanHistory.value = []
    activeHistoryId.value = null
    return
  }

  try {
    const store = useTauriStore()
    scanHistory.value = (await store.get<SecurityScanHistoryItem[]>(scanHistoryKey(project.id))) ?? []
  }
  catch {
    const raw = localStorage.getItem(scanHistoryKey(project.id))
    scanHistory.value = raw ? JSON.parse(raw) : []
  }

  if (scanHistory.value[0]) {
    restoreHistoryItem(scanHistory.value[0])
  }
  else {
    activeHistoryId.value = null
    findings.value = []
    scanSummary.value = ''
    scanReport.value = ''
    parseWarning.value = null
    scanError.value = null
    lastScanAt.value = null
  }
}

async function persistScanHistory() {
  const project = activeProject.value
  if (!project) return

  try {
    const store = useTauriStore()
    await store.set(scanHistoryKey(project.id), scanHistory.value)
    await store.save()
  }
  catch {
    localStorage.setItem(scanHistoryKey(project.id), JSON.stringify(scanHistory.value))
  }
}

async function recordScanHistory(partial: Pick<SecurityScanHistoryItem, 'summary' | 'rawReport' | 'findings' | 'parseWarning'>) {
  const project = activeProject.value
  if (!project) return

  const item: SecurityScanHistoryItem = {
    id: generateId(),
    projectId: project.id,
    projectName: project.name,
    projectCode: project.code,
    projectPath: project.absolutePath,
    scannedAt: new Date().toISOString(),
    summary: partial.summary,
    rawReport: partial.rawReport,
    findings: partial.findings.map(cloneFinding),
    parseWarning: partial.parseWarning,
  }

  scanHistory.value = [item, ...scanHistory.value].slice(0, 20)
  activeHistoryId.value = item.id
  await persistScanHistory()
  const { appendHistory } = useVindictaJson()
  await appendHistory(project.absolutePath, {
    action: 'security:scan_completed',
    actor: 'Codex',
    payload: {
      name: `Security scan - ${new Date(item.scannedAt).toLocaleString()}`,
      findings: item.findings.length,
      parseWarning: item.parseWarning,
    },
  }).catch(() => {})
}

function restoreHistoryItem(item: SecurityScanHistoryItem) {
  activeHistoryId.value = item.id
  findings.value = item.findings.map(finding => ({ ...finding, selected: finding.status === 'open' }))
  scanSummary.value = item.summary
  scanReport.value = item.rawReport
  parseWarning.value = item.parseWarning
  scanError.value = null
  lastScanAt.value = item.scannedAt
}

async function clearScanHistory() {
  scanHistory.value = []
  activeHistoryId.value = null
  await persistScanHistory()
  notify('Security scan history cleared.', 'success')
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
  const project = activeProject.value
  if (!project) return
  const job = aiActivity.jobs.find(item =>
    item.kind === 'security-scan'
    && item.projectId === project.id
    && (item.status === 'running' || item.status === 'pending')
  )
  if (!job) {
    const finished = activeSecurityJobId
      ? aiActivity.jobs.find(item => item.id === activeSecurityJobId)
      : null
    if (finished && finished.kind === 'security-scan' && finished.status !== 'running' && finished.status !== 'pending') {
      aiScanRunning.value = false
      stopScanActivityTimer()
      scanReport.value = finished.output || scanReport.value
      scanSummary.value = finished.summary || scanSummary.value
      scanError.value = finished.status === 'error' ? finished.error || finished.summary : null
      lastScanAt.value = finished.endedAt ?? lastScanAt.value
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

function beginScanActivity(project: NonNullable<typeof activeProject.value>, effort: typeof scanEffortOptions[number]) {
  stopScanActivityTimer()
  scanStartedAt.value = new Date().toISOString()
  scanElapsedSeconds.value = 0
  activeScanStage.value = 0
  scanActivity.value = scanStageTemplates.map((stage, index) => ({
    ...stage,
    status: index === 0 ? 'running' : 'pending',
  }))
  activeSecurityJobId = aiActivity.startJob({
    kind: 'security-scan',
    title: `Security scan: ${project.name}`,
    projectId: project.id,
    projectName: project.name,
    projectPath: project.absolutePath,
    tool: 'codex',
    effort: effort.value,
    firstStep: scanStageTemplates[0]?.label,
    firstDetail: scanStageTemplates[0]?.detail,
  })

  scanActivityTimer = setInterval(() => {
    scanElapsedSeconds.value += 1
    if (scanElapsedSeconds.value >= 3 && activeScanStage.value < 1) setScanStage(1)
    if (scanElapsedSeconds.value >= 8 && activeScanStage.value < 2) setScanStage(2)
    if (scanElapsedSeconds.value >= 16 && activeScanStage.value < 3) setScanStage(3)
  }, 1000)
}

function finishScanActivity(status: ScanActivityStatus, detail?: string) {
  stopScanActivityTimer()
  const finalStageIndex = scanActivity.value.length - 1
  activeScanStage.value = finalStageIndex
  scanActivity.value = scanActivity.value.map((item, index) => ({
    ...item,
    detail: index === finalStageIndex && detail ? detail : item.detail,
    status: index < finalStageIndex ? 'done' : status,
  }))
  aiActivity.finishJob(activeSecurityJobId, status, detail ?? scanActivity.value[finalStageIndex]?.detail ?? 'Security scan finished.', scanReport.value)
  activeSecurityJobId = null
}

function buildExistingTicketContext() {
  if (!kanban.tickets.length) return 'No existing project tickets were loaded.'

  return kanban.tickets
    .slice()
    .sort((a, b) => (b.number ?? 0) - (a.number ?? 0))
    .slice(0, 40)
    .map(ticket => {
      const labels = ticket.labels?.length ? ticket.labels.join(', ') : 'none'
      const description = ticket.description?.replace(/\s+/g, ' ').trim().slice(0, 220) || 'No description'
      return `#${ticket.number} [${ticket.status}/${ticket.priority}/${ticket.type}] ${ticket.title}; labels: ${labels}; description: ${description}`
    })
    .join('\n')
}

function buildSecurityScanPrompt(projectName: string, existingTicketContext: string, effort: typeof scanEffortOptions[number]) {
  return `You are running a read-only security review for the project "${projectName}".

Do not edit files. Inspect the application source and configuration for concrete, abusable security risks.

Effort level: ${effort.label} (${effort.value})
Effort instructions: ${effort.focus}
Return at most ${effort.maxFindings} findings. Prioritize concrete, exploitable risks with specific evidence. Avoid broad speculation.

Scope:
- OWASP Top 10 style issues, especially injection, broken access control, auth/session mistakes, insecure configuration, SSRF/path traversal, unsafe deserialization, vulnerable dependency patterns, and secrets handling.
- Desktop/Tauri risks such as shell execution, filesystem permissions, command argument handling, and unsafe local privilege boundaries.
- API/backend risks such as tenant isolation, authorization checks, input validation, CORS, and persistence boundaries.
- Frontend risks such as unsafe HTML rendering, token exposure, and trust boundary mistakes.

Ignore generated or vendored artifacts unless they create a project risk: node_modules, dist, .nuxt, .output, target, build output, and lockfile noise.

Existing project tickets for duplicate avoidance:
${existingTicketContext}

Before returning a finding, compare it against the existing tickets above. Do not return findings that substantially duplicate an existing ticket title, affected area, evidence, or remediation work. If a related ticket exists but the current risk is meaningfully different, explain the distinction in the finding detail.

Return ONLY valid JSON with this exact shape and no markdown fences:
{
  "summary": "1-3 sentence executive summary.",
  "findings": [
    {
      "id": "AI-SEC-001",
      "title": "Short finding title",
      "area": "File or subsystem",
      "severity": "critical|high|medium|low",
      "owaspCategory": "OWASP category or risk family",
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

function normalizeSeverity(value: unknown): FindingSeverity {
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
  const normalized = items.map((item, index) => {
    const value = item as Record<string, unknown>
    const id = stringValue(value.id, `AI-SEC-${String(index + 1).padStart(3, '0')}`)
    const severity = normalizeSeverity(value.severity)
    const evidence = Array.isArray(value.evidence)
      ? value.evidence.map(entry => String(entry)).join('\n')
      : stringValue(value.evidence)

    return {
      id,
      title: stringValue(value.title, 'Untitled security finding'),
      area: stringValue(value.area, 'Project'),
      severity,
      status: 'open' as const,
      detail: stringValue(value.detail, 'The AI scan did not include a detailed explanation.'),
      recommendation: stringValue(value.recommendation, 'Review the referenced code path and add a remediation plan.'),
      evidence,
      owaspCategory: stringValue(value.owaspCategory, 'Security review'),
      selected: true,
    }
  })

  return {
    summary: Array.isArray(parsed) ? '' : stringValue(parsed.summary),
    findings: normalized,
    raw: text,
  }
}

async function runAIScan() {
  const project = activeProject.value
  if (!project?.absolutePath) {
    notify('Select a project before running an AI security scan.', 'warning')
    return
  }

  if (selectedAITool.value === 'claude') {
    scanError.value = 'Claude integration is not available for security scans yet. Use Codex for now.'
    return
  }

  showToolPicker.value = false
  aiScanRunning.value = true
  const effort = selectedEffortOption.value
  beginScanActivity(project, effort)
  scanError.value = null
  parseWarning.value = null
  findings.value = []
  scanSummary.value = ''
  scanReport.value = ''

  try {
    await loadActiveProjectTickets()
    const result = await runCodexExec({
      projectPath: project.absolutePath,
      prompt: buildSecurityScanPrompt(project.name, buildExistingTicketContext(), effort),
      model: `Codex CLI default (${effort.value} effort)`,
      reasoningEffort: effort.value,
    })
    const responseText = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    if (!responseText) throw new Error('Codex completed without returning scan output.')

    try {
      setScanStage(4)
      const parsed = parseAiScanResponse(responseText)
      findings.value = parsed.findings
      scanSummary.value = parsed.summary
      scanReport.value = parsed.raw
      lastScanAt.value = new Date().toISOString()
      finishScanActivity('done', `Parsed ${parsed.findings.length} structured finding${parsed.findings.length === 1 ? '' : 's'} from the Codex report.`)
      await recordScanHistory({
        summary: parsed.summary,
        rawReport: parsed.raw,
        findings: parsed.findings,
        parseWarning: null,
      })
      notify(`AI security scan complete: ${parsed.findings.length} finding${parsed.findings.length === 1 ? '' : 's'}.`, 'success')
    }
    catch (e: any) {
      scanReport.value = responseText
      lastScanAt.value = new Date().toISOString()
      parseWarning.value = e?.message ?? 'Codex returned a report, but Vindicta could not parse structured findings.'
      finishScanActivity('warning', 'Codex returned a report, but Vindicta could not parse it into structured findings.')
      await recordScanHistory({
        summary: 'Codex returned a report, but Vindicta could not parse it into structured findings.',
        rawReport: responseText,
        findings: [],
        parseWarning: parseWarning.value,
      })
      notify('AI scan finished, but the findings could not be parsed into backlog-ready items.', 'warning')
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

function priorityForSeverity(severity: FindingSeverity): TicketPriority {
  if (severity === 'critical') return 'critical'
  if (severity === 'high') return 'high'
  if (severity === 'low') return 'low'
  return 'medium'
}

function buildTicketDescription(finding: SecurityFinding) {
  return [
    '## Security finding',
    '',
    `**Severity:** ${finding.severity}`,
    `**Area:** ${finding.area}`,
    `**Risk family:** ${finding.owaspCategory}`,
    '',
    '## Detail',
    finding.detail,
    '',
    finding.evidence ? `## Evidence\n${finding.evidence}` : '',
    '',
    '## Recommendation',
    finding.recommendation,
    '',
    '_Generated from the Security Analyzer AI scan._',
  ].filter(Boolean).join('\n')
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
  const project = activeProject.value
  if (!project) return null

  return {
    projectName: project.name,
    projectCode: project.code,
    projectPath: project.absolutePath,
    generatedAt: new Date().toISOString(),
    scannedAt: lastScanAt.value ?? new Date().toISOString(),
    summary: scanSummary.value || activeHistoryItem.value?.summary || 'No summary was captured for this security scan.',
    rawReport: scanReport.value || activeHistoryItem.value?.rawReport || '',
    findings: findings.value.map(finding => ({
      id: finding.id,
      title: finding.title,
      area: finding.area,
      severity: finding.severity,
      status: finding.status,
      owaspCategory: finding.owaspCategory,
      detail: finding.detail,
      evidence: finding.evidence,
      recommendation: finding.recommendation,
    })),
  }
}

async function exportDocs() {
  const report = currentDocxReport()
  if (!report) {
    notify('Run or select a security scan before exporting docs.', 'warning')
    return
  }

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

async function sendSelectedToBacklog() {
  const projectPath = activeProject.value?.absolutePath
  const selected = selectedFindings.value
  if (!projectPath || !selected.length) return

  creatingBacklog.value = true
  try {
    await loadActiveProjectTickets()
    for (const finding of selected) {
      await kanban.createTicket({
        title: `[Security] ${finding.title}`,
        type: 'fix' as TicketType,
        priority: priorityForSeverity(finding.severity),
        status: 'backlog',
        description: buildTicketDescription(finding),
        labels: ['security', `severity:${finding.severity}`],
      }, 'AI Agent')
      finding.status = 'triaged'
      finding.selected = false
    }
    notify(`Sent ${selected.length} security finding${selected.length === 1 ? '' : 's'} to the backlog.`, 'success')
  }
  catch (e: any) {
    notify(e?.message ?? 'Could not send findings to the backlog.', 'error')
  }
  finally {
    creatingBacklog.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-5">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex items-center gap-3">
        <div class="grid size-10 place-items-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck class="size-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[var(--text)]">Security Analyzer</h1>
          <p class="mt-0.5 text-xs text-[var(--text-muted)]">
            {{ activeProject ? `Security workspace for ${activeProject.name}` : 'Select a project to scope security checks' }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-[var(--text-faint)] opacity-60"
          disabled
          title="Manual scan is not implemented yet"
        >
          <Play class="size-3.5" />
          Run Scan
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canRunAIScan"
          @click="openAIScanPicker"
        >
          <Loader2 v-if="aiScanRunning" class="size-3.5 animate-spin" />
          <Bot v-else class="size-3.5" />
          {{ aiScanRunning ? 'AI Scanning' : 'Run AI Scan' }}
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-white/[0.07] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!scanReport"
          @click="scrollToReport"
        >
          <Terminal class="size-3.5" />
          View Report
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canExportDocs"
          @click="exportDocs"
        >
          <Loader2 v-if="exportingDocs" class="size-3.5 animate-spin" />
          <Download v-else class="size-3.5" />
          Export Docs
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">Open Findings</p>
          <AlertTriangle class="size-3.5 text-red-300" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ openFindings }}</p>
      </div>
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">High Risk</p>
          <Bug class="size-3.5 text-orange-300" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ highRiskFindings }}</p>
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
          <p class="text-xs text-[var(--text-muted)]">Project</p>
          <FolderKanban class="size-3.5 text-violet-300" />
        </div>
        <p class="mt-2 truncate text-lg font-semibold text-[var(--text)]">{{ activeProject?.code ?? 'None' }}</p>
      </div>
    </section>

    <div v-if="scanError" class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {{ scanError }}
    </div>

    <div v-if="parseWarning" class="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      {{ parseWarning }}
    </div>

    <div class="grid gap-5 xl:grid-cols-[1fr_24rem]">
      <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div class="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-semibold text-[var(--text)]">Findings</h2>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">
              {{ scanSummary || 'AI scan results will appear here after Codex reviews the selected project.' }}
            </p>
          </div>
          <label class="relative w-full sm:w-64">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              v-model="query"
              class="h-9 w-full rounded-lg border border-[var(--border)] bg-black/10 pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-indigo-500/40"
              placeholder="Search findings"
            >
          </label>
        </div>

        <div v-if="findings.length" class="border-b border-[var(--border)] px-4 py-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs text-[var(--text-muted)]">
              {{ selectedFindings.length }} of {{ findings.length }} selected for backlog
            </p>
            <button
              class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!selectedFindings.length || creatingBacklog"
              @click="sendSelectedToBacklog"
            >
              <Loader2 v-if="creatingBacklog" class="size-3.5 animate-spin" />
              <Plus v-else class="size-3.5" />
              Send selected to backlog
            </button>
          </div>
        </div>

        <div class="divide-y divide-[var(--border)]">
          <article
            v-for="finding in filteredFindings"
            :key="finding.id"
            class="px-4 py-4"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <input
                    v-model="finding.selected"
                    type="checkbox"
                    class="size-3.5 rounded border-white/20 bg-black/20 accent-indigo-500"
                    :disabled="finding.status !== 'open'"
                  >
                  <span class="font-mono text-[10px] text-[var(--text-faint)]">{{ finding.id }}</span>
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="severityClasses[finding.severity]">
                    {{ finding.severity }}
                  </span>
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="statusClasses[finding.status]">
                    {{ finding.status }}
                  </span>
                  <span class="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                    {{ finding.owaspCategory }}
                  </span>
                </div>
                <h3 class="mt-2 text-sm font-semibold text-[var(--text)]">{{ finding.title }}</h3>
                <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ finding.detail }}</p>
                <p v-if="finding.evidence" class="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-[var(--text-faint)]">{{ finding.evidence }}</p>
              </div>
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
            <p class="mt-1 text-xs text-[var(--text-faint)]">
              {{ scanActivity[activeScanStage]?.detail ?? 'Codex is reviewing the project for security findings.' }}
            </p>
          </div>

          <div v-else-if="!filteredFindings.length" class="px-4 py-14 text-center">
            <p class="text-sm text-[var(--text-muted)]">
              {{ findings.length ? 'No findings match the current search.' : 'No AI scan findings yet. Run AI Scan to analyze this project.' }}
            </p>
          </div>
        </div>
      </section>

      <aside class="space-y-5">
        <section v-if="scanActivity.length || aiScanRunning" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Bot class="size-3.5 text-emerald-300" />
              <h2 class="text-sm font-semibold text-[var(--text)]">AI Scan Activity</h2>
            </div>
            <span class="font-mono text-[10px] text-[var(--text-faint)]">{{ scanElapsedLabel }}</span>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
            Vindicta can show scan phases and tool output status. Private model thoughts are not exposed.
          </p>
          <div class="mt-3 space-y-2">
            <div
              v-for="item in scanActivity"
              :key="item.id"
              class="rounded-lg border px-3 py-2"
              :class="scanActivityClasses[item.status]"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-medium">{{ item.label }}</p>
                <span class="text-[10px] font-medium capitalize">{{ item.status }}</span>
              </div>
              <p class="mt-1 text-[10px] leading-relaxed opacity-75">{{ item.detail }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <History class="size-3.5 text-indigo-300" />
              <h2 class="text-sm font-semibold text-[var(--text)]">Scan History</h2>
            </div>
            <button
              v-if="scanHistory.length"
              class="grid size-7 place-items-center rounded-lg border border-white/10 text-[var(--text-faint)] hover:bg-white/[0.06] hover:text-red-300"
              title="Clear history"
              @click="clearScanHistory"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>

          <div v-if="scanHistory.length" class="mt-3 space-y-2">
            <button
              v-for="item in scanHistory"
              :key="item.id"
              class="w-full rounded-lg border px-3 py-2 text-left transition-colors"
              :class="item.id === activeHistoryId ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
              @click="restoreHistoryItem(item)"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate text-xs font-medium text-[var(--text)]">{{ new Date(item.scannedAt).toLocaleString() }}</span>
                <span class="shrink-0 text-[10px] text-[var(--text-faint)]">{{ item.findings.length }} finding{{ item.findings.length === 1 ? '' : 's' }}</span>
              </div>
              <p class="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
                {{ item.summary || item.parseWarning || 'No summary captured.' }}
              </p>
            </button>
          </div>

          <div v-else class="mt-3 rounded-lg border border-dashed border-[var(--border)] bg-black/10 px-3 py-4 text-center">
            <FileText class="mx-auto size-4 text-[var(--text-faint)]" />
            <p class="mt-2 text-xs text-[var(--text-muted)]">No saved scans yet.</p>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <LockKeyhole class="size-3.5 text-emerald-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Scan Modules</h2>
          </div>
          <div class="mt-3 space-y-2">
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
              <span class="text-xs text-[var(--text-muted)]">AI Code Review</span>
              <span class="text-[10px] text-emerald-300">Codex</span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
              <span class="text-xs text-[var(--text-muted)]">Effort</span>
              <span class="text-[10px] text-indigo-300">{{ selectedEffortOption.label }}</span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
              <span class="text-xs text-[var(--text-muted)]">OWASP Mapping</span>
              <span class="text-[10px]" :class="lastScanAt ? 'text-emerald-300' : 'text-[var(--text-faint)]'">{{ lastScanAt ? 'Done' : 'Pending' }}</span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
              <span class="text-xs text-[var(--text-muted)]">Manual Scan</span>
              <span class="text-[10px] text-[var(--text-faint)]">Disabled</span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2">
              <span class="text-xs text-[var(--text-muted)]">Claude Scan</span>
              <span class="text-[10px] text-[var(--text-faint)]">Unavailable</span>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <KeyRound class="size-3.5 text-violet-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Project Scope</h2>
          </div>
          <div class="mt-3 rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <p class="text-xs font-medium text-[var(--text)]">{{ activeProject?.name ?? 'No project selected' }}</p>
            <p class="mt-1 break-words text-[10px] leading-relaxed text-[var(--text-muted)]">
              {{ activeProject?.absolutePath ?? 'Choose an active project from the sidebar selector to scope analyzer results.' }}
            </p>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <FileWarning class="size-3.5 text-amber-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Backlog Export</h2>
          </div>
          <div class="mt-3 space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
            <p>Select AI findings and send them to the project backlog as remediation tickets.</p>
            <p>Created tickets include severity, affected area, evidence, and recommended fixes.</p>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <ShieldQuestion class="size-3.5 text-sky-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Mode</h2>
          </div>
          <p class="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
            Manual scanning is disabled. AI scanning runs Codex in read-only mode against the selected project.
          </p>
        </section>
      </aside>
    </div>

    <section v-if="scanReport" ref="reportSection" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div class="flex items-center gap-2">
        <Terminal class="size-3.5 text-indigo-300" />
        <h2 class="text-sm font-semibold text-[var(--text)]">Latest AI Report</h2>
      </div>
      <pre class="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/20 p-3 text-[11px] leading-relaxed text-[var(--text-muted)] custom-scroll">{{ scanReport }}</pre>
    </section>

    <GlassModal v-model="showToolPicker" title="Run AI Scan" max-width="md">
      <div class="space-y-4">
        <p class="text-sm text-[var(--text-muted)]">
          Choose the AI tool Vindicta should use for this security review.
        </p>

        <div class="grid gap-3">
          <button
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
            :class="selectedAITool === 'codex' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
            @click="selectedAITool = 'codex'"
          >
            <div class="grid size-9 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-sm font-semibold text-emerald-200">
              C
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[var(--text)]">Codex</p>
              <p class="mt-0.5 text-xs text-[var(--text-muted)]">Runs a read-only security review with the local Codex CLI.</p>
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
              <p class="mt-0.5 text-xs text-[var(--text-faint)]">Claude security scan integration is not available yet.</p>
            </div>
          </button>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-[var(--text-muted)]">Effort Level</p>
          <div class="grid gap-2 sm:grid-cols-3">
            <button
              v-for="option in scanEffortOptions"
              :key="option.value"
              class="rounded-xl border px-3 py-3 text-left transition-colors"
              :class="selectedScanEffort === option.value ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-[var(--border)] bg-black/10 hover:bg-white/[0.05]'"
              @click="selectedScanEffort = option.value"
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

        <div class="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <button
            class="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            @click="showToolPicker = false"
          >
            Cancel
          </button>
          <button
            class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canRunAIScan"
            @click="runAIScan"
          >
            <Bot class="size-3.5" />
            Run {{ selectedEffortOption.label }} Scan
          </button>
        </div>
      </div>
    </GlassModal>
  </div>
</template>
