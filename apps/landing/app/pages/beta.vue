<script setup lang="ts">
useHead({ title: 'Download Vindicta — Open Beta' })

const MANIFEST = 'https://pub-1dcbd264e42f475e9f95858cc16ab6b7.r2.dev/releases/latest/update.json'

const loading    = ref(true)
const fetchError = ref(false)
const version    = ref<string | null>(null)
const pubDate    = ref<string | null>(null)
const winUrl     = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch(MANIFEST)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as {
      version: string
      pub_date: string
      platforms: Record<string, { url: string }>
    }
    version.value = data.version ?? null
    pubDate.value = data.pub_date
      ? new Date(data.pub_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : null
    winUrl.value = data.platforms?.['windows-x86_64']?.url ?? null
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-1 flex items-center justify-center px-6 py-32">
      <div class="w-full max-w-md">

        <!-- Icon -->
        <div class="mb-8 flex justify-center">
          <div class="animate-float relative">
            <img src="/icon.png" alt="Vindicta" class="h-20 w-20 icon-glow" />
          </div>
        </div>

        <!-- Badge -->
        <div class="mb-6 flex justify-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent/80">
            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Open Beta
            <span v-if="version" class="opacity-60">· v{{ version }}</span>
          </div>
        </div>

        <!-- Title -->
        <h1 class="font-display text-[40px] sm:text-[52px] font-black uppercase leading-none tracking-wide mb-4 text-center">
          Download Vindicta
        </h1>

        <p class="text-[14px] leading-relaxed text-white/45 mb-10 text-center">
          Local-first AI security workspace. Scan codebases, track findings, and master security — all on your machine.
        </p>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-6">
          <svg class="h-7 w-7 text-accent/40 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="rounded-2xl border border-err/20 bg-err/5 px-5 py-4 text-center mb-6">
          <p class="text-[13px] text-err/80">Could not load release info. Try refreshing the page.</p>
        </div>

        <!-- Download card -->
        <div v-else class="rounded-2xl border border-white/8 bg-surface/60 p-6 sm:p-8 mb-6">

          <!-- Windows button -->
          <a
            :href="winUrl ?? '#'"
            :class="winUrl ? '' : 'pointer-events-none opacity-40'"
            class="group flex items-center gap-3 rounded-xl bg-accent px-6 py-4 text-[14px] font-bold text-white transition-all hover:bg-accent/85 hover:scale-[1.02] active:scale-[0.98] w-full justify-center mb-4"
          >
            <svg class="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download for Windows
            <span v-if="version" class="opacity-55 font-normal text-[12px]">v{{ version }}</span>
          </a>

          <!-- Meta -->
          <div class="flex items-center justify-center gap-4 text-[11px] text-white/30">
            <span>Windows 10 / 11 · x64</span>
            <span class="text-white/15">·</span>
            <span>Free</span>
            <span v-if="pubDate" class="text-white/15">·</span>
            <span v-if="pubDate">{{ pubDate }}</span>
          </div>

          <!-- SmartScreen note -->
          <div class="mt-5 rounded-xl border border-warn/15 bg-warn/5 px-4 py-3 flex items-start gap-2.5">
            <svg class="h-4 w-4 text-warn/70 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-[11px] text-white/35 leading-relaxed">
              Windows SmartScreen may prompt you. Click <strong class="text-white/55">"More info"</strong> → <strong class="text-white/55">"Run anyway"</strong> to proceed. Vindicta is not yet code-signed.
            </p>
          </div>
        </div>

        <!-- What's included -->
        <div class="space-y-2.5 mb-8">
          <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4 text-center">What's included</p>
          <div
            v-for="perk in [
              { icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', text: 'AI security scanning — Claude, OpenRouter, Ollama' },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', text: 'Findings tracker, dependency inventory, secret detection' },
              { icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', text: 'Vindicta Academy — 30-lesson security bootcamp' },
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

        <div class="text-center">
          <NuxtLink to="/" class="text-[12px] text-white/30 hover:text-white/60 transition-colors">
            ← Back to home
          </NuxtLink>
        </div>

      </div>
    </main>
  </div>
</template>
