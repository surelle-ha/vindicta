<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const model = defineModel<boolean>({ default: false })

withDefaults(defineProps<{
  disabled?: boolean
  size?: 'sm' | 'md'
}>(), {
  disabled: false,
  size: 'md',
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="disabled"
    @click="model = !model"
  >
    <span
      class="grid place-items-center shrink-0 rounded-md border transition-all"
      :class="[
        size === 'sm' ? 'size-4' : 'size-5',
        model
          ? 'border-indigo-400 bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]'
          : 'border-white/15 bg-white/[0.04] text-transparent hover:border-indigo-400/50 hover:bg-indigo-500/10',
      ]"
    >
      <Check :class="size === 'sm' ? 'size-3' : 'size-3.5'" stroke-width="3" />
    </span>
    <slot />
  </button>
</template>
