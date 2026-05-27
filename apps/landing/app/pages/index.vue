<script setup lang="ts">
useHead({
  title: 'Vindicta — Local-First Security Workspace',
  htmlAttrs: { style: 'scroll-padding-top: 72px' },
})

// ── GitHub release ─────────────────────────────────────────────────────────────
const downloadUrl = ref('https://github.com/surelle-ha/vindicta/releases/latest')
const releaseTag  = ref<string | null>(null)

onMounted(async () => {
  try {
    const res  = await fetch('https://api.github.com/repos/surelle-ha/vindicta/releases/latest')
    const data = await res.json()
    releaseTag.value = data.tag_name ?? null
    const exe = (data.assets as Array<{ name: string; browser_download_url: string }> | undefined)
      ?.find(a => /x64-setup\.exe$/i.test(a.name) || /\.exe$/i.test(a.name))
    if (exe) downloadUrl.value = exe.browser_download_url
  } catch { /* fallback stays */ }
})

// ── Scroll-reveal ─────────────────────────────────────────────────────────────
const revealed = ref<Set<string>>(new Set())

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.target instanceof HTMLElement && e.target.dataset.reveal) {
          revealed.value = new Set([...revealed.value, e.target.dataset.reveal])
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  )
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
  onUnmounted(() => observer.disconnect())
})

function isRevealed(id: string) {
  return revealed.value.has(id)
}

// ── Features ──────────────────────────────────────────────────────────────────
const features = [
  {
    title: 'Local Project Registry',
    badge: 'Offline',
    badgeColor: 'ok',
    desc: 'Register real codebases and keep full security context tied to the files that live on your machine.',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  },
  {
    title: 'AI Security Scanning',
    badge: 'Claude',
    badgeColor: 'accent',
    desc: 'Run read-only AI reviews for concrete vulnerabilities, abuse paths, evidence, and remediation guidance in seconds.',
    icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  },
  {
    title: 'Findings Tracker',
    badge: 'Triaged',
    badgeColor: 'warn',
    desc: 'Convert scan results into tracked security items with severity, status, evidence, and remediation guidance.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Dependency Inventory',
    badge: 'Multi-lang',
    badgeColor: 'accent',
    desc: 'Inspect package manifests across Node, Rust, .NET, Python, Go, Java, PHP, and Ruby ecosystems.',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  },
  {
    title: 'Secret Detection',
    badge: 'Local',
    badgeColor: 'ok',
    desc: 'Scan text files with conservative local patterns for exposed tokens, keys, passwords, and private key material.',
    icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  },
  {
    title: 'Portable Security Record',
    badge: 'No account',
    badgeColor: 'ok',
    desc: 'Store scans, findings, and history in a local vindicta.json file. Offline-first, readable, no account required.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'No Subscription',
    badge: 'Free',
    badgeColor: 'ok',
    desc: 'Free to download, free to use forever. No accounts, no telemetry, no data ever leaves your machine.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
]

// ── Scan types ────────────────────────────────────────────────────────────────
const scanTypes = [
  {
    name: 'Quick Scan',
    subtitle: 'Surface-level · Fast results',
    badge: 'Default',
    badgeColor: '#23a55a',
    badgeBg: 'rgba(35,165,90,0.15)',
    desc: 'Rapid triage of obvious vulnerabilities. Great for routine checks after commits or dependency updates.',
    stats: [
      { label: 'Speed',         value: 'Very Fast',   color: '#23a55a' },
      { label: 'Finding limit', value: '~20 items',   color: 'rgba(255,255,255,0.6)' },
      { label: 'Depth',         value: 'Surface',     color: 'rgba(255,255,255,0.6)' },
      { label: 'Best for',      value: 'Daily checks',color: 'rgba(255,255,255,0.6)' },
    ],
  },
  {
    name: 'Deep Scan',
    subtitle: 'Full analysis · Evidence-rich',
    badge: 'Thorough',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139,92,246,0.15)',
    desc: 'Exhaustive review with full call-chain traces, abuse paths, and remediation code. Best for pre-release audits.',
    stats: [
      { label: 'Speed',         value: 'Slow–Med',    color: '#f0b232' },
      { label: 'Finding limit', value: 'Unlimited',   color: 'rgba(255,255,255,0.6)' },
      { label: 'Depth',         value: 'Full trace',  color: '#8b5cf6' },
      { label: 'Best for',      value: 'Pre-release', color: 'rgba(255,255,255,0.6)' },
    ],
  },
]

