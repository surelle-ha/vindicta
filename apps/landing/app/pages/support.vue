<script setup lang="ts">
useLandingSeo({
  title: 'Vindicta Developer Support',
  description: 'Get Vindicta support through GitHub issues, discussions, source code, and community help for the local-first security workspace.',
  path: '/support',
})
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- Content -->
    <main class="flex-1 flex items-center justify-center px-6 py-24">
      <div class="flex flex-col items-center text-center max-w-lg">

        <!-- Icon -->
        <div class="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-warn/25 bg-warn/8">
          <svg class="h-10 w-10 text-warn" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>

        <!-- Badge -->
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-warn/20 bg-warn/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-warn/80">
          <span class="h-1.5 w-1.5 rounded-full bg-warn animate-pulse" />
          Under Maintenance
        </div>

        <!-- Title -->
        <h1 class="font-display text-[44px] sm:text-[56px] font-black uppercase leading-none tracking-wide mb-5">
          Developer<br/>Support
        </h1>

        <p class="text-[14px] leading-relaxed text-white/45 mb-8 max-w-sm">
          The developer support portal is currently being set up. We are working on it and it will be available soon.
        </p>

        <!-- Interim options -->
        <div class="w-full space-y-3 mb-10">
          <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4">In the meantime, you can</p>

          <a
            href="https://github.com/surelle-ha/vindicta/issues"
            target="_blank" rel="noopener"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-accent/30 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
              <svg class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">Open a GitHub Issue</p>
              <p class="text-[11px] text-white/40">Report bugs, request features, or ask questions</p>
            </div>
            <svg class="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a
            href="https://github.com/surelle-ha/vindicta/discussions"
            target="_blank" rel="noopener"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-accent/30 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ok/10 border border-ok/20 group-hover:bg-ok/20 transition-colors">
              <svg class="h-4 w-4 text-ok" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">GitHub Discussions</p>
              <p class="text-[11px] text-white/40">Community questions, tips, and general help</p>
            </div>
            <svg class="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a
            href="https://github.com/surelle-ha/vindicta"
            target="_blank" rel="noopener"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-white/15 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <svg class="h-4 w-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">View Source on GitHub</p>
              <p class="text-[11px] text-white/40">Browse the codebase directly</p>
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

