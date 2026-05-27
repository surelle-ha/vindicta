<script setup lang="ts">
import { Sun, Moon, Database, ChevronDown, ChevronUp, Stethoscope, CheckCircle2, AlertTriangle, XCircle, Wrench, Loader2, Terminal, Download, Github, Heart, Send, Bug, Lightbulb, Sparkles, Eye, Plug } from 'lucide-vue-next'

const app = useAppStore()
const user = useUserStore()
const projects = useProjectsStore()
const router = useRouter()
const { notify } = useNotifications()

// Notifications
const notifs = ref(app.notificationsEnabled)
watch(notifs, (v) => app.setNotifications(v))

// MCP in sidebar
const mcpInSidebar = ref(app.mcpInSidebar)
watch(mcpInSidebar, (v) => app.setMcpInSidebar(v))

// Vigilante
const vigilanteWarningOpen = ref(false)

function onVigilanteToggle(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    // Opening — show confirmation modal first; don't enable yet
    vigilanteWarningOpen.value = true
    // Prevent the checkbox from visually changing until confirmed
    ;(e.target as HTMLInputElement).checked = false
  }
  else {
    void app.setVigilante(false)
  }
}

function confirmVigilante() {
  void app.setVigilante(true)
  vigilanteWarningOpen.value = false
}

function cancelVigilante() {
  vigilanteWarningOpen.value = false
}

// Contact
const contactType = ref<'bug' | 'suggestion' | 'feature'>('bug')
const contactTitle = ref('')
const contactBody = ref('')
const contactEmail = ref('')
const contactRepo = ref(app.contact.githubRepo)
const contactToken = ref(app.contact.githubToken)
const contactSubmitting = ref(false)
const showContactConfig = ref(false)

const contactTypes = [
  { id: 'bug' as const, label: 'Bug', icon: Bug, labelName: 'type:bug' },
  { id: 'suggestion' as const, label: 'Suggestion', icon: Lightbulb, labelName: 'type:suggestion' },
  { id: 'feature' as const, label: 'Feature', icon: Sparkles, labelName: 'type:feature' },
]

const selectedContactType = computed(() =>
  contactTypes.find(type => type.id === contactType.value) ?? contactTypes[0]!,
)

const canSubmitContact = computed(() =>
  Boolean(contactTitle.value.trim() && contactBody.value.trim() && contactRepo.value.trim()),
)

function issueBody() {
  return [
    contactBody.value.trim(),
    '',
    '---',
    `Submitted from Vindicta desktop settings.`,
    contactEmail.value.trim() ? `Contact: ${contactEmail.value.trim()}` : '',
  ].filter(Boolean).join('\n')
}

function issueUrl() {
  const repo = contactRepo.value.trim() || 'Surelle-ha/vindicta'
  const query = new URLSearchParams({
    title: `[${selectedContactType.value.label}] ${contactTitle.value.trim() || 'Vindicta feedback'}`,
    body: issueBody(),
    labels: selectedContactType.value.labelName,
  })
  return `https://github.com/${repo}/issues/new?${query.toString()}`
}

async function saveContactSettings() {
  await app.setContact({
    githubRepo: contactRepo.value.trim() || 'Surelle-ha/vindicta',
    githubToken: contactToken.value.trim(),
  })
  notify('Contact settings saved.', 'success')
}

async function openIssueInBrowser() {
  const { open } = await import('@tauri-apps/plugin-shell')
  await open(issueUrl())
}

