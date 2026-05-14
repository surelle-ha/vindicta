import type { ComputedRef } from 'vue'
import type { AIToolSlug, ProjectMeta } from '~/types/vindicta'

const README_CANDIDATES = ['README.md', 'Readme.md', 'readme.md']

const aiToolNames: Record<AIToolSlug, string> = {
  codex: 'Codex',
  claude_code: 'Claude Code',
  copilot: 'GitHub Copilot',
  codeium: 'Codeium',
  other: 'AI',
}

function toolName(project: ProjectMeta) {
  const tool = project.activeAITool ?? project.aiTools?.[0] ?? project.aiTool
  return tool ? aiToolNames[tool] ?? 'AI' : 'AI'
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function trimSentence(value: string, maxLength = 210) {
  const clean = stripMarkdown(value)
  if (clean.length <= maxLength) return clean
  const boundary = clean.lastIndexOf('.', maxLength)
  if (boundary > 80) return clean.slice(0, boundary + 1)
  return `${clean.slice(0, maxLength - 1).trim()}...`
}

function extractFirstParagraph(readme: string) {
  return readme
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .find(block =>
      block
      && !block.startsWith('#')
      && !block.startsWith('```')
      && stripMarkdown(block).length > 30,
    )
}

function extractHeadings(readme: string) {
  return [...readme.matchAll(/^#{1,3}\s+(.+)$/gm)]
    .map(match => stripMarkdown(match[1]))
    .filter(Boolean)
    .slice(0, 4)
}

function extractSetupCommand(readme: string) {
  const codeBlocks = [...readme.matchAll(/```(?:\w+)?\s*([\s\S]*?)```/g)]
    .map(match => match[1])
  const inlineCommands = [...readme.matchAll(/`([^`]*(?:npm|pnpm|yarn|bun|cargo|make|docker|tauri)[^`]*)`/gi)]
    .map(match => match[1])
  const candidates = [...codeBlocks, ...inlineCommands]
    .flatMap(block => block.split('\n'))
    .map(line => line.replace(/^\s*[$>]\s*/, '').trim())
    .filter(Boolean)

  return candidates.find(line => /\b(dev|start|serve|build|test|install|setup)\b/i.test(line))
}

function extractActionItem(readme: string) {
  return readme
    .split('\n')
    .map(line => line.trim())
    .find(line => /^[-*]\s+\[[ x]\]/i.test(line) || /^[-*]\s+/.test(line))
}

function buildMessages(project: ProjectMeta, readme: string, fileName: string) {
  const guide = toolName(project)
  const messages: string[] = []
  const summary = extractFirstParagraph(readme)
  const headings = extractHeadings(readme)
  const setupCommand = extractSetupCommand(readme)
  const actionItem = extractActionItem(readme)

  if (summary) {
    messages.push(`${guide} read ${fileName}: ${trimSentence(summary)}`)
  }
  else if (project.description?.trim()) {
    messages.push(`${guide} is using the project description for now: ${trimSentence(project.description)}`)
  }
  else {
    messages.push(`${guide} is watching ${project.name}. Add a README summary and I can surface better project context here.`)
  }

  if (headings.length) {
    messages.push(`${guide} found these README areas: ${headings.join(', ')}. Turn the next uncertain item into a ticket, then move it through the board as work progresses.`)
  }

  if (setupCommand) {
    messages.push(`README hint: \`${setupCommand}\` looks useful for local setup or verification. Capture setup gaps as tickets so the project stays repeatable.`)
  }

  if (actionItem) {
    messages.push(`README task signal: ${trimSentence(actionItem, 160)}. You can add this as a ticket, assign it to a sprint, then use the Board queue to decide what the AI should pick up next.`)
  }

  messages.push(`Vindicta flow: start in Info for README context, keep work in Tickets, group focused work into Sprints, and use Board Columns or Queue to guide execution.`)

  return messages
}

export function useProjectGuide(project: ComputedRef<ProjectMeta>) {
  const fs = useTauriFs()
  const messages = ref<string[]>([])
  const messageIndex = ref(0)
  const loading = ref(false)
  const fileName = ref('README.md')
  const lastLoadedAt = ref<Date | null>(null)
  const readme = ref('')

  let refreshTimer: ReturnType<typeof setInterval> | undefined
  let rotateTimer: ReturnType<typeof setInterval> | undefined

  const currentMessage = computed(() => {
    if (loading.value && !messages.value.length) {
      return `${toolName(project.value)} is reading the project README for fresh context...`
    }

    return messages.value[messageIndex.value]
      ?? `${toolName(project.value)} is ready. Add a README.md to make this guidance more project-aware.`
  })

  const statusLabel = computed(() => {
    if (loading.value) return 'Refreshing README'
    if (!lastLoadedAt.value) return 'Waiting for README'
    return `Updated ${lastLoadedAt.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  })

  function rebuildMessages() {
    if (readme.value.trim()) {
      messages.value = buildMessages(project.value, readme.value, fileName.value)
    }
    else {
      messages.value = [
        `${toolName(project.value)} is ready for ${project.value.name}. Add README.md notes and they will start appearing here automatically.`,
        'Vindicta flow: read Info, create tickets, organize sprints, move work on the board, and use Queue to line up AI-ready work.',
      ]
    }
    messageIndex.value = 0
  }

  async function refreshReadme() {
    const path = project.value.absolutePath
    if (!path) return

    loading.value = true
    try {
      const sep = path.includes('\\') ? '\\' : '/'
      for (const candidate of README_CANDIDATES) {
        const readmePath = `${path}${sep}${candidate}`
        if (await fs.exists(readmePath).catch(() => false)) {
          const nextReadme = await fs.readTextFile(readmePath)
          fileName.value = candidate
          lastLoadedAt.value = new Date()
          if (nextReadme !== readme.value || !messages.value.length) {
            readme.value = nextReadme
            rebuildMessages()
          }
          return
        }
      }

      readme.value = ''
      lastLoadedAt.value = null
      rebuildMessages()
    }
    catch {
      messages.value = [
        `${toolName(project.value)} tried to read README.md but could not access it yet. The project tabs still work while this refreshes.`,
        'Vindicta flow: use Info for context, Tickets for work items, Sprints for focus, and Board for progress or AI queueing.',
      ]
      messageIndex.value = 0
    }
    finally {
      loading.value = false
    }
  }

  function rotateMessage() {
    if (messages.value.length <= 1) return
    messageIndex.value = (messageIndex.value + 1) % messages.value.length
  }

  onMounted(() => {
    refreshReadme()
    refreshTimer = setInterval(refreshReadme, 25000)
    rotateTimer = setInterval(rotateMessage, 9000)
  })

  onBeforeUnmount(() => {
    if (refreshTimer) clearInterval(refreshTimer)
    if (rotateTimer) clearInterval(rotateTimer)
  })

  watch(
    () => [project.value.absolutePath, project.value.activeAITool, project.value.aiTools?.join(',')] as const,
    () => refreshReadme(),
  )

  return {
    currentMessage,
    statusLabel,
    refreshReadme,
    loading,
  }
}
