<script setup lang="ts">
import { GitBranch, Cpu, Code2, Zap, RefreshCw } from 'lucide-vue-next'
import type { AIToolSlug, ProjectMeta } from '~/types/vindicta'

const props = defineProps<{
  project: ProjectMeta
}>()

const emit = defineEmits<{
  sprintBoard: []
}>()

const sprint = useSprintStore()
const projectRef = computed(() => props.project)
const {
  currentMessage,
  statusLabel,
  refreshReadme,
  loading: guideLoading,
} = useProjectGuide(projectRef)

const aiToolNames: Record<AIToolSlug, string> = {
  codex: 'Codex',
  claude_code: 'Claude Code',
  copilot: 'GitHub Copilot',
  codeium: 'Codeium',
  other: 'Other',
}

function toolLabel(tool: AIToolSlug | null | undefined) {
  return tool ? aiToolNames[tool] ?? tool : 'Not selected'
}

const availableTools = computed(() => {
  const tools = props.project.aiTools?.length ? props.project.aiTools : [props.project.aiTool]
  return [...new Set(tools)].map(tool => toolLabel(tool))
})

const activeToolLabel = computed(() => toolLabel(props.project.activeAITool ?? null))
</script>

<template>
  <div class="flex items-start justify-between gap-6">
    <div class="min-w-0 flex-1">
      <h1 class="text-2xl font-bold text-[var(--text)]">{{ project.name }}</h1>
      <p v-if="project.description" class="text-sm text-[var(--text-muted)] mt-0.5">{{ project.description }}</p>
      <div class="flex items-center gap-2 mt-2">
        <div class="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
          <GitBranch class="size-3" />
          <span class="truncate max-w-xs">{{ project.absolutePath }}</span>
        </div>
      </div>

      <div class="mt-4 flex max-w-3xl items-start gap-3 pl-4">
        <ProjectGuideOrb class="shrink-0" />
        <div class="relative rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3">
          <div class="absolute left-[-7px] top-5 size-3 rotate-45 border-l border-b border-indigo-500/20 bg-[#151327]" />
          <div class="flex items-start gap-3">
            <TextType
              :key="currentMessage"
              :text="currentMessage"
              as="p"
              class-name="text-xs text-indigo-100/80 leading-relaxed flex-1"
              :typing-speed="18"
              :deleting-speed="10"
              :pause-duration="1200"
              :loop="false"
              :show-cursor="!guideLoading"
              cursor-character="|"
              cursor-class-name="text-indigo-200/45"
            />
            <button
              class="size-7 shrink-0 rounded-lg border border-indigo-400/20 text-indigo-200/60 hover:text-indigo-100 hover:bg-indigo-400/10 transition-colors grid place-items-center disabled:opacity-60"
              title="Refresh project guidance"
              :disabled="guideLoading"
              @click="refreshReadme"
            >
              <RefreshCw class="size-3.5" :class="guideLoading ? 'animate-spin' : ''" />
            </button>
          </div>
          <p class="text-[10px] text-indigo-200/45 mt-2">
            Active AI: <span class="text-indigo-200/80">{{ activeToolLabel }}</span>
            <span class="mx-1.5">/</span>
            <span>{{ statusLabel }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <!-- Active sprint indicator -->
      <button
        v-if="sprint.activeSprint"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
        @click="emit('sprintBoard')"
      >
        <Zap class="size-3.5 text-indigo-400" />
        <span>{{ sprint.activeSprint.name }}</span>
        <span class="text-indigo-400/50 ml-0.5">→ Board</span>
      </button>

      <GlassBadge variant="purple">
        <Code2 class="size-3" />
        {{ project.editor }}
      </GlassBadge>
      <GlassBadge
        v-for="tool in availableTools"
        :key="tool"
        variant="info"
      >
        <Cpu class="size-3" />
        {{ tool }}
      </GlassBadge>
    </div>
  </div>
</template>
