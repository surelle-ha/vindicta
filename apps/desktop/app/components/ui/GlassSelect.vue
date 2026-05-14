<script setup lang="ts">
defineProps<{ modelValue?: string; class?: string }>()
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<template>
  <div class="relative" :class="$props.class">
    <select
      :value="modelValue"
      class="w-full appearance-none bg-[#1a1a1d] border border-white/[0.08] text-white/70 text-xs px-2 py-1.5 rounded pr-6 outline-none focus:border-indigo-500/50 cursor-pointer transition-colors"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <slot />
    </select>
    <svg
      class="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-white/30 pointer-events-none"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  </div>
</template>
