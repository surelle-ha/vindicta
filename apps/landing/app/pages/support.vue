<script setup lang="ts">
useLandingSeo({
  title: 'Developer Support — Vindicta',
  description: 'Get help with Vindicta through email support and the documentation portal.',
  path: '/support',
})
</script>

<template>
  <div class="flex flex-1 flex-col">
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
          The developer support portal is currently being set up. In the meantime, reach out directly by email.
        </p>

        <!-- Interim options -->
        <div class="w-full space-y-3 mb-10">
          <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4">In the meantime, you can</p>

          <a
            href="mailto:support@vindicta.surelle.xyz"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-accent/30 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
              <svg class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">Email Support</p>
              <p class="text-[11px] text-white/40">support@vindicta.surelle.xyz</p>
            </div>
            <svg class="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>

          <NuxtLink
            to="/docs"
            class="flex items-center gap-4 rounded-xl border border-white/8 bg-surface/60 px-5 py-4 text-left transition-all hover:border-white/15 hover:bg-surface group"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <svg class="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-white">Documentation</p>
              <p class="text-[11px] text-white/40">Setup guides, configuration, and usage</p>
            </div>
            <svg class="ml-auto h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </NuxtLink>
        </div>

        <NuxtLink to="/" class="text-[12px] text-white/30 hover:text-white/60 transition-colors">
          ← Back to home
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
