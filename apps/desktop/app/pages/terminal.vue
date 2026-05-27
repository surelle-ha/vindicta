<script setup lang="ts">
import { Command } from '@tauri-apps/plugin-shell'
import { AlertTriangle, ChevronRight, Circle, Loader2, Terminal, Trash2, X } from 'lucide-vue-next'

interface HistoryEntry {
  id: number
  command: string
  output: string
  exitCode: number | null
  error: string | null
  duration: number
  timestamp: Date
}

const wslAvailable = ref<boolean | null>(null)
const checkingWsl = ref(false)
const currentCommand = ref('')
const isRunning = ref(false)
const history = ref<HistoryEntry[]>([])
const terminalEl = ref<HTMLElement | null>(null)
let nextId = 1

const wslDistro = ref('Linux (WSL)')

async function checkWsl() {
  checkingWsl.value = true
  try {
    // wsl-version capability: runs "wsl --version" (args are fixed in capability)
    const cmd = Command.create('wsl-version')
    let output = ''
    cmd.stdout.on('data', (d: string) => { output += d })
    cmd.stderr.on('data', (d: string) => { output += d })
    await new Promise<void>((resolve, reject) => {
      cmd.on('close', () => resolve())
      cmd.on('error', reject)
      cmd.spawn().catch(reject)
    })
    // Try to identify the WSL environment
    try {
      // wsl-exec capability: runs "wsl bash -c <cmd>" — pass only the dynamic part
      const listCmd = Command.create('wsl-exec', ['uname -a'])
      let uname = ''
      listCmd.stdout.on('data', (d: string) => { uname += d })
      await new Promise<void>((resolve) => {
        listCmd.on('close', () => resolve())
        listCmd.on('error', () => resolve())
        listCmd.spawn().catch(() => resolve())
      })
      if (uname.trim()) {
        const parts = uname.trim().split(' ')
        wslDistro.value = parts[2]?.includes('WSL') ? `WSL ${parts[2]}` : 'WSL Linux'
      }
    }
    catch { /* ignore */ }
    wslAvailable.value = true
  }
  catch {
    wslAvailable.value = false
  }
  finally {
    checkingWsl.value = false
  }
}

