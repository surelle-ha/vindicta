<script setup lang="ts">
useLandingSeo({
  title: 'Vindicta Documentation',
  description: 'Read Vindicta setup, scanning, findings, dependency inventory, secret detection, Academy, configuration, and source build documentation.',
  path: '/docs',
})

const sections = [
  { title: 'Getting Started',       desc: 'Install, launch, and register your first project',          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { title: 'AI Scanning',           desc: 'Configure Claude, Codex, or OpenRouter for scans',          icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  { title: 'Findings & Triaging',   desc: 'Manage severity, status, evidence, and remediation',        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { title: 'Dependency Inventory',  desc: 'Scan Node, Rust, Python, Go, .NET, and more',               icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
  { title: 'Secret Detection',      desc: 'Local pattern checks for tokens, keys, and secrets',        icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { title: 'Vindicta Academy',      desc: 'Bootcamp structure, Professor AI, and TTS narration',       icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { title: 'Configuration',         desc: 'vindicta.json schema, settings, and local storage',         icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { title: 'Build from Source',     desc: 'Tauri + Nuxt setup, dev environment, and contributing',    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
]
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- Content -->
    <main class="flex-1 flex items-center justify-center px-6 py-24">
      <div class="flex flex-col items-center text-center max-w-lg">

        <!-- Icon -->
        <div class="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-warn/25 bg-warn/8">
          <svg class="h-10 w-10 text-warn" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>

        <!-- Badge -->
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-warn/20 bg-warn/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-warn/80">
          <span class="h-1.5 w-1.5 rounded-full bg-warn animate-pulse" />
          Under Maintenance
        </div>

        <!-- Title -->
        <h1 class="font-display text-[44px] sm:text-[56px] font-black uppercase leading-none tracking-wide mb-5">
          Documentation
        </h1>

        <p class="text-[14px] leading-relaxed text-white/45 mb-10 max-w-sm">
          The Vindicta documentation site is currently being written and structured. It will cover installation, configuration, scanning, the Academy, and the API surface.
        </p>

        <!-- Planned sections preview -->
        <div class="w-full mb-10">
          <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4">Planned sections</p>
          <div class="grid grid-cols-2 gap-2.5 text-left">
            <div
              v-for="section in sections"
              :key="section.title"
              class="rounded-xl border border-white/5 bg-surface/40 px-4 py-3 opacity-50"
            >
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-3.5 w-3.5 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="section.icon" />
                </svg>
                <span class="text-[11px] font-semibold text-white/60">{{ section.title }}</span>
              </div>
              <p class="text-[10px] text-white/30 leading-relaxed">{{ section.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Interim link -->
        <div class="w-full space-y-3 mb-10">
          <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4">Until then</p>

          <a
            href="https://github.com/surelle-ha/vindicta/wiki"
            target="_blank" rel="noopener"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-accent/30 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
              <svg class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">GitHub Wiki</p>
              <p class="text-[11px] text-white/40">Early guides and setup notes</p>
            </div>
            <svg class="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a
            href="https://github.com/surelle-ha/vindicta/blob/main/README.md"
            target="_blank" rel="noopener"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-white/15 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <svg class="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">README</p>
              <p class="text-[11px] text-white/40">Installation and quick-start instructions</p>
            </div>
            <svg class="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <a href="/" class="text-[12px] text-white/30 hover:text-white/60 transition-colors">
          ← Back to home
        </a>
      </div>
    </main>
  </div>
</template>