const badgeClass: Record<string, string> = {
  accent: 'bg-accent/15 text-accent',
  ok:     'bg-ok/15 text-ok',
  warn:   'bg-warn/15 text-warn',
}
</script>

<template>
  <div class="flex flex-col min-h-screen overflow-x-hidden">

    <!-- ── Nav ──────────────────────────────────────────────────────────────── -->
    <nav class="nav-glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 w-full">
      <div class="flex items-center gap-3">
        <img src="/icon.png" alt="Vindicta" class="h-7 w-7" />
        <span class="text-[15px] font-bold tracking-widest uppercase select-none">Vindicta</span>
        <span class="hidden sm:inline rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">Security</span>
      </div>
      <div class="flex items-center gap-6 text-[13px] text-white/50">
        <a href="#features" class="hidden sm:inline hover:text-white transition-colors">Features</a>
        <a href="#scans"    class="hidden sm:inline hover:text-white transition-colors">Scans</a>
        <a href="#download" class="hidden sm:inline hover:text-white transition-colors">Download</a>
        <a href="https://github.com/surelle-ha/vindicta" target="_blank" rel="noopener"
          class="hover:text-white transition-colors">GitHub</a>
        <a :href="downloadUrl" target="_blank" rel="noopener"
          class="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-accent/90 active:scale-[0.98]">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      </div>
    </nav>

    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <section class="relative flex flex-col items-center justify-center min-h-[92vh] overflow-hidden">

      <!-- Dither background -->
      <div class="absolute inset-0">
        <ClientOnly>
          <Dither
            :wave-speed="0.04"
            :wave-frequency="2.5"
            :wave-amplitude="0.28"
            :wave-color="[0.44, 0.36, 0.58]"
            :color-num="5"
            :pixel-size="2"
            :enable-mouse-interaction="false"
            :mouse-radius="0.9"
          />
        </ClientOnly>
      </div>

      <!-- Bottom gradient fade -->
      <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-base to-transparent pointer-events-none z-10" />

      <!-- Content -->
      <div class="relative z-20 flex flex-col items-center text-center px-6 select-none">

        <!-- Icon + badge -->
        <div class="animate-fade-in mb-8 flex flex-col items-center gap-5" style="animation-delay:0.1s">
          <div class="animate-float relative">
            <img
              src="/icon.png"
              alt="Vindicta"
              class="h-20 w-20 icon-glow"
            />
          </div>
          <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white/50 backdrop-blur-sm">
            <span class="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
            Local-first · Offline · Free · Open Source
          </div>
        </div>

        <!-- Title -->
        <h1
          class="animate-fade-up font-display text-[72px] sm:text-[96px] lg:text-[120px] font-black uppercase leading-none tracking-[0.08em]"
          style="animation-delay:0.2s; text-shadow: 0 0 120px rgba(139,92,246,0.5), 0 4px 40px rgba(0,0,0,0.8)"
        >
          VINDICTA
        </h1>
        <p
          class="animate-fade-up text-[13px] sm:text-[16px] font-semibold uppercase tracking-[0.5em] text-white/40 mt-1"
          style="animation-delay:0.35s"
        >
          Security Workspace
        </p>

        <!-- Tagline -->
        <p
          class="animate-fade-up mt-7 max-w-lg text-[15px] sm:text-[17px] leading-relaxed text-white/60"
          style="animation-delay:0.45s"
        >
          Local-first AI security for codebases. Scan, find, fix —<br class="hidden sm:inline" />
          all on your machine. No cloud, no account.
        </p>

        <!-- CTA buttons -->
        <div
          class="animate-fade-up mt-10 flex flex-col sm:flex-row items-center gap-4"
          style="animation-delay:0.55s"
        >
          <a
            id="download"
            :href="downloadUrl"
            target="_blank" rel="noopener"
            class="group flex items-center gap-2.5 rounded-2xl bg-accent px-8 py-3.5 text-[14px] font-bold text-white shadow-lg transition-all hover:bg-accent/90 hover:scale-[1.03] hover:shadow-accent/40 hover:shadow-2xl active:scale-[0.98]"
          >
            <svg class="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download for Windows<span v-if="releaseTag" class="ml-1 opacity-60 font-normal text-[12px]">{{ releaseTag }}</span>
          </a>
          <a
            href="https://github.com/surelle-ha/vindicta"
            target="_blank" rel="noopener"
            class="flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-3.5 text-[14px] font-medium text-white/60 transition-all hover:border-white/30 hover:text-white hover:bg-white/5"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        <p class="animate-fade-up mt-5 text-[11px] text-white/25" style="animation-delay:0.65s">
          Windows 10/11 · Free · No account required ·
          <a href="https://github.com/surelle-ha/vindicta" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-white/50 transition-colors">build from source</a>
        </p>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-30">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>

    <!-- ── Marquee strip ─────────────────────────────────────────────────────── -->
    <div class="relative overflow-hidden border-y border-white/5 bg-surface/60 py-3">
      <div class="marquee-track flex gap-12 text-[11px] font-semibold uppercase tracking-widest text-white/25">
        <template v-for="_ in 4" :key="_">
          <span>AI Security Scanning</span><span class="text-accent/40">·</span>
          <span>Findings Tracker</span><span class="text-accent/40">·</span>
          <span>Dependency Inventory</span><span class="text-accent/40">·</span>
          <span>Secret Detection</span><span class="text-accent/40">·</span>
          <span>Portable Scan Records</span><span class="text-accent/40">·</span>
          <span>100% Offline</span><span class="text-accent/40">·</span>
          <span>Free Forever</span><span class="text-accent/40">·</span>
        </template>
      </div>
    </div>

    <!-- ── Features ─────────────────────────────────────────────────────────── -->
    <section id="features" class="px-6 py-24 max-w-6xl mx-auto w-full">
      <div
        data-reveal="feat-header"
        :class="['transition-all duration-700', isRevealed('feat-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
        class="text-center mb-16"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/70 mb-3">Everything you need</p>
        <h2 class="text-[36px] sm:text-[44px] font-display font-black uppercase leading-tight">
          Built for security review.<br/>
          <span class="text-white/30">Runs without the cloud.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(f, i) in features"
          :key="f.title"
          :data-reveal="`feat-${i}`"
          :class="['transition-all duration-700', isRevealed(`feat-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
          :style="{ transitionDelay: `${i * 60}ms` }"
          class="group relative rounded-2xl border border-white/5 bg-surface/60 p-6 hover:border-accent/30 hover:bg-surface transition-all duration-300 hover:-translate-y-1 cursor-default"
        >
          <!-- Top row: icon + badge -->
          <div class="mb-4 flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <svg class="h-[1.125rem] w-[1.125rem] text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon" />
              </svg>
            </div>
            <span class="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" :class="badgeClass[f.badgeColor]">
              {{ f.badge }}
            </span>
          </div>
          <h3 class="text-[13px] font-semibold text-white leading-snug">{{ f.title }}</h3>
          <p class="mt-2 text-[11px] leading-relaxed text-white/40">{{ f.desc }}</p>

          <!-- Accent line on hover -->
          <div class="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </section>

    <!-- ── Scan types ────────────────────────────────────────────────────────── -->
    <section id="scans" class="px-6 py-20 border-t border-white/5">
      <div class="max-w-4xl mx-auto">
        <div
          data-reveal="scans-header"
          :class="['transition-all duration-700 text-center mb-12', isRevealed('scans-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/70 mb-3">Two scan depths, one workspace</p>
          <h2 class="text-[36px] font-display font-black uppercase leading-tight">Choose your depth</h2>
          <p class="mt-3 text-[14px] text-white/40">Switch between scan modes anytime from the scan panel.</p>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            v-for="(s, i) in scanTypes"
            :key="s.name"
            :data-reveal="`scan-${i}`"
            :class="['transition-all duration-700', isRevealed(`scan-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
            :style="{ transitionDelay: `${i * 120}ms` }"
            class="relative rounded-2xl border border-white/5 bg-surface p-6 overflow-hidden hover:border-white/10 transition-colors"
          >
            <!-- Glow blob -->
            <div
              class="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-10 blur-3xl pointer-events-none"
              :style="{ backgroundColor: s.badgeColor }"
            />

            <div class="relative z-10">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p class="text-[16px] font-bold text-white">{{ s.name }}</p>
                  <p class="text-[11px] text-white/40">{{ s.subtitle }}</p>
                </div>
                <span
                  class="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                  :style="{ color: s.badgeColor, backgroundColor: s.badgeBg }"
                >
                  {{ s.badge }}
                </span>
              </div>

              <p class="mb-5 text-[12px] leading-relaxed text-white/50">{{ s.desc }}</p>

              <div class="space-y-2">
                <div v-for="stat in s.stats" :key="stat.label" class="flex items-center justify-between text-[11px]">
                  <span class="text-white/35">{{ stat.label }}</span>
                  <span class="font-semibold" :style="{ color: stat.color }">{{ stat.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── How it works ──────────────────────────────────────────────────────── -->
    <section class="px-6 py-24 border-t border-white/5">
      <div class="max-w-3xl mx-auto text-center">
        <div
          data-reveal="how-header"
          :class="['transition-all duration-700 mb-14', isRevealed('how-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6']"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/70 mb-3">Simple setup</p>
          <h2 class="text-[36px] font-display font-black uppercase leading-tight">Up in three steps</h2>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div
            v-for="(step, i) in [
              { n: '01', title: 'Add a Project', desc: 'Register a local codebase directory. Vindicta attaches scan state directly to the source.' },
              { n: '02', title: 'Run the Scan', desc: 'Pick a scan depth and let the AI review security-sensitive paths for vulnerabilities and risks.' },
              { n: '03', title: 'Track & Fix', desc: 'Open full evidence, create findings, assign sprint tasks, and move issues to closure.' },
            ]"
            :key="step.n"
            :data-reveal="`step-${i}`"
            :class="['transition-all duration-700', isRevealed(`step-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
            :style="{ transitionDelay: `${i * 100}ms` }"
            class="flex flex-col items-center gap-3"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
              <span class="font-mono text-[13px] font-bold text-accent">{{ step.n }}</span>
            </div>
            <p class="text-[14px] font-semibold text-white">{{ step.title }}</p>
            <p class="text-[12px] leading-relaxed text-white/40 max-w-[200px]">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden border-t border-white/5 px-6 py-24">

      <!-- Dither accent background -->
      <div class="absolute inset-0 opacity-40">
        <ClientOnly>
          <Dither
            :wave-speed="0.02"
            :wave-frequency="2"
            :wave-amplitude="0.2"
            :wave-color="[0.42, 0.34, 0.56]"
            :color-num="4"
            :pixel-size="3"
            :enable-mouse-interaction="false"
          />
        </ClientOnly>
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-base via-transparent to-base pointer-events-none" />

      <div
        data-reveal="cta"
        :class="['relative z-10 flex flex-col items-center gap-6 text-center transition-all duration-700', isRevealed('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
      >
        <img src="/icon.png" alt="Vindicta" class="h-14 w-14 icon-glow" />
        <h2 class="text-[40px] sm:text-[52px] font-display font-black uppercase tracking-wider leading-tight">
          Start securing.<br/>
          <span class="text-white/30">Without the cloud.</span>
        </h2>
        <p class="max-w-md text-[14px] text-white/40 leading-relaxed">
          Download Vindicta, open a project, and run your first scan — offline, no account, forever free.
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <a
            :href="downloadUrl"
            target="_blank" rel="noopener"
            class="group flex items-center gap-2.5 rounded-2xl bg-accent px-10 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:bg-accent/90 hover:scale-[1.03] hover:shadow-accent/40 hover:shadow-2xl active:scale-[0.98]"
          >
            <svg class="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Vindicta<span v-if="releaseTag" class="ml-1 opacity-60 font-normal text-[13px]">{{ releaseTag }}</span>
          </a>
          <a
            href="https://github.com/surelle-ha/vindicta"
            target="_blank" rel="noopener"
            class="flex items-center gap-2 text-[13px] text-white/40 hover:text-white transition-colors"
          >
            View source on GitHub →
          </a>
        </div>
        <p class="text-[11px] text-white/20">
          Windows 10/11 · No account · No telemetry · Open source —
          <a href="https://github.com/surelle-ha/vindicta" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-white/40 transition-colors">build from source</a>
        </p>
      </div>
    </section>

    <!-- ── Footer ────────────────────────────────────────────────────────────── -->
    <footer class="border-t border-white/5 bg-base px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/25">
      <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <div class="flex items-center gap-3">
          <img src="/icon.png" alt="Vindicta" class="h-5 w-5 opacity-60" />
          <span>© {{ new Date().getFullYear() }} Surelle-ha. All rights reserved.</span>
        </div>
        <span class="text-white/15">·</span>
        <span class="text-white/20">Built for local-first security review.</span>
      </div>
      <div class="flex items-center gap-5">
        <a href="https://github.com/surelle-ha/vindicta" target="_blank" rel="noopener" class="hover:text-white/60 transition-colors">GitHub</a>
        <a href="https://github.com/surelle-ha/vindicta/releases" target="_blank" rel="noopener" class="hover:text-white/60 transition-colors">Releases</a>
        <a href="https://github.com/surelle-ha/vindicta/issues" target="_blank" rel="noopener" class="hover:text-white/60 transition-colors">Issues</a>
      </div>
    </footer>

  </div>
</template>
