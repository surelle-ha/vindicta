<script setup lang="ts">
useHead({ title: 'Download — Vindicta' })

const { public: { apiUrl } } = useRuntimeConfig()
const route = useRoute()

const state = ref<'loading' | 'valid' | 'invalid'>('loading')
const userName = ref('')

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    state.value = 'invalid'
    return
  }

  try {
    const res = await fetch(`${apiUrl}/api/v1/download/validate?token=${encodeURIComponent(token)}`)
    const data = await res.json()
    if (res.ok && data.valid) {
      userName.value = data.name
      state.value = 'valid'
    } else {
      state.value = 'invalid'
    }
  } catch {
    state.value = 'invalid'
  }
})

const releases = [
  {
    platform: 'Windows',
    icon: 'M3 3h8v8H3zm0 10h8v8H3zM13 3h8v8h-8zm0 10h8v8h-8z',
    ext: '.msi',
    url: 'https://github.com/surelle-ha/vindicta/releases/latest',
    note: 'Windows 10 / 11 (x64)',
  },
  {
    platform: 'Linux',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
    ext: '.AppImage',
    url: 'https://github.com/surelle-ha/vindicta/releases/latest',
    note: 'Ubuntu 22.04+ / Debian',
  },
  {
    platform: 'macOS',
    icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z',
    ext: '.dmg',
    url: 'https://github.com/surelle-ha/vindicta/releases/latest',
    note: 'macOS 12+ (Apple Silicon & Intel)',
  },
]
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-1 flex items-center justify-center px-6 py-32">
      <div class="w-full max-w-lg">

        <!-- Loading -->
        <div v-if="state === 'loading'" class="text-center">
          <svg class="h-8 w-8 text-accent/50 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
          <p class="text-[13px] text-white/30">Validating your access…</p>
        </div>

        <!-- Invalid token -->
        <div v-else-if="state === 'invalid'" class="text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/8 mx-auto mb-8">
            <svg class="h-10 w-10 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 class="font-display text-[32px] font-black uppercase leading-none tracking-wide mb-4">
            Invalid Link
          </h1>
          <p class="text-[14px] text-white/45 leading-relaxed mb-8">
            This download link is invalid or has already been used. Request a new one by joining the beta.
          </p>
          <NuxtLink
            to="/beta"
            class="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-accent/85"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Request Beta Access
          </NuxtLink>
        </div>

        <!-- Valid — show downloads -->
        <div v-else>
          <!-- Icon -->
          <div class="mb-8 flex justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl border border-accent/25 bg-accent/8">
              <svg class="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
          </div>

          <div class="mb-6 flex justify-center">
            <div class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent/80">
              <span class="h-1.5 w-1.5 rounded-full bg-accent" />
              Beta Access Confirmed
            </div>
          </div>

          <h1 class="font-display text-[40px] sm:text-[48px] font-black uppercase leading-none tracking-wide mb-4 text-center">
            Download Vindicta
          </h1>

          <p class="text-[14px] leading-relaxed text-white/45 mb-10 text-center">
            Welcome, <span class="text-white/80 font-semibold">{{ userName }}</span>. Choose your platform below.
          </p>

          <!-- Platform cards -->
          <div class="space-y-3 mb-8">
            <a
              v-for="r in releases"
              :key="r.platform"
              :href="r.url"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-4 rounded-2xl border border-white/8 bg-surface/60 px-5 py-4 transition-colors hover:border-accent/30 hover:bg-accent/5 group"
            >
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] group-hover:border-accent/20 transition-colors">
                <svg class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="r.icon" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-semibold text-white/90">{{ r.platform }} <span class="text-white/35 font-normal">{{ r.ext }}</span></p>
                <p class="text-[11px] text-white/35 mt-0.5">{{ r.note }}</p>
              </div>
              <svg class="h-4 w-4 text-white/20 group-hover:text-accent/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          </div>

          <p class="text-center text-[11px] text-white/25 leading-relaxed">
            All downloads are via
            <a href="https://github.com/surelle-ha/vindicta/releases" target="_blank" rel="noopener" class="text-accent/50 hover:text-accent transition-colors underline underline-offset-2">GitHub Releases</a>.
            Verify checksums before installing.
          </p>

          <div class="mt-8 text-center">
            <NuxtLink to="/" class="text-[12px] text-white/30 hover:text-white/60 transition-colors">
              ← Back to home
            </NuxtLink>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
