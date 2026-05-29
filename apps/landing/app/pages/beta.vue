<script setup lang="ts">
useHead({ title: 'Open Beta — Vindicta' })

const { public: { apiUrl } } = useRuntimeConfig()

const name  = ref('')
const email = ref('')
const loading = ref(false)
const success = ref(false)
const error   = ref('')

async function submit() {
  error.value   = ''
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/api/v1/beta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim(), email: email.value.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error ?? 'Something went wrong. Please try again.'
    } else {
      success.value = true
    }
  } catch {
    error.value = 'Network error. Please check your connection and try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-1 flex items-center justify-center px-6 py-32">
      <div class="w-full max-w-md">

        <!-- Icon -->
        <div class="mb-8 flex justify-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-3xl border border-accent/25 bg-accent/8">
            <svg class="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </div>

        <!-- Badge -->
        <div class="mb-6 flex justify-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent/80">
            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Open Beta
          </div>
        </div>

        <!-- Title -->
        <h1 class="font-display text-[40px] sm:text-[52px] font-black uppercase leading-none tracking-wide mb-4 text-center">
          Join the Beta
        </h1>

        <p class="text-[14px] leading-relaxed text-white/45 mb-10 text-center">
          Vindicta is entering open beta. Be among the first to run AI-powered security scans, track findings, and learn through the Academy — locally, for free.
        </p>

        <!-- Success state -->
        <div v-if="success" class="rounded-2xl border border-accent/20 bg-accent/8 p-8 text-center">
          <div class="flex justify-center mb-4">
            <svg class="h-12 w-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
            </svg>
          </div>
          <h2 class="font-display text-[24px] font-black uppercase mb-3">Check your inbox</h2>
          <p class="text-[13px] text-white/50 leading-relaxed">
            We sent your personal download link to <span class="text-white/80 font-semibold">{{ email }}</span>.
            The link gives you direct access to the download page.
          </p>
        </div>

        <!-- Form card -->
        <div v-else class="rounded-2xl border border-white/8 bg-surface/60 p-6 sm:p-8">
          <form @submit.prevent="submit" class="space-y-4 mb-6">
            <!-- Name -->
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                Full Name
              </label>
              <input
                v-model="name"
                type="text"
                placeholder="Jane Doe"
                required
                :disabled="loading"
                class="w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none focus:border-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                Email Address
              </label>
              <input
                v-model="email"
                type="email"
                placeholder="jane@example.com"
                required
                :disabled="loading"
                class="w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none focus:border-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Error -->
            <p v-if="error" class="text-[12px] text-red-400/80 leading-relaxed">
              {{ error }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading || !name.trim() || !email.trim()"
              class="w-full flex items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-accent/85 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ loading ? 'Requesting access…' : 'Request Beta Access' }}
            </button>
          </form>

          <p class="text-center text-[11px] text-white/25 leading-relaxed">
            You'll receive a unique download link by email. No password required.
          </p>
        </div>

        <!-- Perks -->
        <div class="mt-8">
          <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4 text-center">Beta access includes</p>
          <div class="space-y-2.5">
            <div
              v-for="perk in [
                { icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', text: 'AI-powered security scanning with Claude & Codex' },
                { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', text: 'Findings tracker and dependency inventory' },
                { icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', text: '30-lesson Vindicta Academy — zero to pentest' },
                { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', text: '100% local — no cloud, no account, no telemetry' },
              ]"
              :key="perk.text"
              class="flex items-start gap-3 rounded-xl border border-white/5 bg-surface/40 px-4 py-3"
            >
              <svg class="h-4 w-4 text-accent/50 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="perk.icon" />
              </svg>
              <span class="text-[12px] text-white/50 leading-relaxed">{{ perk.text }}</span>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <NuxtLink to="/" class="text-[12px] text-white/30 hover:text-white/60 transition-colors">
            ← Back to home
          </NuxtLink>
        </div>

      </div>
    </main>
  </div>
</template>
