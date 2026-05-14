<script setup lang="ts">
const props = defineProps<{
  modelValue: 'kanban' | 'sprint' | 'history'
}>()

const emit = defineEmits<{
  'update:modelValue': ['kanban' | 'sprint' | 'history']
}>()

const tabs = [
  { id: 'kanban' as const, label: 'Kanban' },
  { id: 'sprint' as const, label: 'Vibe Sprint' },
  { id: 'history' as const, label: 'History' },
]
</script>

<template>
  <div class="flex items-center gap-1 glass-sm p-1 rounded-xl w-fit mb-6">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
      :class="[
        modelValue === tab.id
          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/30'
          : 'text-white/40 hover:text-white/70',
      ]"
      @click="emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
