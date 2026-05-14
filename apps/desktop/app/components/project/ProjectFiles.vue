<script setup lang="ts">
import { Folder, FolderOpen, FileText, FileCode, File, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  projectPath: string
}>()

interface FsEntry {
  name: string
  path: string
  isDir: boolean
  children?: FsEntry[]
  expanded?: boolean
}

const fs = useTauriFs()
const entries = ref<FsEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const AI_CONTEXT_FILES = ['CLAUDE.md', 'AGENT.md', '.cursorrules', 'AGENTS.md', '.clinerules']
const detectedContextFiles = ref<string[]>([])

async function load() {
  if (!props.projectPath) return
  loading.value = true
  error.value = null
  try {
    const rootEntries = await fs.readDir(props.projectPath)
    entries.value = rootEntries
    detectedContextFiles.value = rootEntries
      .filter(e => !e.isDir && AI_CONTEXT_FILES.includes(e.name))
      .map(e => e.name)
  }
  catch (e: any) {
    error.value = e?.message ?? (typeof e === 'string' ? e : JSON.stringify(e)) ?? 'Failed to read directory'
  }
  finally {
    loading.value = false
  }
}

async function toggleDir(entry: FsEntry) {
  if (!entry.isDir) return
  if (entry.expanded) {
    entry.expanded = false
    return
  }
  if (!entry.children) {
    try {
      entry.children = await fs.readDir(entry.path)
    }
    catch { entry.children = [] }
  }
  entry.expanded = true
}

onMounted(load)

const codeExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.go', '.rs', '.java', '.cs', '.cpp', '.c', '.h', '.json', '.yaml', '.yml', '.toml', '.sh', '.md'])

function fileIcon(name: string) {
  const ext = '.' + name.split('.').pop()
  if (codeExts.has(ext)) return FileCode
  if (name.endsWith('.md') || name.endsWith('.txt')) return FileText
  return File
}
</script>

<template>
  <div class="space-y-4">
    <!-- AI Context status -->
    <div
      class="flex items-start gap-3 p-3 rounded-xl border"
      :class="detectedContextFiles.length
        ? 'bg-emerald-500/5 border-emerald-500/20'
        : 'bg-amber-500/5 border-amber-500/20'"
    >
      <component
        :is="detectedContextFiles.length ? CheckCircle2 : AlertTriangle"
        class="size-4 mt-0.5 shrink-0"
        :class="detectedContextFiles.length ? 'text-emerald-400' : 'text-amber-400'"
      />
      <div>
        <p class="text-xs font-medium" :class="detectedContextFiles.length ? 'text-emerald-300' : 'text-amber-300'">
          {{ detectedContextFiles.length
            ? `AI context file detected: ${detectedContextFiles.join(', ')}`
            : 'No AI context file detected' }}
        </p>
        <p v-if="!detectedContextFiles.length" class="text-[11px] text-[var(--text-muted)] mt-0.5">
          Consider adding a <code class="bg-white/[0.08] px-1 rounded">CLAUDE.md</code> or <code class="bg-white/[0.08] px-1 rounded">AGENT.md</code> to give AI tools project context.
        </p>
      </div>
    </div>

    <!-- File tree header -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-[var(--text-muted)]">{{ props.projectPath }}</p>
      <button
        class="flex items-center gap-1 text-[11px] text-[var(--text-faint)] hover:text-[var(--text)] transition-colors"
        :class="loading ? 'animate-spin' : ''"
        @click="load"
      >
        <RefreshCw class="size-3" :class="loading ? 'animate-spin' : ''" />
        Refresh
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="text-xs text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="py-8 text-center text-sm text-[var(--text-muted)]">
      Loading files…
    </div>

    <!-- Tree -->
    <div v-else class="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
      <div v-if="!entries.length" class="py-8 text-center text-sm text-[var(--text-muted)]">
        Empty directory.
      </div>

      <div v-for="entry in entries" :key="entry.path">
        <!-- Root entry -->
        <button
          class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-white/[0.04] transition-colors border-b border-[var(--border)] last:border-0"
          @click="toggleDir(entry)"
        >
          <component
            :is="entry.isDir ? (entry.expanded ? FolderOpen : Folder) : fileIcon(entry.name)"
            class="size-3.5 shrink-0"
            :class="entry.isDir ? 'text-amber-400/70' : 'text-[var(--text-muted)]'"
          />
          <span :class="AI_CONTEXT_FILES.includes(entry.name) ? 'text-emerald-300 font-medium' : 'text-[var(--text)]'">
            {{ entry.name }}
          </span>
          <span
            v-if="AI_CONTEXT_FILES.includes(entry.name)"
            class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium"
          >
            AI context
          </span>
        </button>

        <!-- Children (one level deep) -->
        <template v-if="entry.isDir && entry.expanded && entry.children">
          <div
            v-for="child in entry.children"
            :key="child.path"
            class="flex items-center gap-2 pl-7 pr-3 py-1 text-xs text-[var(--text-muted)] hover:bg-white/[0.03] transition-colors border-b border-[var(--border)] last:border-0"
          >
            <component
              :is="child.isDir ? Folder : fileIcon(child.name)"
              class="size-3 shrink-0"
              :class="child.isDir ? 'text-amber-400/50' : ''"
            />
            <span :class="AI_CONTEXT_FILES.includes(child.name) ? 'text-emerald-300 font-medium' : ''">
              {{ child.name }}
            </span>
            <span
              v-if="AI_CONTEXT_FILES.includes(child.name)"
              class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium"
            >
              AI context
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
