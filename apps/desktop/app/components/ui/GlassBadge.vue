<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      variant === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
      variant === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
      variant === 'danger' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
      variant === 'info' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
      variant === 'purple' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
      'bg-white/10 text-white/70 border border-white/20',
    ]"
  >
    <slot />
  </span>
</template>
