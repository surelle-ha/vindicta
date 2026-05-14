<script setup lang="ts">
defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: boolean
  hoverable?: boolean
}>()
</script>

<template>
  <div
    class="glass"
    :class="[
      padding === 'none' ? '' : padding === 'sm' ? 'p-3' : padding === 'lg' ? 'p-8' : 'p-6',
      glow && 'glow-purple',
      hoverable && 'glass-hover cursor-pointer',
    ]"
  >
    <slot />
  </div>
</template>
