<script setup lang="ts">
import { FolderOpen, FolderKanban, FolderPlus, GitBranch, Loader2, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { Command } from '@tauri-apps/plugin-shell'
import { documentDir } from '@tauri-apps/api/path'
import { deriveProjectCode } from '~/utils/ticket'

const wizard = useWizardStore()
const { openDirectory } = useTauriDialog()

let codeManuallyEdited = false

async function pickFolder() {
  const path = await openDirectory()
  if (path) {
    wizard.selectedPath = path
    if (!wizard.projectName) {
      wizard.projectName = path.split(/[\\/]/).pop() ?? ''
    }
  }
}

watch(() => wizard.projectName, (name) => {
  if (!codeManuallyEdited) {
    wizard.projectCode = deriveProjectCode(name)
  }
})

function onCodeInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
  wizard.projectCode = val
  codeManuallyEdited = true
}

// Clone mode
const cloneSuccess = ref(false)
const newProjectSuccess = ref(false)
const newProjectCreating = ref(false)
const newProjectError = ref('')

function pathSep(value: string) {
  return value.includes('\\') ? '\\' : '/'
}

function joinPath(base: string, child: string) {
  const sep = pathSep(base)
  return `${base.replace(/[\\/]$/, '')}${sep}${child}`
}

function safeFolderName(value: string) {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s-]+|[.\s-]+$/g, '')
    .slice(0, 80)
    || 'New Vindicta Project'
}

function repoNameFromGitUrl(value: string) {
  const trimmed = value.trim().replace(/[\\/]$/, '')
  const lastPathPart = trimmed.split(/[/:]/).filter(Boolean).pop() ?? ''
  return lastPathPart
    .replace(/\.git$/i, '')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80)
}

function validatedGitUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048 || /[\u0000-\u001f\u007f"'`$;&|<>]/.test(trimmed)) {
    throw new Error('Enter a valid Git URL.')
  }

  if (/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+:[A-Za-z0-9._~/-]+(?:\.git)?$/i.test(trimmed)) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (['https:', 'http:', 'ssh:', 'git:'].includes(parsed.protocol)) return trimmed
  }
  catch { /* handled below */ }

  throw new Error('Use an https://, ssh://, git://, or git@host:owner/repo.git URL.')
}

const repoNameFromUrl = computed(() =>
  wizard.gitUrl ? repoNameFromGitUrl(wizard.gitUrl) : '',
)

const cloneDestPreview = computed(() =>
  repoNameFromUrl.value ? `Documents/Vindicta/${repoNameFromUrl.value}` : '',
)
const newProjectDestPreview = computed(() =>
  `Documents/Vindicta/${safeFolderName(wizard.projectName || 'New Vindicta Project')}`,
)

async function cloneRepo() {
  if (!wizard.gitUrl) return
  wizard.cloning = true
  wizard.cloneError = ''
  cloneSuccess.value = false

  try {
    const gitUrl = validatedGitUrl(wizard.gitUrl)
    const docsDir = await documentDir()
    const repoName = repoNameFromUrl.value || 'project'
    const isWin = navigator.platform.toLowerCase().includes('win')
    const sep = isWin ? '\\' : '/'
    const vindictaDir = `${docsDir.replace(/[\\/]$/, '')}${sep}Vindicta`
    const fullDestPath = `${vindictaDir}${sep}${repoName}`
    const { mkdir } = await import('@tauri-apps/plugin-fs')

    await mkdir(vindictaDir, { recursive: true })
    const output = await Command.create('git-clone', ['clone', '--', gitUrl, fullDestPath]).execute()

    if (output.code !== 0) {
      wizard.cloneError = output.stderr || `Clone failed (exit ${output.code})`
    }
    else {
      wizard.selectedPath = fullDestPath
      wizard.projectName = repoName
      wizard.projectCode = deriveProjectCode(repoName)
      cloneSuccess.value = true
    }
  }
  catch (e) {
    wizard.cloneError = String(e)
  }
  finally {
    wizard.cloning = false
  }
}

