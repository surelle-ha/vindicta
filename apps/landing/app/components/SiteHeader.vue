<template>
  <nav class="nav-glass fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between px-5 py-4 sm:px-8">
    <NuxtLink to="/" class="flex items-center gap-3">
      <img src="/icon.png" alt="Vindicta" class="h-7 w-7" />
      <span class="text-[15px] font-bold uppercase tracking-widest select-none">Vindicta</span>
      <span class="hidden rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent sm:inline">Security</span>
    </NuxtLink>

    <div class="flex items-center gap-4 text-[13px] text-white/50 sm:gap-6">
      <NuxtLink to="/#features" class="hidden transition-colors hover:text-white sm:inline">Features</NuxtLink>
      <NuxtLink to="/#academy" class="hidden transition-colors hover:text-white sm:inline">Academy</NuxtLink>
      <NuxtLink to="/download" class="hidden transition-colors hover:text-white sm:inline">Download</NuxtLink>
      <NuxtLink to="/docs" class="hidden transition-colors hover:text-white md:inline">Docs</NuxtLink>
      <a
        href="https://github.com/surelle-ha/vindicta"
        target="_blank"
        rel="noopener"
        class="transition-colors hover:text-white"
      >
        GitHub
      </a>
      <NuxtLink
        to="/download"
        class="hidden items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-accent/90 active:scale-[0.98] sm:flex"
      >
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </NuxtLink>
    </div>
  </nav>
</template>
