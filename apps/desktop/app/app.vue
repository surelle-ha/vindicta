<script setup lang="ts">
const app = useAppStore()
const user = useUserStore()
const projects = useProjectsStore()
const router = useRouter()

// Init persisted settings and apply theme before first render
await app.init()
await user.load()
await projects.loadProjects()

// Apply theme to <html> element
useHead({
  htmlAttrs: {
    'data-theme': computed(() => app.theme),
  },
})

// Disable native right-click context menu
onMounted(() => {
  document.addEventListener('contextmenu', (e) => e.preventDefault())
})

async function onLaunched() {
  if (!user.complete) {
    await router.push('/onboarding')
  }
}
</script>

<template>
  <LaunchScreen v-if="!app.launched" @launched="onLaunched" />
  <template v-else>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ContextMenu />
  </template>
</template>
