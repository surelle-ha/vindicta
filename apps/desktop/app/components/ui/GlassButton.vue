<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  fullWidth?: boolean
}>()

defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/50',
      size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-5 py-2.5 text-sm',
      fullWidth && 'w-full',
      variant === 'primary' || !variant
        ? 'bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
        : variant === 'danger'
          ? 'bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300'
          : 'glass glass-hover text-white/80 hover:text-white',
      (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    <slot />
  </button>
</template>