async function createNewProjectFolder() {
  if (!wizard.projectName.trim()) return
  newProjectCreating.value = true
  newProjectError.value = ''
  newProjectSuccess.value = false

  try {
    const docsDir = await documentDir()
    const { mkdir, exists } = await import('@tauri-apps/plugin-fs')
    const vindictaDir = joinPath(docsDir, 'Vindicta')
    const baseName = safeFolderName(wizard.projectName)
    let targetPath = joinPath(vindictaDir, baseName)
    let suffix = 2

    await mkdir(vindictaDir, { recursive: true })
    while (await exists(targetPath)) {
      targetPath = joinPath(vindictaDir, `${baseName}-${suffix}`)
      suffix += 1
    }
    await mkdir(targetPath, { recursive: true })

    wizard.selectedPath = targetPath
    if (!wizard.projectCode) wizard.projectCode = deriveProjectCode(wizard.projectName)
    newProjectSuccess.value = true
  }
  catch (e) {
    newProjectError.value = e instanceof Error ? e.message : String(e)
  }
  finally {
    newProjectCreating.value = false
  }
}

// Reset path/clone state when switching modes
watch(() => wizard.importMode, () => {
  wizard.selectedPath = null
  wizard.projectName = ''
  wizard.projectCode = ''
  wizard.gitUrl = ''
  wizard.cloneError = ''
  wizard.cloning = false
  cloneSuccess.value = false
  newProjectSuccess.value = false
  newProjectCreating.value = false
  newProjectError.value = ''
  codeManuallyEdited = false
})
</script>

