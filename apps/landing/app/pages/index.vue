<template>
  <div class="min-h-screen bg-[#0d0d0f] text-white">
    <!-- Nav -->
    <nav class="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <div class="flex items-center gap-2">
        <div class="size-7 rounded bg-indigo-600 flex items-center justify-center">
          <svg class="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span class="text-sm font-bold tracking-tight">Vindicta</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#features" class="text-sm text-white/50 hover:text-white transition-colors">Features</a>
        <a href="#pricing" class="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
        <a href="https://github.com/surelle-ha/vindicta" class="text-sm px-3 py-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] transition-colors">GitHub</a>
      </div>
    </nav>

    <!-- Hero -->
    <section class="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 mb-8">
        <span class="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Now in beta — free while we build
      </div>
      <h1 class="text-5xl font-bold tracking-tight leading-tight mb-6">
        Project management for<br>
        <span class="text-indigo-400">vibe coders</span>
      </h1>
      <p class="text-lg text-white/50 max-w-xl mx-auto mb-10">
        Kanban, sprint planning, and backlog management that lives on your machine.
        No account required. No subscription for solo use.
      </p>
      <div class="flex items-center justify-center gap-3">
        <a href="#download" class="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors">
          Download for Windows
        </a>
        <a href="#features" class="px-5 py-2.5 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] text-sm transition-colors">
          See how it works →
        </a>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="max-w-6xl mx-auto px-6 py-20">
      <h2 class="text-2xl font-bold text-center mb-12">Everything you need, nothing you don't</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="f in features" :key="f.title" class="p-5 rounded-lg border border-white/[0.07] bg-white/[0.03]">
          <div class="size-8 rounded-md bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center mb-4">
            <span class="text-indigo-400 text-base">{{ f.icon }}</span>
          </div>
          <h3 class="text-sm font-semibold mb-1.5">{{ f.title }}</h3>
          <p class="text-xs text-white/40 leading-relaxed">{{ f.description }}</p>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="max-w-4xl mx-auto px-6 py-20 text-center">
      <h2 class="text-2xl font-bold mb-4">Simple pricing</h2>
      <p class="text-white/40 text-sm mb-12">Offline mode is free forever. Online collaboration is coming.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div class="p-6 rounded-lg border border-white/[0.07] bg-white/[0.03] text-left">
          <p class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Solo</p>
          <p class="text-3xl font-bold mb-1">Free</p>
          <p class="text-xs text-white/40 mb-6">Forever</p>
          <ul class="space-y-2 text-sm text-white/60">
            <li>✓ Unlimited local projects</li>
            <li>✓ Kanban + sprint boards</li>
            <li>✓ Configurable roles & columns</li>
            <li>✓ vindicta.json format</li>
          </ul>
        </div>
        <div class="p-6 rounded-lg border border-indigo-500/30 bg-indigo-500/5 text-left relative">
          <div class="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Coming soon</div>
          <p class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Team</p>
          <p class="text-3xl font-bold mb-1">$8<span class="text-base font-normal text-white/40">/mo</span></p>
          <p class="text-xs text-white/40 mb-6">per user</p>
          <ul class="space-y-2 text-sm text-white/60">
            <li>✓ Everything in Solo</li>
            <li>✓ Real-time sync</li>
            <li>✓ Multi-user collaboration</li>
            <li>✓ Hosted on our infra</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/[0.07] px-6 py-8 text-center text-xs text-white/20">
      © 2026 Vindicta · Built by surelle-ha
    </footer>
  </div>
</template>

<script setup lang="ts">
const features = [
  { icon: '⬜', title: 'Offline-first', description: 'All data lives in a vindicta.json file in your project directory. Works without internet.' },
  { icon: '📋', title: 'Configurable Kanban', description: 'Add, rename, and reorder columns to match your workflow. No hardcoded stages.' },
  { icon: '🏃', title: 'Vibe Sprints', description: 'Plan sprints, assign tickets, track progress — without the overhead of Jira.' },
  { icon: '🎭', title: 'Custom roles', description: 'Define Developer, QA, Tech Lead or any role you need. Assign them to tickets.' },
  { icon: '🔄', title: 'Team sync (soon)', description: 'When you\'re ready to collaborate, flip to online mode and share with your team.' },
  { icon: '🤖', title: 'AI-native', description: 'Designed to work alongside Claude Code, Cursor, and other AI coding tools.' },
]
</script>
