<script setup lang="ts">
defineProps<{
  placeholder?: string
  label?: string
  disabled?: boolean
  readonly?: boolean
  type?: string
}>()

const model = defineModel<string>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-xs font-medium text-white/60 uppercase tracking-wider">
      {{ label }}
    </label>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="w-full px-4 py-2.5 glass-sm text-white placeholder:text-white/30 text-sm outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all duration-200"
      :class="[
        (disabled || readonly) && 'opacity-50 cursor-not-allowed',
      ]"
    >
  </div>
</template>
