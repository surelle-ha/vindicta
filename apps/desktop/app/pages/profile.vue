<script setup lang="ts">
import { Activity, RotateCcw, LogIn, UserCircle2, Clock3 } from 'lucide-vue-next'
import type { PromptRunHistory } from '~/stores/user'

const user = useUserStore()
const router = useRouter()

const name = ref(user.name)
const email = ref(user.email)
const jobRole = ref(user.jobRole || 'Developer')

const roles = ['Developer', 'Designer', 'Product Manager', 'QA Engineer', 'Tech Lead', 'DevOps', 'Other']
const saved = ref(false)
const showPromptModal = ref(false)
const selectedPrompt = ref<PromptRunHistory | null>(null)

async function saveProfile() {
  await user.save({ name: name.value.trim(), email: email.value.trim(), jobRole: jobRole.value })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

const initials = computed(() => {
  const n = (name.value || user.name || 'U').trim()
  return n.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})

const tokenUsage = computed(() => user.tokenUsage)
const formattedTotalTokens = computed(() => tokenUsage.value.totalTokens.toLocaleString())
const lastTokenUse = computed(() => {
  if (!tokenUsage.value.lastUsedAt) return 'No AI usage recorded yet'
  return new Date(tokenUsage.value.lastUsedAt).toLocaleString()
})
const promptPageSize = 6
const promptPage = ref(1)
const promptPageCount = computed(() => Math.max(1, Math.ceil(tokenUsage.value.history.length / promptPageSize)))
const promptHistory = computed(() => {
  const start = (promptPage.value - 1) * promptPageSize
  return tokenUsage.value.history.slice(start, start + promptPageSize)
})

watch(() => tokenUsage.value.history.length, () => {
  if (promptPage.value > promptPageCount.value) promptPage.value = promptPageCount.value
})

function previousPromptPage() {
  promptPage.value = Math.max(1, promptPage.value - 1)
}

function nextPromptPage() {
  promptPage.value = Math.min(promptPageCount.value, promptPage.value + 1)
}

function promptTitle(prompt: string) {
  const firstLine = prompt.split('\n').map(line => line.trim()).find(Boolean)
  if (!firstLine) return 'Prompt content unavailable'
  return firstLine.length > 90 ? `${firstLine.slice(0, 90)}...` : firstLine
}

function openPrompt(item: PromptRunHistory) {
  selectedPrompt.value = item
  showPromptModal.value = true
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6 space-y-6">
    <section class="isolate overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="relative z-0 h-52 overflow-hidden">
        <Dither
          class="pointer-events-none z-0 opacity-90"
          :wave-speed="0.03"
          :wave-frequency="2.5"
          :wave-amplitude="0.36"
          :wave-color="[0.34, 0.36, 0.9]"
          :color-num="5"
          :pixel-size="2"
          :disable-animation="false"
          :enable-mouse-interaction="false"
          :mouse-radius="0.8"
        />
        <div class="absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
      </div>

      <div class="relative z-20 px-5 pb-5 sm:px-6">
        <div class="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="relative z-30 shrink-0 rounded-full bg-[var(--bg-card)] p-1 shadow-xl shadow-black/30">
            <div class="size-28 rounded-full border border-indigo-300/25 bg-gradient-to-br from-indigo-500 via-violet-600 to-sky-500 grid place-items-center">
              <span class="text-3xl font-bold text-white drop-shadow-sm">{{ initials }}</span>
            </div>
          </div>
          <div class="min-w-0 flex-1 pb-1">
            <h1 class="truncate text-2xl font-bold text-[var(--text)]">{{ user.name || 'No name set' }}</h1>
            <p class="truncate text-sm text-[var(--text-muted)]">{{ user.email || 'No email set' }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <GlassBadge variant="purple">{{ user.jobRole || 'Developer' }}</GlassBadge>
              <GlassBadge variant="info">{{ tokenUsage.runs }} AI run{{ tokenUsage.runs !== 1 ? 's' : '' }}</GlassBadge>
            </div>
          </div>
          <GlassButton size="sm" class="self-start sm:self-end" @click="router.push('/login')">
            <LogIn class="size-3.5" />
            Sign In
          </GlassButton>
        </div>

        <div class="mt-5 flex items-start gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] p-3">
          <UserCircle2 class="size-4 text-indigo-300 mt-0.5 shrink-0" />
          <p class="text-xs leading-relaxed text-[var(--text-muted)]">
            GitHub and Google login are being prepared. For now, Vindicta keeps this profile and AI activity history locally on this device.
          </p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside class="space-y-6">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
          <div>
            <p class="text-sm font-semibold text-[var(--text)]">Edit Profile</p>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">This identity stays local until sign-in is ready.</p>
          </div>
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Name</label>
            <GlassInput v-model="name" placeholder="Your name" @keydown.enter="saveProfile" />
          </div>
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Email</label>
            <GlassInput v-model="email" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Role</label>
            <GlassSelect v-model="jobRole" class="w-full">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </GlassSelect>
          </div>
          <GlassButton size="sm" @click="saveProfile">
            {{ saved ? 'Saved!' : 'Save changes' }}
          </GlassButton>
        </div>

        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Activity class="size-3.5 text-indigo-300" />
              <p class="text-sm font-semibold text-[var(--text)]">AI Usage</p>
            </div>
            <GlassButton variant="ghost" size="sm" @click="user.resetTokenUsage()">
              <RotateCcw class="size-3.5" />
              Reset
            </GlassButton>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Total</p>
              <p class="text-lg font-semibold text-[var(--text)]">{{ formattedTotalTokens }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Runs</p>
              <p class="text-lg font-semibold text-[var(--text)]">{{ tokenUsage.runs }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Input</p>
              <p class="text-sm font-medium text-indigo-300">{{ tokenUsage.inputTokens.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Output</p>
              <p class="text-sm font-medium text-violet-300">{{ tokenUsage.outputTokens.toLocaleString() }}</p>
            </div>
          </div>

          <p class="text-xs text-[var(--text-muted)]">{{ lastTokenUse }}</p>
        </div>
      </aside>

      <main class="space-y-6">
        <div v-if="tokenUsage.byModel.length" class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <p class="text-sm font-semibold text-[var(--text)]">Models</p>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="item in tokenUsage.byModel"
              :key="`${item.tool}-${item.model}`"
              class="rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-xs font-medium text-[var(--text)]">{{ item.model }}</p>
                <GlassBadge variant="info" size="sm">{{ item.tool }}</GlassBadge>
              </div>
              <p class="mt-1 text-[11px] text-[var(--text-muted)]">
                {{ item.runs }} run{{ item.runs !== 1 ? 's' : '' }} - {{ item.totalTokens.toLocaleString() }} estimated tokens
              </p>
              <div class="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <span class="rounded border border-indigo-500/15 bg-indigo-500/10 px-2 py-1 text-indigo-200">In {{ item.inputTokens.toLocaleString() }}</span>
                <span class="rounded border border-violet-500/15 bg-violet-500/10 px-2 py-1 text-violet-200">Out {{ item.outputTokens.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2">
              <Clock3 class="size-3.5 text-violet-300" />
              <div>
                <p class="text-sm font-semibold text-[var(--text)]">Prompt History</p>
                <p class="text-xs text-[var(--text-muted)] mt-0.5">Recent prompts run through configured AI tools.</p>
              </div>
            </div>
            <div v-if="tokenUsage.history.length > promptPageSize" class="flex items-center gap-2">
              <span class="text-[10px] text-[var(--text-faint)]">
                Page {{ promptPage }} of {{ promptPageCount }}
              </span>
              <GlassButton variant="ghost" size="sm" :disabled="promptPage === 1" @click="previousPromptPage">
                Previous
              </GlassButton>
              <GlassButton variant="ghost" size="sm" :disabled="promptPage === promptPageCount" @click="nextPromptPage">
                Next
              </GlassButton>
            </div>
          </div>

          <div v-if="promptHistory.length" class="space-y-2">
            <button
              v-for="item in promptHistory"
              :key="item.id"
              class="w-full rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-left transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/[0.06]"
              @click="openPrompt(item)"
            >
              <div class="flex flex-wrap items-center gap-2">
                <GlassBadge variant="info" size="sm">{{ item.tool }}</GlassBadge>
                <span class="text-[10px] text-[var(--text-muted)]">{{ item.model }}</span>
                <span class="text-[10px] text-[var(--text-faint)]">{{ new Date(item.createdAt).toLocaleString() }}</span>
              </div>
              <p class="text-xs text-[var(--text)] mt-1.5 break-words">{{ promptTitle(item.prompt) }}</p>
              <div class="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                <span class="rounded border border-indigo-500/15 bg-indigo-500/10 px-2 py-0.5 text-indigo-200">Input {{ item.inputTokens.toLocaleString() }}</span>
                <span class="rounded border border-violet-500/15 bg-violet-500/10 px-2 py-0.5 text-violet-200">Output {{ item.outputTokens.toLocaleString() }}</span>
                <span class="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[var(--text-muted)]">Total {{ item.totalTokens.toLocaleString() }}</span>
              </div>
              <p class="text-[10px] text-[var(--text-faint)] mt-1">Click to view full prompt</p>
            </button>
          </div>

          <div v-else class="rounded-lg border border-dashed border-[var(--border)] py-10 text-center">
            <p class="text-sm text-[var(--text-muted)]">No prompt history yet.</p>
          </div>
        </div>
      </main>
    </div>

    <GlassModal v-model="showPromptModal" title="Prompt Details" max-width="xl" @close="selectedPrompt = null">
      <div v-if="selectedPrompt" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <GlassBadge variant="info" size="sm">{{ selectedPrompt.tool }}</GlassBadge>
          <span class="text-xs text-[var(--text-muted)]">{{ selectedPrompt.model }}</span>
          <span class="text-xs text-[var(--text-faint)]">{{ new Date(selectedPrompt.createdAt).toLocaleString() }}</span>
          <span class="text-xs text-indigo-300">Input {{ selectedPrompt.inputTokens.toLocaleString() }}</span>
          <span class="text-xs text-violet-300">Output {{ selectedPrompt.outputTokens.toLocaleString() }}</span>
          <span class="text-xs text-[var(--text-faint)]">Total {{ selectedPrompt.totalTokens.toLocaleString() }}</span>
        </div>

        <pre class="max-h-[60vh] overflow-auto custom-scroll whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-black/25 p-4 text-xs leading-relaxed text-[var(--text-muted)]">{{ selectedPrompt.prompt || 'Prompt content unavailable.' }}</pre>
      </div>
    </GlassModal>
  </div>
</template>
