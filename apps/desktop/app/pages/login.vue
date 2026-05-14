<script setup lang="ts">
import { Github, Chrome, ArrowLeft, LockKeyhole } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="max-w-md mx-auto py-10 px-6 space-y-5">
    <button
      class="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      @click="router.push('/profile')"
    >
      <ArrowLeft class="size-3.5" />
      Back to profile
    </button>

    <div>
      <h2 class="text-sm font-semibold text-[var(--text)] tracking-tight">Sign In</h2>
      <p class="text-xs text-[var(--text-muted)] mt-0.5">Account sync and hosted identity are in active development.</p>
    </div>

    <div class="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 flex items-start gap-3">
      <LockKeyhole class="size-4 text-amber-300 mt-0.5 shrink-0" />
      <p class="text-xs text-amber-100/75 leading-relaxed">
        Sign-in providers are visible for planning and testing the flow, but they are disabled until authentication is wired up.
      </p>
    </div>

    <div class="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4 space-y-3">
      <button
        disabled
        class="w-full flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white/[0.03] px-4 py-3 text-left opacity-60 cursor-not-allowed"
      >
        <Github class="size-4 text-[var(--text-muted)]" />
        <div>
          <p class="text-sm font-medium text-[var(--text)]">Continue with GitHub</p>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">Coming soon</p>
        </div>
      </button>

      <button
        disabled
        class="w-full flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white/[0.03] px-4 py-3 text-left opacity-60 cursor-not-allowed"
      >
        <Chrome class="size-4 text-[var(--text-muted)]" />
        <div>
          <p class="text-sm font-medium text-[var(--text)]">Continue with Google</p>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">Coming soon</p>
        </div>
      </button>
    </div>
  </div>
</template>
