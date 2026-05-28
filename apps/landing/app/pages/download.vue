<script setup lang="ts">
useLandingSeo({
  title: 'Download Vindicta for Windows',
  description: 'Download the latest Vindicta Windows installer and review system requirements, setup steps, release assets, and source build links.',
  path: '/download',
})

const downloadUrl = ref('https://github.com/surelle-ha/vindicta/releases/latest')
const releaseTag  = ref<string | null>(null)
const loading     = ref(true)

interface Asset {
  name: string
  browser_download_url: string
  size: number
}

const assets = ref<Asset[]>([])

onMounted(async () => {
  try {
    const res  = await fetch('https://api.github.com/repos/surelle-ha/vindicta/releases/latest')
    const data = await res.json()
    releaseTag.value = data.tag_name ?? null

    const all: Asset[] = data.assets ?? []
    assets.value = all

    const exe = all.find(a => /x64-setup\.exe$/i.test(a.name) || /\.exe$/i.test(a.name))
    if (exe) downloadUrl.value = exe.browser_download_url
  } catch { /* fallback stays */ }
  finally { loading.value = false }
})

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const steps = [
  {
    n: '01',
    title: 'Download the installer',
    desc: 'Click the button above to download the latest Windows installer (.exe) from GitHub Releases.',
  },
  {
    n: '02',
    title: 'Run the installer',
    desc: 'Double-click the downloaded .exe. Windows SmartScreen may prompt you — click "More info" then "Run anyway" since Vindicta is not yet code-signed.',
  },
  {
    n: '03',
    title: 'Launch Vindicta',
    desc: 'Open Vindicta from the Start menu or desktop shortcut. On first launch, complete the onboarding wizard to register your first project.',
  },
]

const requirements = [
  { label: 'OS',           value: 'Windows 10 or 11 (64-bit)' },
  { label: 'Architecture', value: 'x86-64 (x64)' },
  { label: 'RAM',          value: '4 GB minimum, 8 GB recommended' },
  { label: 'Storage',      value: '200 MB for the app + model files' },
  { label: 'Internet',     value: 'Required only for AI provider calls' },
]
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- Hero download area -->
    <section class="relative flex flex-col items-center justify-center pt-40 pb-24 px-6 overflow-hidden">
      <!-- Subtle radial glow -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(139,92,246,0.12),transparent_60%)] pointer-events-none" />

      <div class="relative z-10 flex flex-col items-center text-center">

        <!-- Icon -->
        <div class="mb-8 relative">
          <img src="/icon.png" alt="Vindicta" class="h-24 w-24 icon-glow" />
        </div>

        <!-- Title -->
        <h1 class="font-display text-[56px] sm:text-[72px] font-black uppercase leading-none tracking-[0.08em] mb-2"
          style="text-shadow: 0 0 80px rgba(139,92,246,0.4), 0 4px 32px rgba(0,0,0,0.8)">
          Download
        </h1>
        <p class="text-[13px] sm:text-[15px] font-semibold uppercase tracking-[0.4em] text-white/35 mb-8">
          Vindicta Security Workspace
        </p>

        <!-- Primary CTA -->
        <a
          :href="downloadUrl"
          target="_blank" rel="noopener"
          class="group flex items-center gap-3 rounded-2xl bg-accent px-10 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:bg-accent/90 hover:scale-[1.03] hover:shadow-accent/40 hover:shadow-2xl active:scale-[0.98] mb-4"
        >
          <svg class="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download for Windows
          <span v-if="releaseTag" class="opacity-55 font-normal text-[13px]">{{ releaseTag }}</span>
          <span v-else-if="loading" class="opacity-40 font-normal text-[13px]">fetching…</span>
        </a>

        <p class="text-[11px] text-white/25 mb-2">
          Windows 10/11 · x64 · Free · No account required
        </p>

        <!-- Other downloads / GitHub -->
        <div class="flex items-center gap-5 text-[12px] text-white/35 mt-2">
          <a
            href="https://github.com/surelle-ha/vindicta/releases"
            target="_blank" rel="noopener"
            class="hover:text-white/60 transition-colors underline underline-offset-2"
          >
            All releases &amp; changelogs
          </a>
          <span class="text-white/15">·</span>
          <a
            href="https://github.com/surelle-ha/vindicta"
            target="_blank" rel="noopener"
            class="hover:text-white/60 transition-colors underline underline-offset-2"
          >
            Build from source
          </a>
        </div>

        <!-- Release assets table (when available) -->
        <div v-if="assets.length" class="mt-10 w-full max-w-lg">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-3">Release assets</p>
          <div class="rounded-xl border border-white/5 overflow-hidden">
            <div
              v-for="asset in assets"
              :key="asset.name"
              class="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <a
                :href="asset.browser_download_url"
                class="text-[12px] text-white/60 hover:text-white transition-colors font-mono truncate max-w-[280px]"
                :title="asset.name"
              >
                {{ asset.name }}
              </a>
              <span class="text-[11px] text-white/25 ml-3 shrink-0">{{ formatBytes(asset.size) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Installation steps -->
    <section class="border-t border-white/5 px-6 py-20">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/70 mb-3">Quick start</p>
          <h2 class="text-[32px] font-display font-black uppercase">Up in three steps</h2>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div
            v-for="step in steps"
            :key="step.n"
            class="flex flex-col items-center gap-3 text-center"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
              <span class="font-mono text-[13px] font-bold text-accent">{{ step.n }}</span>
            </div>
            <p class="text-[14px] font-semibold text-white">{{ step.title }}</p>
            <p class="text-[12px] leading-relaxed text-white/40 max-w-[220px]">{{ step.desc }}</p>
          </div>
        </div>

        <!-- SmartScreen note -->
        <div class="mt-10 rounded-xl border border-warn/20 bg-warn/5 p-4 flex items-start gap-3">
          <svg class="h-4 w-4 text-warn mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="text-[12px] font-semibold text-warn mb-0.5">Windows SmartScreen warning</p>
            <p class="text-[11px] leading-relaxed text-white/40">
              Vindicta is not yet code-signed. Windows may show a SmartScreen prompt. Click <strong class="text-white/60">"More info"</strong> then <strong class="text-white/60">"Run anyway"</strong> to proceed. You can verify the binary against the checksums on the GitHub Releases page.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- System requirements -->
    <section class="border-t border-white/5 px-6 py-20">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-10">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent/70 mb-3">Compatibility</p>
          <h2 class="text-[32px] font-display font-black uppercase">System requirements</h2>
        </div>

        <div class="rounded-2xl border border-white/5 bg-surface/60 overflow-hidden">
          <div
            v-for="(req, i) in requirements"
            :key="req.label"
            class="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0"
            :class="i % 2 === 0 ? 'bg-white/[0.01]' : ''"
          >
            <span class="text-[12px] font-semibold uppercase tracking-wider text-white/30">{{ req.label }}</span>
            <span class="text-[13px] text-white/65">{{ req.value }}</span>
          </div>
        </div>

        <!-- Build from source -->
        <div class="mt-8 rounded-2xl border border-white/5 bg-surface/40 p-6">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/8">
              <svg class="h-5 w-5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-bold text-white mb-1">Build from source</p>
              <p class="text-[12px] leading-relaxed text-white/45 mb-3">
                Prefer to compile yourself? Clone the repository and follow the build instructions in the README. Requires Node.js, Rust, and the Tauri CLI.
              </p>
              <a
                href="https://github.com/surelle-ha/vindicta"
                target="_blank" rel="noopener"
                class="inline-flex items-center gap-1.5 text-[12px] text-accent hover:text-accent/80 transition-colors"
              >
                View source on GitHub
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