<template>
  <div class="space-y-5">
    <!-- Mode toggle -->
    <div class="flex rounded-xl border border-white/10 overflow-hidden text-xs font-medium">
      <button
        class="flex-1 py-2.5 transition-colors"
        :class="wizard.importMode === 'new' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/70'"
        @click="wizard.importMode = 'new'"
      >
        Create New
      </button>
      <button
        class="flex-1 py-2.5 transition-colors"
        :class="wizard.importMode === 'local' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/70'"
        @click="wizard.importMode = 'local'"
      >
        Import Local Project
      </button>
      <button
        class="flex-1 py-2.5 transition-colors"
        :class="wizard.importMode === 'clone' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/70'"
        @click="wizard.importMode = 'clone'"
      >
        Clone from Git
      </button>
    </div>

    <!-- New mode -->
    <template v-if="wizard.importMode === 'new'">
      <div>
        <h3 class="text-base font-semibold text-white mb-1">Create a new project folder</h3>
        <p class="text-sm text-white/40">
          Vindicta will create a directory under <code class="text-indigo-300 text-xs">Documents/Vindicta/</code> and add <code class="text-indigo-300 text-xs">vindicta.json</code> when the wizard finishes.
        </p>
      </div>

      <GlassInput v-model="wizard.projectName" label="Project name" placeholder="My awesome project" />

      <div>
        <label class="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Project code</label>
        <div class="relative">
          <input
            :value="wizard.projectCode"
            type="text"
            maxlength="3"
            placeholder="VND"
            class="glass w-full px-4 py-2.5 text-sm text-white placeholder-white/20 bg-transparent outline-none focus:ring-1 focus:ring-indigo-500/50 uppercase tracking-widest font-mono"
            @input="onCodeInput"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">3 chars</span>
        </div>
        <p class="text-xs text-white/30 mt-1">Auto-derived from project name. Used as ticket prefix (e.g. VND-1).</p>
      </div>

      <GlassInput v-model="wizard.projectDescription" label="Description (optional)" placeholder="What are you building?" />

      <div v-if="wizard.projectName && !newProjectSuccess" class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50">
        Will create: <span class="text-indigo-300 font-mono">{{ newProjectDestPreview }}</span>
      </div>

      <button
        v-if="!newProjectSuccess"
        class="w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        :class="wizard.projectName.trim() && !newProjectCreating
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
          : 'bg-white/10 text-white/30 cursor-not-allowed'"
        :disabled="!wizard.projectName.trim() || newProjectCreating"
        @click="createNewProjectFolder"
      >
        <Loader2 v-if="newProjectCreating" class="size-4 animate-spin" />
        <FolderPlus v-else class="size-4" />
        {{ newProjectCreating ? 'Creating...' : 'Create Folder' }}
      </button>

      <p v-if="newProjectError" class="text-xs text-red-400 flex items-start gap-1.5">
        <AlertCircle class="size-3.5 mt-0.5 shrink-0" />
        {{ newProjectError }}
      </p>

      <div v-if="newProjectSuccess" class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
        <CheckCircle class="size-4 shrink-0" />
        <span class="text-xs font-mono truncate">{{ wizard.selectedPath }}</span>
      </div>
    </template>

    <!-- ── Local mode ── -->
    <template v-if="wizard.importMode === 'local'">
      <div>
        <h3 class="text-base font-semibold text-white mb-1">Select your project folder</h3>
        <p class="text-sm text-white/40">
          Choose the root directory. A <code class="text-indigo-300 text-xs">vindicta.json</code> file will be created there.
        </p>
      </div>

      <button
        class="w-full glass glass-hover border-dashed py-8 flex flex-col items-center gap-3 transition-all"
        :class="wizard.selectedPath ? 'border-indigo-500/40 bg-indigo-500/5' : ''"
        @click="pickFolder"
      >
        <div
          class="size-12 rounded-xl flex items-center justify-center transition-colors"
          :class="wizard.selectedPath ? 'bg-indigo-500/20' : 'bg-white/5'"
        >
          <FolderKanban v-if="wizard.selectedPath" class="size-6 text-indigo-300" />
          <FolderOpen v-else class="size-6 text-white/30" />
        </div>
        <div class="text-center">
          <p
            class="text-sm font-medium transition-colors"
            :class="wizard.selectedPath ? 'text-white' : 'text-white/40'"
          >
            {{ wizard.selectedPath || 'Click to select folder' }}
          </p>
          <p v-if="wizard.selectedPath" class="text-xs text-white/30 mt-0.5">Click to change</p>
        </div>
      </button>

      <GlassInput v-model="wizard.projectName" label="Project name" placeholder="My awesome project" />

      <div>
        <label class="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Project code</label>
        <div class="relative">
          <input
            :value="wizard.projectCode"
            type="text"
            maxlength="3"
            placeholder="VND"
            class="glass w-full px-4 py-2.5 text-sm text-white placeholder-white/20 bg-transparent outline-none focus:ring-1 focus:ring-indigo-500/50 uppercase tracking-widest font-mono"
            @input="onCodeInput"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">3 chars</span>
        </div>
        <p class="text-xs text-white/30 mt-1">Auto-derived from project name. Used as ticket prefix (e.g. VND-1).</p>
      </div>

      <GlassInput v-model="wizard.projectDescription" label="Description (optional)" placeholder="What are you building?" />
    </template>

    <!-- ── Clone mode ── -->
    <template v-else-if="wizard.importMode === 'clone'">
      <div>
        <h3 class="text-base font-semibold text-white mb-1">Clone a Git repository</h3>
        <p class="text-sm text-white/40">
          The repo will be cloned into <code class="text-indigo-300 text-xs">Documents/Vindicta/</code> and registered as a project.
        </p>
      </div>

      <GlassInput
        v-model="wizard.gitUrl"
        label="Repository URL"
        placeholder="https://github.com/user/repo.git"
      />

      <div v-if="cloneDestPreview && !cloneSuccess" class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50">
        Will clone to: <span class="text-indigo-300 font-mono">{{ cloneDestPreview }}</span>
      </div>

      <!-- Clone button -->
      <button
        v-if="!cloneSuccess"
        class="w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        :class="wizard.gitUrl && !wizard.cloning
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
          : 'bg-white/10 text-white/30 cursor-not-allowed'"
        :disabled="!wizard.gitUrl || wizard.cloning"
        @click="cloneRepo"
      >
        <Loader2 v-if="wizard.cloning" class="size-4 animate-spin" />
        <GitBranch v-else class="size-4" />
        {{ wizard.cloning ? 'Cloning…' : 'Clone Repository' }}
      </button>

      <p v-if="wizard.cloneError" class="text-xs text-red-400 flex items-start gap-1.5">
        <AlertCircle class="size-3.5 mt-0.5 shrink-0" />
        {{ wizard.cloneError }}
      </p>

      <!-- Success + editable fields -->
      <template v-if="cloneSuccess">
        <div class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
          <CheckCircle class="size-4 shrink-0" />
          <span class="text-xs font-mono truncate">{{ wizard.selectedPath }}</span>
        </div>

        <GlassInput v-model="wizard.projectName" label="Project name" placeholder="My awesome project" />

        <div>
          <label class="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Project code</label>
          <div class="relative">
            <input
              :value="wizard.projectCode"
              type="text"
              maxlength="3"
              placeholder="VND"
              class="glass w-full px-4 py-2.5 text-sm text-white placeholder-white/20 bg-transparent outline-none focus:ring-1 focus:ring-indigo-500/50 uppercase tracking-widest font-mono"
              @input="onCodeInput"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">3 chars</span>
          </div>
          <p class="text-xs text-white/30 mt-1">Auto-derived from repo name. Editable.</p>
        </div>

        <GlassInput v-model="wizard.projectDescription" label="Description (optional)" placeholder="What are you building?" />
      </template>
    </template>
  </div>
</template>
