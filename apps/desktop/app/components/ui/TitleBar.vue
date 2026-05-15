<script setup lang="ts">
const { close, minimize, toggleMaximize } = useTauriWindow()
const aiActivity = useAIActivityStore()

const version = ref('')
onMounted(async () => {
  try {
    const { getVersion } = await import('@tauri-apps/api/app')
    version.value = await getVersion()
  }
  catch { /* browser dev mode */ }
})
</script>

<template>
  <div
    data-tauri-drag-region
    class="titlebar relative z-50 flex h-8 shrink-0 select-none items-center overflow-hidden border-b border-[var(--border)] px-3"
    :class="aiActivity.hasActiveHandover ? 'titlebar--ai-active' : ''"
  >
    <Dither
      v-if="aiActivity.hasActiveHandover"
      class="pointer-events-none z-0 opacity-70"
      :wave-speed="0.035"
      :wave-frequency="3.5"
      :wave-amplitude="0.26"
      :wave-color="[0.24, 0.48, 0.86]"
      :color-num="4"
      :pixel-size="2"
      :disable-animation="false"
      :enable-mouse-interaction="false"
      :mouse-radius="0.75"
    />
    <div
      v-if="aiActivity.hasActiveHandover"
      class="pointer-events-none absolute inset-0 z-[1] bg-black/45"
    />

    <div class="controls relative z-10 flex items-center gap-1.5">
      <button
        class="group flex size-3.5 items-center justify-center rounded-[2px] border border-red-400/30 bg-red-500/70 transition-[filter] hover:brightness-125"
        title="Close"
        @click.stop="close()"
      >
        <span class="text-[7px] font-black leading-none text-red-950 opacity-0 group-hover:opacity-100">x</span>
      </button>
      <button
        class="group flex size-3.5 items-center justify-center rounded-[2px] border border-amber-300/30 bg-amber-400/75 transition-[filter] hover:brightness-125"
        title="Minimize"
        @click.stop="minimize()"
      >
        <span class="text-[8px] font-black leading-none text-amber-950 opacity-0 group-hover:opacity-100">-</span>
      </button>
      <button
        class="group flex size-3.5 items-center justify-center rounded-[2px] border border-cyan-300/30 bg-cyan-400/70 transition-[filter] hover:brightness-125"
        title="Maximize"
        @click.stop="toggleMaximize()"
      >
        <span class="text-[7px] font-black leading-none text-cyan-950 opacity-0 group-hover:opacity-100">+</span>
      </button>
    </div>

    <span
      data-tauri-drag-region
      class="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]"
    >
      {{ aiActivity.hasActiveHandover ? 'Vindicta - AI Working' : 'Vindicta' }}
    </span>

    <span v-if="version" class="pointer-events-none relative z-10 ml-auto font-mono text-[10px] text-[var(--text-muted)] opacity-50">
      v{{ version }}
    </span>
  </div>
</template>

<style scoped>
.titlebar {
  -webkit-app-region: drag;
  app-region: drag;
}

.titlebar--ai-active {
  border-color: rgba(99, 102, 241, 0.3);
}

.controls,
.controls button {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
</style>
