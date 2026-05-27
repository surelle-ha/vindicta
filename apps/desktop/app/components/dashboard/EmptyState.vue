<script setup lang="ts">
defineEmits<{
  addProject: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-24 px-6 text-center">
    <!-- Illustration -->
    <div class="relative mb-8">
      <div class="size-28 rounded-3xl glass flex items-center justify-center glow-purple">
        <svg class="size-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      </div>
      <!-- Floating dots -->
      <div class="absolute -top-2 -right-2 size-4 rounded-full bg-indigo-500/40 blur-sm animate-ping" />
      <div class="absolute -bottom-1 -left-3 size-3 rounded-full bg-violet-500/40 blur-sm animate-pulse" />
    </div>

    <h2 class="text-xl font-bold text-white mb-2">No projects yet</h2>
    <p class="text-sm text-white/50 max-w-xs mb-8 leading-relaxed">
      Add your first project to start scanning vulnerabilities, tracking findings, and exporting security reports.
    </p>

    <GlassButton size="lg" @click="$emit('addProject')">
      <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Add your first project
    </GlassButton>
  </div>
</template>
