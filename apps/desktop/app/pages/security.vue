<script setup lang="ts">
const projects = useProjectsStore()

onMounted(async () => {
  if (!projects.projects.length) {
    await projects.loadProjects()
  }

  if (projects.activeProject) {
    await navigateTo(`/projects/${projects.activeProject.id}?tab=scanner`, { replace: true })
    return
  }

  await navigateTo('/', { replace: true })
})
</script>

<template>
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <p class="text-sm text-[var(--text-muted)]">Opening security workspace...</p>
    </div>
  </div>
</template>
