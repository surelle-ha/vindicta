<script setup lang="ts">
import { AlertTriangle, Bot, CheckCircle2, Circle, ExternalLink, Loader2, RefreshCw, Zap } from 'lucide-vue-next'
import { Command } from '@tauri-apps/plugin-shell'

interface ModelStatus {
  id: string
  name: string
  vendor: string
  description: string
  checkCmd: string
  checkArgs: string[]
  installUrl: string
  docsUrl: string
  color: string
  bg: string
  border: string
  version: string | null
  status: 'checking' | 'available' | 'unavailable' | 'idle'
  error: string | null
}

const models = ref<ModelStatus[]>([
  {
    id: 'claude',
    name: 'Claude Code',
    vendor: 'Anthropic',
    description: 'Claude\'s official CLI for AI-assisted development and security scanning. Streams structured JSON output. Powers Vindicta\'s Claude integration.',
    checkCmd: 'claude',
    checkArgs: ['--version'],
    installUrl: 'https://claude.ai/download',
    docsUrl: 'https://docs.anthropic.com/en/docs/claude-code',
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    version: null,
    status: 'idle',
    error: null,
  },
  {
    id: 'codex',
    name: 'Codex',
    vendor: 'OpenAI',
    description: 'OpenAI\'s Codex CLI for AI-powered code analysis and security review. Supports sandboxed read-only execution. Powers Vindicta\'s Codex integration.',
    checkCmd: 'codex',
    checkArgs: ['--version'],
    installUrl: 'https://github.com/openai/codex',
    docsUrl: 'https://github.com/openai/codex#readme',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    version: null,
    status: 'idle',
    error: null,
  },
])

const openRouterStatus: { name: string; vendor: string; description: string; status: 'coming_soon' } = {
  name: 'OpenRouter',
  vendor: 'OpenRouter.ai',
  description: 'Unified API gateway for 200+ AI models. Will allow Vindicta to route security scans to any supported model — Mistral, Llama, Gemini, and more.',
  status: 'coming_soon',
}

async function tryCapability(capabilityName: string, args: string[]): Promise<string> {
  const cmd = Command.create(capabilityName, args)
  let output = ''
  cmd.stdout.on('data', (d: string) => { output += d })
  cmd.stderr.on('data', (d: string) => { output += d })
  await new Promise<void>((resolve, reject) => {
    cmd.on('close', () => resolve())
    cmd.on('error', reject)
    cmd.spawn().catch(reject)
  })
  return output
}

async function checkModel(model: ModelStatus) {
  model.status = 'checking'
  model.version = null
  model.error = null

  // On Windows npm-installed CLIs have a .cmd shim; try both variants
  const capabilities = model.id === 'claude'
    ? ['claude-cmd-version', 'claude-version-check']
    : ['codex-cmd-version', 'codex-version']

  let lastError: any = null
  for (const cap of capabilities) {
    try {
      const output = await tryCapability(cap, model.checkArgs)
      const match = output.match(/\d+\.\d+[\.\d]*/)?.[0]
      model.version = match ?? 'installed'
      model.status = 'available'
      return
    }
    catch (e: any) {
      lastError = e
    }
  }

  // All variants failed
  const msg = String(lastError?.message ?? lastError ?? '')
  const lower = msg.toLowerCase()
  if (lower.includes('not found') || lower.includes('enoent') || lower.includes('not allowed')) {
    model.status = 'unavailable'
    model.error = 'CLI not found in PATH. Install it and restart the app.'
  }
  else {
    model.status = 'unavailable'
    model.error = msg || 'Failed to check CLI status.'
  }
}

async function checkAll() {
  await Promise.all(models.value.map(m => checkModel(m)))
}

onMounted(() => {
  void checkAll()
})
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 pb-8">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-start gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-xl border border-violet-500/20 bg-violet-500/10">
          <Bot class="size-5 text-violet-300" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-[var(--text)]">AI Models</h1>
          <p class="text-xs text-[var(--text-muted)]">Status and configuration for AI tools used in security scanning.</p>
        </div>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text)]"
        @click="checkAll"
      >
        <RefreshCw class="size-3.5" />
        Refresh
      </button>
    </div>

    <!-- Active integrations -->
    <div class="space-y-3">
      <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">Active Integrations</p>
      <div
        v-for="model in models"
        :key="model.id"
        class="rounded-xl border bg-[var(--bg-card)] p-5 transition-colors"
        :class="model.border"
      >
        <div class="flex items-start gap-4">
          <!-- Status indicator -->
          <div
            class="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border"
            :class="[model.bg, model.border]"
          >
            <Loader2 v-if="model.status === 'checking'" class="size-5 animate-spin" :class="model.color" />
            <CheckCircle2 v-else-if="model.status === 'available'" class="size-5" :class="model.color" />
            <AlertTriangle v-else-if="model.status === 'unavailable'" class="size-5 text-amber-400" />
            <Circle v-else class="size-5 text-[var(--text-faint)]" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-semibold text-[var(--text)]">{{ model.name }}</p>
              <span class="text-[10px] text-[var(--text-faint)]">by {{ model.vendor }}</span>
              <!-- Status badge -->
              <span
                class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="model.status === 'available'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : model.status === 'unavailable'
                    ? 'bg-amber-500/15 text-amber-300'
                    : model.status === 'checking'
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'bg-white/[0.06] text-[var(--text-faint)]'"
              >
                {{ model.status === 'available' ? (model.version ? `v${model.version}` : 'Available') : model.status === 'unavailable' ? 'Not found' : model.status === 'checking' ? 'Checking…' : 'Idle' }}
              </span>
            </div>

            <p class="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">{{ model.description }}</p>

            <!-- Error message -->
            <div v-if="model.error" class="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2">
              <AlertTriangle class="size-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p class="text-xs text-amber-200">{{ model.error }}</p>
            </div>

            <!-- Links -->
            <div class="mt-3 flex items-center gap-3">
              <a
                :href="model.installUrl"
                target="_blank"
                class="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                <Zap class="size-3" />
                Install
              </a>
              <a
                :href="model.docsUrl"
                target="_blank"
                class="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                <ExternalLink class="size-3" />
                Docs
              </a>
              <button
                class="ml-auto inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:opacity-40"
                :disabled="model.status === 'checking'"
                @click="checkModel(model)"
              >
                <RefreshCw class="size-3" :class="model.status === 'checking' ? 'animate-spin' : ''" />
                Re-check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coming soon -->
    <div class="space-y-3">
      <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">Coming Soon</p>
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 opacity-60">
        <div class="flex items-start gap-4">
          <div class="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
            <Bot class="size-5 text-white/30" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-semibold text-[var(--text)]">{{ openRouterStatus.name }}</p>
              <span class="text-[10px] text-[var(--text-faint)]">by {{ openRouterStatus.vendor }}</span>
              <span class="ml-auto rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                Coming Soon
              </span>
            </div>
            <p class="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">{{ openRouterStatus.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Info panel -->
    <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-2">
      <p class="text-xs font-semibold text-[var(--text)]">How AI models are used</p>
      <p class="text-xs leading-relaxed text-[var(--text-muted)]">
        Vindicta shells out to locally installed AI CLIs (Claude Code, Codex) to perform security scans. No credentials are stored in Vindicta — the CLI tools manage their own authentication. Scan prompts are sent directly from your machine to the AI provider.
      </p>
      <p class="text-xs leading-relaxed text-[var(--text-muted)]">
        If a CLI shows "Not found", install it globally and ensure it's accessible on your system PATH. Restart Vindicta after installation.
      </p>
    </div>
  </div>
</template>
