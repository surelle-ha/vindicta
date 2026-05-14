<script setup lang="ts">
import { Bot, Cloud } from 'lucide-vue-next'

const route = useRoute()
const projectsStore = useProjectsStore()
const kanban = useKanbanStore()
const sprint = useSprintStore()
const aiActivity = useAIActivityStore()

const activeTab = ref<string>('info')
const showAIToolPicker = ref(false)
const projectId = computed(() => route.params.id as string)
const project = computed(() => projectsStore.projects.find((p) => p.id === projectId.value))
const projectAIJobs = computed(() => aiActivity.projectJobs(projectId.value))

onMounted(async () => {
  await aiActivity.load()
  if (!projectsStore.projects.length) {
    await projectsStore.loadProjects()
  }
  if (project.value) {
    projectsStore.setActive(project.value.id)
    const { read } = useVindictaJson()
    try {
      const data = await read(project.value.absolutePath)
      kanban.load(data.tickets, project.value.absolutePath)
      sprint.load(data.sprints, project.value.absolutePath)
    }
    catch {
      kanban.load([], '')
      sprint.load([], '')
    }
    if (!project.value.activeAITool) {
      showAIToolPicker.value = true
    }
  }
})

async function selectCodexForProject() {
  if (!project.value) return
  const aiTools = project.value.aiTools?.includes('codex')
    ? project.value.aiTools
    : [...(project.value.aiTools ?? []), 'codex' as const]
  const { patchMeta } = useVindictaJson()
  await patchMeta(project.value.absolutePath, {
    aiTools,
    activeAITool: 'codex',
  })
  await projectsStore.updateProjectMeta(project.value.id, {
    aiTools,
    activeAITool: 'codex',
  })
  showAIToolPicker.value = false
}

function openSprintBoard() {
  activeTab.value = 'kanban'
}

const allTabs: { id: string; label: string; icon?: typeof Cloud; sprintOnly?: boolean }[] = [
  { id: 'info',     label: 'Info' },
  { id: 'kanban',   label: 'Board' },
  { id: 'tickets',  label: 'Tickets' },
  { id: 'sprint',   label: 'Sprints' },
  { id: 'ai-workspace', label: 'AI Workspace', icon: Bot, sprintOnly: true },
  { id: 'files',    label: 'Files' },
  { id: 'members',  label: 'Members', icon: Cloud },
  { id: 'history',  label: 'History' },
  { id: 'settings', label: 'Settings' },
]

const tabs = computed(() =>
  allTabs.filter((t) => {
    if (t.id === 'ai-workspace') return projectAIJobs.value.length > 0
    return !t.sprintOnly || sprint.activeSprint !== null
  }),
)

watch(() => route.query.tab, (tab) => {
  if (tab === 'ai-workspace' && projectAIJobs.value.length > 0) {
    activeTab.value = 'ai-workspace'
  }
}, { immediate: true })

// Fall back to Info whenever the Board tab isn't in the visible tab set
watch(tabs, (visibleTabs) => {
  const ids = visibleTabs.map(t => t.id)
  if (!ids.includes(activeTab.value)) activeTab.value = 'info'
}, { immediate: true })
</script>

<template>
  <div class="max-w-full h-full flex flex-col">
    <template v-if="project">
      <div class="relative -mx-5 -mt-5 mb-5 overflow-hidden border-b border-[var(--border)] px-5 pt-5">
        <Dither
          class="pointer-events-none z-0 opacity-70"
          :wave-speed="0.025"
          :wave-frequency="2.25"
          :wave-amplitude="0.32"
          :wave-color="[0.28, 0.3, 0.86]"
          :color-num="5"
          :pixel-size="2"
          :disable-animation="false"
          :enable-mouse-interaction="false"
          :mouse-radius="0.75"
        />
        <div
          class="absolute inset-0 z-[1] pointer-events-none"
          style="background: color-mix(in srgb, var(--bg-surface) 70%, transparent);"
        />
        <div
          class="absolute inset-0 z-[2] pointer-events-none"
          style="background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--bg-base) 45%, transparent));"
        />

        <div class="relative z-10">
          <ProjectHeader :project="project" @sprint-board="openSprintBoard" />

          <!-- Tab bar -->
          <div class="flex items-center gap-0.5 mt-4 overflow-x-auto scrollbar-none">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="px-3 py-2 text-xs font-medium transition-colors relative whitespace-nowrap flex items-center gap-1"
              :class="activeTab === tab.id
                ? 'text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-indigo-500'
                : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'"
              @click="activeTab = tab.id"
            >
              <component :is="tab.icon" v-if="tab.icon" class="size-3" />
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <KanbanBoard v-if="activeTab === 'kanban'" sprint-filter />
        <TicketsTable v-else-if="activeTab === 'tickets'" />
        <VibeSprint v-else-if="activeTab === 'sprint'" @ai-handover-started="activeTab = 'ai-workspace'" />
        <AIWorkspacePanel v-else-if="activeTab === 'ai-workspace'" :project-id="project.id" />
        <ProjectInfo v-else-if="activeTab === 'info'" :project-path="project.absolutePath" />
        <ProjectFiles v-else-if="activeTab === 'files'" :project-path="project.absolutePath" />
        <ProjectMembers v-else-if="activeTab === 'members'" :project-path="project.absolutePath" />
        <ProjectHistory v-else-if="activeTab === 'history'" :project-path="project.absolutePath" />
        <ProjectSettings v-else-if="activeTab === 'settings'" :project-path="project.absolutePath" />
      </div>

      <!-- Ticket detail side panel (globally mounted) -->
      <TicketDetail />

      <GlassModal v-model="showAIToolPicker" title="Choose AI Tool" max-width="sm">
        <div class="space-y-4">
          <p class="text-sm text-[var(--text-muted)]">
            Choose the AI tool Vindicta should use for this project workspace.
          </p>
          <button
            class="w-full flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-left hover:bg-indigo-500/15 transition-colors"
            @click="selectCodexForProject"
          >
            <div class="size-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-200 font-semibold">
              C
            </div>
            <div>
              <p class="text-sm font-semibold text-indigo-100">Codex</p>
              <p class="text-xs text-indigo-200/60 mt-0.5">Use Codex for planning, editing, and checking this project.</p>
            </div>
          </button>
          <div class="flex justify-end">
            <GlassButton size="sm" @click="selectCodexForProject">Use Codex</GlassButton>
          </div>
        </div>
      </GlassModal>
    </template>

    <div v-else class="flex items-center justify-center py-24">
      <div class="text-center">
        <p class="text-[var(--text-muted)] text-sm">Project not found.</p>
        <NuxtLink to="/" class="text-xs text-indigo-400 hover:text-indigo-300 mt-2 block">← Back to Home</NuxtLink>
      </div>
    </div>
  </div>
</template>
