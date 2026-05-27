<script setup lang="ts">
import { ChevronDown, ChevronUp, Loader2, Play, RefreshCw, Terminal, Trash2, X } from 'lucide-vue-next'

const props = defineProps<{
  distro: string
  suggestedCommand?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const app = useAppStore()

interface TermEntry {
  type: 'cmd' | 'out' | 'err' | 'info'
  text: string
}

// WSL backend state
const backendReady = ref(false)
const backendLoading = ref(false)
const backendError = ref('')

// Terminal state
const input = ref(props.suggestedCommand ?? '')
const running = ref(false)
const history = ref<TermEntry[]>([])
const cmdHistory = ref<string[]>([])
const cmdHistoryIdx = ref(-1)
const termEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const minimized = ref(false)

const effectiveDistro = computed(() => {
  if (props.distro) return props.distro
  const profile = app.wslProfiles.find(p => p.id === 'academy')
  return profile?.distro ?? ''
})

async function ensureBackend() {
  if (backendReady.value) return
  backendLoading.value = true
  backendError.value = ''
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('wsl_ensure_academy_backend', { distro: effectiveDistro.value })
    backendReady.value = true
    push('info', `Academy sandbox ready · ${effectiveDistro.value || 'default distro'} · user: academy`)
  }
  catch (e: any) {
    backendError.value = e?.message ?? 'Could not start academy WSL backend.'
  }
  finally {
    backendLoading.value = false
  }
}

async function runCommand(cmd?: string) {
  const command = (cmd ?? input.value).trim()
  if (!command || running.value) return

  if (!backendReady.value) {
    await ensureBackend()
    if (!backendReady.value) return
  }

  if (!cmdHistory.value.includes(command)) cmdHistory.value.unshift(command)
  if (cmdHistory.value.length > 50) cmdHistory.value.pop()
  cmdHistoryIdx.value = -1

  push('cmd', `$ ${command}`)
  input.value = ''
  running.value = true

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const output = await invoke<string>('wsl_run_academy_command', {
      distro: effectiveDistro.value,
      command,
    })
    push('out', output || '(no output)')
  }
  catch (e: any) {
    push('err', e?.message ?? 'Command failed.')
  }
  finally {
    running.value = false
    await nextTick()
    scrollToBottom()
    inputEl.value?.focus()
  }
}

function push(type: TermEntry['type'], text: string) {
  history.value.push({ type, text: text.trimEnd() })
  nextTick().then(scrollToBottom)
}

function scrollToBottom() {
  if (termEl.value) termEl.value.scrollTop = termEl.value.scrollHeight
}

function clearHistory() {
  history.value = []
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    void runCommand()
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (cmdHistory.value.length) {
      cmdHistoryIdx.value = Math.min(cmdHistoryIdx.value + 1, cmdHistory.value.length - 1)
      input.value = cmdHistory.value[cmdHistoryIdx.value] ?? ''
    }
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (cmdHistoryIdx.value > 0) {
      cmdHistoryIdx.value--
      input.value = cmdHistory.value[cmdHistoryIdx.value] ?? ''
    }
    else {
      cmdHistoryIdx.value = -1
      input.value = ''
    }
  }
}

onMounted(() => {
  push('info', '╔══ Vindicta Academy Practice Sandbox ══╗')
  push('info', '  This terminal runs inside a dedicated WSL account.')
  push('info', '  Explore safely — commands run as the "academy" user.')
  push('info', '  Type a command and press Enter, or click Run.')
  void ensureBackend()
})

watch(() => props.suggestedCommand, (cmd) => {
  if (cmd) input.value = cmd
})
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-emerald-500/20 bg-[#050507]">
    <!-- Header bar -->
    <div class="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.025] px-3 py-2">
      <div class="grid size-6 shrink-0 place-items-center rounded border border-emerald-500/20 bg-emerald-500/10">
        <Terminal class="size-3.5 text-emerald-400" />
      </div>
      <span class="flex-1 text-[11px] font-semibold text-emerald-300">Academy Sandbox</span>
      <span class="font-mono text-[10px] text-[var(--text-faint)]">academy@{{ effectiveDistro || 'wsl' }}</span>

      <!-- status dot -->
      <span
        class="size-1.5 rounded-full"
        :class="backendReady ? 'bg-emerald-400' : backendLoading ? 'bg-sky-400 animate-pulse' : 'bg-amber-400'"
      />

      <button
        class="ml-1 rounded p-1 text-[var(--text-faint)] hover:text-[var(--text)]"
        :title="minimized ? 'Expand terminal' : 'Minimize terminal'"
        @click="minimized = !minimized"
      >
        <ChevronUp v-if="!minimized" class="size-3.5" />
        <ChevronDown v-else class="size-3.5" />
      </button>
      <button
        class="rounded p-1 text-[var(--text-faint)] hover:text-red-300"
        title="Close terminal"
        @click="emit('close')"
      >
        <X class="size-3.5" />
      </button>
    </div>

    <div v-if="!minimized">
      <!-- Backend error notice -->
      <div v-if="backendError" class="border-b border-amber-500/20 bg-amber-500/[0.06] px-3 py-2">
        <p class="text-[11px] text-amber-200">{{ backendError }}</p>
        <button class="mt-1 text-[10px] text-amber-300 hover:underline" @click="ensureBackend">
          Retry connection
        </button>
      </div>

      <!-- Output area -->
      <div
        ref="termEl"
        class="custom-scroll h-52 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed"
      >
        <div v-for="(entry, i) in history" :key="i">
          <span
            :class="{
              'text-emerald-300': entry.type === 'cmd',
              'text-[var(--text-muted)]': entry.type === 'out',
              'text-red-300': entry.type === 'err',
              'text-sky-300/70': entry.type === 'info',
            }"
          >{{ entry.text }}</span>
        </div>
        <div v-if="running" class="flex items-center gap-1.5 text-amber-300">
          <Loader2 class="size-3 animate-spin" />
          <span>Running…</span>
        </div>
      </div>

      <!-- Input row -->
      <div class="flex items-center gap-2 border-t border-white/[0.05] bg-black/20 px-3 py-2">
        <span class="shrink-0 font-mono text-[11px] text-emerald-400">$</span>
        <input
          ref="inputEl"
          v-model="input"
          class="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          placeholder="type a command…"
          :disabled="running || backendLoading"
          autocomplete="off"
          spellcheck="false"
          @keydown="onKeyDown"
        >
        <button
          class="shrink-0 rounded border border-white/10 bg-white/[0.04] p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/[0.08] hover:text-[var(--text)] disabled:opacity-40"
          :disabled="running || !input.trim()"
          title="Run command"
          @click="runCommand()"
        >
          <Loader2 v-if="running" class="size-3 animate-spin" />
          <Play v-else class="size-3" />
        </button>
        <button
          class="shrink-0 rounded border border-white/10 bg-white/[0.04] p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/[0.08] hover:text-[var(--text)]"
          title="Reconnect backend"
          @click="ensureBackend"
        >
          <RefreshCw class="size-3" :class="backendLoading ? 'animate-spin' : ''" />
        </button>
        <button
          v-if="history.length > 0"
          class="shrink-0 rounded border border-white/10 bg-white/[0.04] p-1.5 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-300"
          title="Clear output"
          @click="clearHistory"
        >
          <Trash2 class="size-3" />
        </button>
      </div>
    </div>
  </div>
</template>
