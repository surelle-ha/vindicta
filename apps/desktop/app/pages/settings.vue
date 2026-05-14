<script setup lang="ts">
import { Sun, Moon, Database, ChevronDown, ChevronUp, Stethoscope, CheckCircle2, AlertTriangle, XCircle, Wrench, Loader2, FlaskConical, Terminal, Download } from 'lucide-vue-next'

const app = useAppStore()
const user = useUserStore()
const projects = useProjectsStore()
const router = useRouter()
const { notify } = useNotifications()

// Notifications
const notifs = ref(app.notificationsEnabled)
watch(notifs, (v) => app.setNotifications(v))

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
  if (!doctorChecks.value.length) return 'Run checks to inspect local app state.'
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

async function runCodexCli(args: string[]) {
  const { Command } = await import('@tauri-apps/plugin-shell')
  const commandName = args[0] === '--version' ? 'codex-version' : 'codex-login-status'
  return Command.create(commandName, args).execute()
}

async function runNpmCli(args: string[]) {
  const { Command } = await import('@tauri-apps/plugin-shell')
  return Command.create('npm-version', args).execute()
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
    const { Command } = await import('@tauri-apps/plugin-shell')
    const output = await Command.create('npm-install-codex', ['install', '-g', '@openai/codex@latest']).execute()

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
      detail: user.name ? `Signed in as ${user.name}` : 'Profile name is missing. Complete onboarding to personalize activity.',
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
      </div>
    </div>

    <!-- Notifications -->
    <div class="space-y-3">
      <h3 class="text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">Notifications</h3>
      <div class="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--text)]">In-app notifications</p>
            <p class="text-xs text-[var(--text-muted)] mt-0.5">Toast alerts for tickets, sprints, and project events</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="notifs" type="checkbox" class="sr-only peer">
            <div class="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white" />
          </label>
        </div>

        <div class="border-t border-[var(--border)] pt-4">
          <div class="flex items-center gap-2 mb-3">
            <FlaskConical class="size-3.5 text-violet-300" />
            <p class="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Toast tests</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="px-3 py-2 text-xs rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-colors font-medium"
              @click="notify('This is an info notification', 'info')"
            >
              Test Info
            </button>
            <button
              class="px-3 py-2 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors font-medium"
              @click="notify('Action completed successfully', 'success')"
            >
              Test Success
            </button>
            <button
              class="px-3 py-2 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors font-medium"
              @click="notify('Something may need your attention', 'warning')"
            >
              Test Warning
            </button>
            <button
              class="px-3 py-2 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors font-medium"
              @click="notify('An error occurred. Please try again.', 'error')"
            >
              Test Error
            </button>
          </div>
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