async function runCommand() {
  const cmd = currentCommand.value.trim()
  if (!cmd || isRunning.value) return

  const entry: HistoryEntry = {
    id: nextId++,
    command: cmd,
    output: '',
    exitCode: null,
    error: null,
    duration: 0,
    timestamp: new Date(),
  }
  history.value.push(entry)
  currentCommand.value = ''
  isRunning.value = true
  const start = Date.now()

  try {
    // wsl-exec: "wsl bash -c <cmd>" — only pass the dynamic command part
    const shellCmd = Command.create('wsl-exec', [cmd])
    shellCmd.stdout.on('data', (d: string) => {
      entry.output += d
    })
    shellCmd.stderr.on('data', (d: string) => {
      entry.output += d
    })
    await new Promise<void>((resolve, reject) => {
      shellCmd.on('close', (payload) => {
        entry.exitCode = payload.code
        resolve()
      })
      shellCmd.on('error', reject)
      shellCmd.spawn().catch(reject)
    })
  }
  catch (e: any) {
    entry.error = String(e?.message ?? e ?? 'Command failed')
    entry.exitCode = 1
  }
  finally {
    entry.duration = Date.now() - start
    isRunning.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (terminalEl.value) {
    terminalEl.value.scrollTop = terminalEl.value.scrollHeight
  }
}

function clearHistory() {
  history.value = []
}

function removeEntry(id: number) {
  history.value = history.value.filter(e => e.id !== id)
}

// Command history navigation
const cmdHistory = ref<string[]>([])
const cmdHistoryIdx = ref(-1)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (!e.shiftKey) {
      e.preventDefault()
      if (currentCommand.value.trim()) {
        cmdHistory.value.unshift(currentCommand.value.trim())
        cmdHistoryIdx.value = -1
        void runCommand()
      }
    }
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (cmdHistoryIdx.value < cmdHistory.value.length - 1) {
      cmdHistoryIdx.value++
      currentCommand.value = cmdHistory.value[cmdHistoryIdx.value] ?? ''
    }
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (cmdHistoryIdx.value > 0) {
      cmdHistoryIdx.value--
      currentCommand.value = cmdHistory.value[cmdHistoryIdx.value] ?? ''
    }
    else {
      cmdHistoryIdx.value = -1
      currentCommand.value = ''
    }
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTimestamp(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const quickCommands = [
  { label: 'ls -la', cmd: 'ls -la' },
  { label: 'pwd', cmd: 'pwd' },
  { label: 'whoami', cmd: 'whoami' },
  { label: 'uname -a', cmd: 'uname -a' },
  { label: 'df -h', cmd: 'df -h' },
  { label: 'free -h', cmd: 'free -h' },
  { label: 'ip addr', cmd: 'ip addr' },
  { label: 'ps aux', cmd: 'ps aux | head -20' },
]

function runQuick(cmd: string) {
  currentCommand.value = cmd
  cmdHistory.value.unshift(cmd)
  cmdHistoryIdx.value = -1
  void runCommand()
}

onMounted(() => {
  void checkWsl()
})
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
      <div class="grid size-8 shrink-0 place-items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
        <Terminal class="size-4 text-emerald-300" />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-sm font-semibold text-[var(--text)]">Terminal</h1>
        <p class="text-[11px] text-[var(--text-muted)]">
          WSL / Linux subsystem shell
          <span v-if="wslAvailable" class="ml-1 text-emerald-400">· {{ wslDistro }}</span>
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- WSL status -->
        <div class="flex items-center gap-1.5 text-[11px]">
          <Loader2 v-if="checkingWsl" class="size-3 animate-spin text-[var(--text-faint)]" />
          <span v-else-if="wslAvailable" class="flex items-center gap-1 text-emerald-400">
            <span class="size-1.5 rounded-full bg-emerald-400 inline-block" />
            Connected
          </span>
          <span v-else-if="wslAvailable === false" class="flex items-center gap-1 text-amber-400">
            <AlertTriangle class="size-3" />
            WSL not found
          </span>
          <span v-else class="text-[var(--text-faint)]">Checking…</span>
        </div>

        <button
          v-if="history.length > 0"
          class="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
          title="Clear terminal"
          @click="clearHistory"
        >
          <Trash2 class="size-3" />
          Clear
        </button>
      </div>
    </div>

    <!-- WSL not available banner -->
    <div v-if="wslAvailable === false" class="shrink-0 border-b border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
      <div class="flex items-start gap-3">
        <AlertTriangle class="size-4 text-amber-400 mt-0.5 shrink-0" />
        <div class="space-y-1">
          <p class="text-sm font-semibold text-amber-300">WSL not detected</p>
          <p class="text-xs text-[var(--text-muted)]">
            This terminal requires Windows Subsystem for Linux (WSL 2). Install WSL from the Microsoft Store or run
            <code class="rounded bg-white/[0.07] px-1 py-0.5 font-mono text-[11px]">wsl --install</code>
            in an elevated PowerShell window.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick commands bar -->
    <div v-if="wslAvailable" class="shrink-0 flex items-center gap-1.5 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 custom-scroll">
      <span class="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)] mr-1">Quick</span>
      <button
        v-for="q in quickCommands"
        :key="q.cmd"
        class="shrink-0 rounded border border-[var(--border)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] hover:text-emerald-300"
        @click="runQuick(q.cmd)"
      >
        {{ q.label }}
      </button>
    </div>

    <!-- Output area -->
    <div
      ref="terminalEl"
      class="terminal-output flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed custom-scroll"
    >
      <!-- Welcome message -->
      <div v-if="history.length === 0" class="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div class="grid size-16 place-items-center rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06]">
          <Terminal class="size-8 text-emerald-400/50" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-[var(--text-muted)]">WSL Terminal</p>
          <p class="text-xs text-[var(--text-faint)]">
            {{ wslAvailable ? 'Type a command below or pick a quick command above.' : 'Waiting for WSL connection…' }}
          </p>
        </div>
      </div>

      <!-- History entries -->
      <div v-else class="space-y-4">
        <div
          v-for="entry in history"
          :key="entry.id"
          class="group"
        >
          <!-- Command line -->
          <div class="flex items-center gap-2 text-[11px]">
            <ChevronRight class="size-3 shrink-0 text-emerald-400" />
            <span class="flex-1 text-emerald-300">{{ entry.command }}</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[var(--text-faint)]">
              <span>{{ formatTimestamp(entry.timestamp) }}</span>
              <span>·</span>
              <span>{{ formatDuration(entry.duration) }}</span>
              <button
                class="ml-1 rounded p-0.5 hover:text-[var(--text)]"
                @click="removeEntry(entry.id)"
              >
                <X class="size-2.5" />
              </button>
            </span>
          </div>

          <!-- Output -->
          <div
            v-if="entry.output || entry.error"
            class="mt-1.5 ml-5 rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2"
          >
            <pre v-if="entry.output" class="whitespace-pre-wrap break-all text-[var(--text-muted)]">{{ entry.output.trimEnd() }}</pre>
            <p v-if="entry.error" class="text-red-300">{{ entry.error }}</p>
          </div>

          <!-- Exit status -->
          <div class="mt-1 ml-5 flex items-center gap-1.5">
            <Circle
              class="size-1.5 fill-current"
              :class="entry.exitCode === 0 ? 'text-emerald-400' : entry.exitCode === null ? 'text-[var(--text-faint)]' : 'text-red-400'"
            />
            <span class="text-[10px] text-[var(--text-faint)]">
              exit {{ entry.exitCode ?? '?' }}
            </span>
          </div>
        </div>

        <!-- Running indicator -->
        <div v-if="isRunning" class="flex items-center gap-2 text-[11px] text-[var(--text-faint)]">
          <Loader2 class="size-3 animate-spin text-emerald-400" />
          <span>Running…</span>
        </div>
      </div>
    </div>

    <!-- Input bar -->
    <div class="shrink-0 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
      <div
        class="flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
        :class="wslAvailable
          ? 'border-emerald-500/20 bg-black/20 focus-within:border-emerald-500/40'
          : 'border-[var(--border)] bg-black/10 opacity-50'"
      >
        <ChevronRight class="size-3.5 shrink-0 text-emerald-400" />
        <input
          v-model="currentCommand"
          :disabled="!wslAvailable || isRunning"
          type="text"
          placeholder="Enter command… (↑↓ history, Enter to run)"
          class="flex-1 bg-transparent font-mono text-[12px] text-[var(--text)] placeholder-[var(--text-faint)] outline-none"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          @keydown="onKeyDown"
        >
        <button
          v-if="currentCommand.trim()"
          :disabled="isRunning || !wslAvailable"
          class="flex items-center gap-1 rounded-md bg-emerald-600/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-600/30 disabled:opacity-40"
          @click="runCommand"
        >
          <Loader2 v-if="isRunning" class="size-3 animate-spin" />
          <span>{{ isRunning ? 'Running' : 'Run' }}</span>
        </button>
      </div>
      <p class="mt-1.5 px-1 text-[10px] text-[var(--text-faint)]">
        Commands execute in your default WSL distribution. ↑↓ arrow keys navigate command history.
      </p>
    </div>
  </div>
</template>

<style scoped>
.terminal-output {
  background: var(--bg-base, #0d0d10);
}

.terminal-output pre {
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
}
</style>