async function submitGitHubIssue() {
  if (!canSubmitContact.value) {
    notify('Add a title, details, and GitHub repo before submitting.', 'warning')
    return
  }
  const repo = contactRepo.value.trim()
  const token = contactToken.value.trim()
  if (!token) {
    notify('Add a GitHub token or open the prefilled issue in your browser.', 'warning')
    return
  }

  contactSubmitting.value = true
  try {
    await saveContactSettings()
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[${selectedContactType.value.label}] ${contactTitle.value.trim()}`,
        body: issueBody(),
        labels: [selectedContactType.value.labelName, 'vindicta-feedback'],
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(detail || `GitHub returned HTTP ${response.status}`)
    }

    contactTitle.value = ''
    contactBody.value = ''
    notify('GitHub issue submitted.', 'success')
  }
  catch (e: any) {
    notify(e?.message ?? 'Could not submit GitHub issue.', 'error')
  }
  finally {
    contactSubmitting.value = false
  }
}

// Doctor
type DoctorStatus = 'ok' | 'warning' | 'error'
interface DoctorCheck {
  id: string
  label: string
  detail: string
  status: DoctorStatus
  fixable: boolean
}

const doctorChecks = ref<DoctorCheck[]>([])
const doctorRunning = ref(false)
const doctorFixing = ref(false)
const codexInstalling = ref(false)
const codexInstallLog = ref('')

const doctorSummary = computed(() => {
  const errors = doctorChecks.value.filter(c => c.status === 'error').length
  const warnings = doctorChecks.value.filter(c => c.status === 'warning').length
  if (!doctorChecks.value.length) return 'Run checks to inspect local security tooling.'
  if (errors) return `${errors} error${errors !== 1 ? 's' : ''} found`
  if (warnings) return `${warnings} warning${warnings !== 1 ? 's' : ''} found`
  return 'Everything looks healthy.'
})

const canDoctorFix = computed(() => doctorChecks.value.some(c => c.fixable))
const codexCheck = computed(() => doctorChecks.value.find(c => c.id === 'codex'))
const shouldShowCodexInstaller = computed(() => !codexCheck.value || codexCheck.value.status !== 'ok')

function firstLine(value: string | undefined) {
  return (value ?? '').split('\n').map(line => line.trim()).find(Boolean) ?? ''
}

function codexHealthDetail(value: string | undefined) {
  const text = value ?? ''
  if (/@openai\/codex-win32-x64|Missing optional dependency/i.test(text)) {
    return 'Codex CLI is installed but its Windows runtime dependency is missing. Use Install/Repair Codex to reinstall @openai/codex@latest.'
  }
  return firstLine(text)
}

function isWindowsRuntime() {
  return typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent)
}

async function runShellCommand(candidates: string[], args: string[]) {
  const { Command } = await import('@tauri-apps/plugin-shell')
  let lastError: unknown = null
  for (const name of candidates) {
    try {
      return await Command.create(name, args).execute()
    }
    catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function runCodexCli(args: string[]) {
  const commandName = args[0] === '--version' ? 'codex-version' : 'codex-login-status'
  const windowsCommandName = args[0] === '--version' ? 'codex-cmd-version' : 'codex-cmd-login-status'
  const candidates = isWindowsRuntime() ? [windowsCommandName, commandName] : [commandName]
  return runShellCommand(candidates, args)
}

async function runNpmCli(args: string[]) {
  const candidates = isWindowsRuntime() ? ['npm-cmd-version', 'npm-version'] : ['npm-version']
  return runShellCommand(candidates, args)
}

async function checkNpmHealth(): Promise<DoctorCheck> {
  try {
    const version = await runNpmCli(['--version'])
    if (version.code !== 0) {
      return {
        id: 'npm',
        label: 'npm',
        detail: firstLine(version.stderr) || 'npm did not respond to the version check. Codex install requires npm.',
        status: 'error',
        fixable: false,
      }
    }

    return {
      id: 'npm',
      label: 'npm',
      detail: `npm ${firstLine(version.stdout)} is available for installing Codex.`,
      status: 'ok',
      fixable: false,
    }
  }
  catch (e: any) {
    return {
      id: 'npm',
      label: 'npm',
      detail: e?.message
        ? `npm check failed: ${e.message}. Install Node.js/npm before using the Codex installer.`
        : 'npm is not available to Vindicta. Install Node.js/npm before using the Codex installer.',
      status: 'error',
      fixable: false,
    }
  }
}

async function checkCodexHealth(): Promise<DoctorCheck> {
  try {
    const version = await runCodexCli(['--version'])
    if (version.code !== 0) {
      return {
        id: 'codex',
        label: 'Codex',
        detail: codexHealthDetail([version.stdout, version.stderr].filter(Boolean).join('\n')) || 'Codex CLI did not respond to the version check.',
        status: 'error',
        fixable: false,
      }
    }

    const versionText = firstLine(version.stdout) || 'Codex CLI is installed'
    const login = await runCodexCli(['login', 'status'])
    const loginText = firstLine(login.stdout) || firstLine(login.stderr)
    const connected = login.code === 0 && /logged in|authenticated/i.test(loginText)

    return {
      id: 'codex',
      label: 'Codex',
      detail: connected
        ? `${versionText}; ${loginText}.`
        : `${versionText}; login status could not confirm a connected Codex account. Run codex login from a terminal.`,
      status: connected ? 'ok' : 'warning',
      fixable: false,
    }
  }
  catch (e: any) {
    return {
      id: 'codex',
      label: 'Codex',
      detail: e?.message
        ? `Codex health check failed: ${codexHealthDetail(e.message) || e.message}. Use Install/Repair Codex, or install @openai/codex@latest with npm and rerun Doctor.`
        : 'Codex CLI is not available to Vindicta. Use Install/Repair Codex, or install @openai/codex@latest with npm and rerun Doctor.',
      status: 'error',
      fixable: false,
    }
  }
}

async function installCodexCli() {
  codexInstalling.value = true
  codexInstallLog.value = ''
  try {
    const output = await runShellCommand(
      isWindowsRuntime() ? ['npm-cmd-install-codex', 'npm-install-codex'] : ['npm-install-codex'],
      ['install', '-g', '@openai/codex@latest'],
    )

    codexInstallLog.value = [output.stdout, output.stderr].filter(Boolean).join('\n').trim()
    if (output.code === 0) {
      notify('Codex installed/repaired. Checking connection...', 'success')
      await runDoctor()
    }
    else {
      notify('Codex install failed. Check the installer output.', 'error')
    }
  }
  catch (e: any) {
    codexInstallLog.value = e?.message ?? String(e)
    notify('Codex install could not start', 'error')
  }
  finally {
    codexInstalling.value = false
  }
}

async function runDoctor() {
  doctorRunning.value = true

  const checks: DoctorCheck[] = []
  try {
    checks.push({
      id: 'profile',
      label: 'Profile',
      detail: user.name ? `Signed in as ${user.name}` : 'Profile name is missing. Complete onboarding to personalize security activity.',
      status: user.name ? 'ok' : 'warning',
      fixable: false,
    })

    checks.push({
      id: 'notifications',
      label: 'Notifications',
      detail: app.notificationsEnabled ? 'In-app notifications are enabled.' : 'In-app notifications are disabled.',
      status: 'ok',
      fixable: false,
    })

    checks.push(await checkNpmHealth())
    checks.push(await checkCodexHealth())
  }
  finally {
    doctorChecks.value = checks
    doctorRunning.value = false
  }
}

async function fixDoctorIssues() {
  doctorFixing.value = true
  try {
    notify('Doctor fixes applied', 'success')
    await runDoctor()
  }
  finally {
    doctorFixing.value = false
  }
}

// Advanced
const showRawData = ref(false)
const rawData = computed(() => JSON.stringify({
  userProfile: { ...user.$state },
  projects: projects.projects,
  appSettings: {
    theme: app.theme,
    notificationsEnabled: app.notificationsEnabled,
    contact: {
      githubRepo: app.contact.githubRepo,
      githubToken: app.contact.githubToken ? 'saved locally' : '',
    },
  },
}, null, 2))

// Danger zone confirms
const confirmReset = ref<null | 'profile' | 'projects' | 'all'>(null)

async function resetProfile() {
  await user.reset()
  confirmReset.value = null
  router.push('/onboarding')
}

async function clearProjects() {
  projects.projects = []
  await projects.saveProjects()
  confirmReset.value = null
}

async function resetAll() {
  await user.reset()
  projects.projects = []
  await projects.saveProjects()
  app.launched = false
  try {
    const { useTauriStore } = await import('~/composables/useTauriStore')
    const store = useTauriStore()
    await store.delete('app-settings')
    await store.delete('user-profile')
    await store.delete('projects')
    await store.save()
  }
  catch {
    localStorage.clear()
  }
  confirmReset.value = null
  router.push('/')
  window.location.reload()
}
</script>

<template>
  <div class="max-w-xl mx-auto py-8 px-6 space-y-8">
    <div>
      <h2 class="text-sm font-semibold text-[var(--text)] tracking-tight">Settings</h2>
      <p class="text-xs text-[var(--text-muted)] mt-0.5">App configuration and preferences</p>
    </div>

    <!-- General -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">General</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
        <!-- Theme -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--text)]">Theme</p>
            <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ app.theme === 'dark' ? 'Dark mode active' : 'Light mode active' }}</p>
          </div>
          <GlassButton variant="ghost" size="sm" @click="app.toggleTheme()">
            <Sun v-if="app.theme === 'dark'" class="size-3.5 mr-1.5" />
            <Moon v-else class="size-3.5 mr-1.5" />
            {{ app.theme === 'dark' ? 'Light' : 'Dark' }}
          </GlassButton>
        </div>

        <div class="h-px bg-[var(--border)]" />

        <!-- MCP in Sidebar -->
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
              <Plug class="size-3.5 text-indigo-300" />
            </div>
            <div>
              <p class="text-sm text-[var(--text)]">Show MCP in Sidebar</p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">Display the MCP server item in the navigation sidebar</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input v-model="mcpInSidebar" type="checkbox" class="sr-only peer">
            <div class="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white" />
          </label>
        </div>

        <div class="h-px bg-[var(--border)]" />

        <!-- Enable Vigilante -->
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border transition-colors"
              :class="app.vigilanteEnabled
                ? 'border-orange-500/30 bg-orange-500/10'
                : 'border-[var(--border)] bg-white/[0.04]'"
            >
              <Eye class="size-3.5" :class="app.vigilanteEnabled ? 'text-orange-300' : 'text-[var(--text-faint)]'" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm text-[var(--text)]">Enable Vigilante</p>
                <span v-if="app.vigilanteEnabled" class="rounded-full bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400">Active</span>
                <span v-else class="rounded-full bg-white/[0.05] border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--text-faint)]">Experimental</span>
              </div>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">Active threat hunting and continuous monitoring mode</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="app.vigilanteEnabled"
              @change="onVigilanteToggle"
            >
            <div class="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600 peer-checked:after:bg-white" />
          </label>
        </div>
      </div>
    </div>

    <!-- Vigilante confirmation modal -->
    <GlassModal v-model="vigilanteWarningOpen" title="Enable Vigilante Mode?" @close="cancelVigilante">
      <div class="space-y-4">
        <div class="flex items-start gap-3 rounded-xl border border-orange-500/25 bg-orange-500/[0.08] p-4">
          <AlertTriangle class="size-5 text-orange-400 shrink-0 mt-0.5" />
          <div class="space-y-1.5">
            <p class="text-sm font-semibold text-orange-300">Experimental Feature</p>
            <p class="text-xs leading-relaxed text-[var(--text-muted)]">
              Vigilante mode is an advanced active threat-hunting feature currently under development.
              Enabling it today adds the toggle state to your configuration — no active system behavior is attached yet.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-semibold text-[var(--text)]">Before enabling, acknowledge the following:</p>
          <ul class="space-y-1.5">
            <li v-for="clause in [
              'This feature is experimental and subject to change without notice.',
              'Future versions may perform active network and filesystem monitoring.',
              'You are responsible for ensuring monitoring complies with applicable laws and policies.',
              'You can disable Vigilante at any time from Settings → General.',
            ]" :key="clause" class="flex items-start gap-2 text-xs text-[var(--text-muted)]">
              <Eye class="size-3.5 text-orange-400/60 shrink-0 mt-0.5" />
              {{ clause }}
            </li>
          </ul>
        </div>

        <div class="flex gap-2 justify-end pt-1">
          <GlassButton variant="ghost" size="sm" @click="cancelVigilante">Cancel</GlassButton>
          <GlassButton size="sm" class="bg-orange-600/20 text-orange-300 border-orange-500/30 hover:bg-orange-600/30" @click="confirmVigilante">
            <Eye class="size-3.5" />
            Enable Vigilante
          </GlassButton>
        </div>
      </div>
    </GlassModal>

    <!-- Notifications -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">Notifications</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--text)]">In-app notifications</p>
            <p class="text-xs text-[var(--text-muted)] mt-0.5">Toast alerts for scans, findings, exports, and app events</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="notifs" type="checkbox" class="sr-only peer">
            <div class="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white" />
          </label>
        </div>

      </div>
    </div>

    <!-- About -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">About</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
        <div class="flex items-start gap-3">
          <div class="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
            <Heart class="size-4 text-indigo-300" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-[var(--text)]">Made by Harold Eustaquio</p>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              Vindicta is a local-first security workspace for scanning projects, tracking remediation, and keeping AI-assisted review grounded in the files you actually ship.
            </p>
          </div>
        </div>
        <a
          href="https://github.com/Surelle-ha"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
        >
          <Github class="size-3.5" />
          github.com/Surelle-ha
        </a>
      </div>
    </div>

    <!-- Contact -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">Contact</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
        <div>
          <p class="text-sm font-semibold text-[var(--text)]">Submit feedback</p>
          <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            Send bugs, suggestions, and feature requests to GitHub Issues. Tokens stored in a desktop app are local convenience secrets, not backend-protected secrets.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="type in contactTypes"
            :key="type.id"
            class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
            :class="contactType === type.id
              ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-100'
              : 'border-[var(--border)] bg-black/10 text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-[var(--text)]'"
            @click="contactType = type.id"
          >
            <component :is="type.icon" class="size-3.5" />
            {{ type.label }}
          </button>
        </div>

        <GlassInput v-model="contactTitle" label="Title" placeholder="Short issue title" />
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-white/60 uppercase tracking-wider">Details</label>
          <textarea
            v-model="contactBody"
            rows="5"
            placeholder="What happened, what did you expect, or what should Vindicta support?"
            class="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-indigo-500/60 focus:bg-white/10"
          />
        </div>
        <GlassInput v-model="contactEmail" label="Contact email optional" placeholder="you@example.com" />

        <button
          class="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-left text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
          @click="showContactConfig = !showContactConfig"
        >
          <Github class="size-3.5" />
          GitHub issue settings
          <ChevronDown v-if="!showContactConfig" class="ml-auto size-3.5" />
          <ChevronUp v-else class="ml-auto size-3.5" />
        </button>

        <div v-if="showContactConfig" class="space-y-3 rounded-lg border border-[var(--border)] bg-black/10 p-3">
          <GlassInput v-model="contactRepo" label="Repository" placeholder="owner/repo" />
          <GlassInput v-model="contactToken" label="Fine-grained token" type="password" placeholder="GitHub token with Issues: Read and write" />
          <p class="text-[11px] leading-relaxed text-[var(--text-faint)]">
            Use a fine-grained GitHub token scoped to one repository with Issues read/write only. Do not use a broad personal token.
          </p>
          <GlassButton variant="ghost" size="sm" @click="saveContactSettings">Save issue settings</GlassButton>
        </div>

        <div class="flex flex-wrap gap-2">
          <GlassButton :disabled="!canSubmitContact || contactSubmitting" @click="submitGitHubIssue">
            <Loader2 v-if="contactSubmitting" class="size-3.5 animate-spin" />
            <Send v-else class="size-3.5" />
            Submit to GitHub
          </GlassButton>
          <GlassButton variant="ghost" :disabled="!canSubmitContact" @click="openIssueInBrowser">
            <Github class="size-3.5" />
            Open prefilled issue
          </GlassButton>
        </div>
      </div>
    </div>

    <!-- Doctor -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">Doctor</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Stethoscope class="size-3.5 text-emerald-300" />
            <div>
              <p class="text-sm text-[var(--text)]">App health</p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ doctorSummary }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <GlassButton variant="ghost" size="sm" :disabled="doctorRunning || doctorFixing" @click="runDoctor">
              <Loader2 v-if="doctorRunning" class="size-3.5 animate-spin" />
              <Stethoscope v-else class="size-3.5" />
              Run
            </GlassButton>
            <GlassButton size="sm" :disabled="!canDoctorFix || doctorRunning || doctorFixing" @click="fixDoctorIssues">
              <Loader2 v-if="doctorFixing" class="size-3.5 animate-spin" />
              <Wrench v-else class="size-3.5" />
              Fix
            </GlassButton>
          </div>
        </div>

        <div v-if="doctorChecks.length" class="space-y-2">
          <div
            v-for="check in doctorChecks"
            :key="check.id"
            class="flex items-start gap-3 rounded-lg border px-3 py-2.5"
            :class="check.status === 'ok'
              ? 'border-emerald-500/15 bg-emerald-500/5'
              : check.status === 'warning'
                ? 'border-amber-500/20 bg-amber-500/5'
                : 'border-red-500/20 bg-red-500/5'"
          >
            <Terminal v-if="check.id === 'codex' || check.id === 'npm'" class="size-3.5 mt-0.5 shrink-0" :class="check.status === 'ok' ? 'text-emerald-400' : check.status === 'warning' ? 'text-amber-400' : 'text-red-400'" />
            <CheckCircle2 v-else-if="check.status === 'ok'" class="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <AlertTriangle v-else-if="check.status === 'warning'" class="size-3.5 text-amber-400 mt-0.5 shrink-0" />
            <XCircle v-else class="size-3.5 text-red-400 mt-0.5 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-[var(--text)]">{{ check.label }}</p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5 break-words">{{ check.detail }}</p>
            </div>
            <button
              v-if="check.id === 'codex' && shouldShowCodexInstaller"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1.5 text-[10px] font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors disabled:opacity-60"
              :disabled="doctorRunning || doctorFixing || codexInstalling"
              @click="installCodexCli"
            >
              <Loader2 v-if="codexInstalling" class="size-3 animate-spin" />
              <Download v-else class="size-3" />
              {{ codexInstalling ? 'Installing' : 'Install/Repair Codex' }}
            </button>
            <span v-if="check.fixable" class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 shrink-0">fixable</span>
          </div>
        </div>

        <div v-if="codexInstallLog" class="rounded-lg border border-[var(--border)] bg-black/20 p-3">
          <div class="flex items-center gap-2 mb-2">
            <Terminal class="size-3.5 text-[var(--text-muted)]" />
            <p class="text-xs font-medium text-[var(--text-muted)]">Codex installer output</p>
          </div>
          <pre class="max-h-40 overflow-auto whitespace-pre-wrap text-[10px] leading-relaxed text-[var(--text-muted)] scrollbar-glass">{{ codexInstallLog }}</pre>
        </div>
      </div>
    </div>

    <!-- Advanced -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">Advanced</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-3">
        <button
          class="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          @click="showRawData = !showRawData"
        >
          <Database class="size-3.5" />
          View local data (raw JSON)
          <ChevronDown v-if="!showRawData" class="size-3.5 ml-auto" />
          <ChevronUp v-else class="size-3.5 ml-auto" />
        </button>
        <pre v-if="showRawData" class="text-[10px] text-[var(--text-muted)] bg-black/20 rounded-lg p-3 overflow-auto max-h-64 scrollbar-glass">{{ rawData }}</pre>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-red-400/70 uppercase tracking-[0.12em]">Danger Zone</h3>
      <div class="danger-zone space-y-3">
        <p class="text-xs text-[var(--text-muted)]">
          These actions affect only data stored within Vindicta. Your project files (vindicta.json) are <strong class="text-[var(--text)]">never deleted</strong> by any of these actions.
        </p>

        <!-- Reset profile -->
        <div class="flex items-center justify-between py-2 border-t border-white/[0.05]">
          <div>
            <p class="text-sm text-[var(--text)]">Reset profile</p>
            <p class="text-xs text-[var(--text-muted)]">Clears your name, email, and role</p>
          </div>
          <GlassButton v-if="confirmReset !== 'profile'" variant="ghost" size="sm" class="text-red-400 hover:text-red-300" @click="confirmReset = 'profile'">
            Reset
          </GlassButton>
          <div v-else class="flex gap-2">
            <GlassButton size="sm" class="bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30" @click="resetProfile">Confirm</GlassButton>
            <GlassButton variant="ghost" size="sm" @click="confirmReset = null">Cancel</GlassButton>
          </div>
        </div>

        <!-- Clear projects -->
        <div class="flex items-center justify-between py-2 border-t border-white/[0.05]">
          <div>
            <p class="text-sm text-[var(--text)]">Clear project list</p>
            <p class="text-xs text-[var(--text-muted)]">Removes all projects from the app registry</p>
          </div>
          <GlassButton v-if="confirmReset !== 'projects'" variant="ghost" size="sm" class="text-red-400 hover:text-red-300" @click="confirmReset = 'projects'">
            Clear
          </GlassButton>
          <div v-else class="flex gap-2">
            <GlassButton size="sm" class="bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30" @click="clearProjects">Confirm</GlassButton>
            <GlassButton variant="ghost" size="sm" @click="confirmReset = null">Cancel</GlassButton>
          </div>
        </div>

        <!-- Reset all -->
        <div class="flex items-center justify-between py-2 border-t border-white/[0.05]">
          <div>
            <p class="text-sm text-[var(--text)]">Reset all app data</p>
            <p class="text-xs text-[var(--text-muted)]">Wipes all settings, profile, and project registry</p>
          </div>
          <GlassButton v-if="confirmReset !== 'all'" variant="ghost" size="sm" class="text-red-400 hover:text-red-300" @click="confirmReset = 'all'">
            Reset all
          </GlassButton>
          <div v-else class="flex gap-2">
            <GlassButton size="sm" class="bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30" @click="resetAll">Confirm</GlassButton>
            <GlassButton variant="ghost" size="sm" @click="confirmReset = null">Cancel</GlassButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
