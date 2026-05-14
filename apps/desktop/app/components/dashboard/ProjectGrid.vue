<script setup lang="ts">
import type { ProjectMeta } from '~/types/vindicta'

defineProps<{
  projects: ProjectMeta[]
}>()

defineEmits<{
  open: [id: string]
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <ProjectCard
      v-for="project in projects"
      :key="project.id"
      :project="project"
      @open="$emit('open', $event)"
    />
  </div>
</template>
