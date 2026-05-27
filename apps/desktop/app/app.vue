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
  if (app.wslAutoStart) {
    void startConfiguredWslBackends()
  }
})

async function onLaunched() {
  if (!user.complete) {
    await router.push('/onboarding')
  }
}

async function startConfiguredWslBackends() {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const profiles = app.wslProfiles.filter(profile => profile.enabled)
    await Promise.all(profiles.map(profile => invoke('wsl_start_distribution', { name: profile.distro })))
  }
  catch {
    // WSL is optional. Settings exposes the detailed status and remediation.
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
