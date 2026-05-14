<script setup lang="ts">
import { BookOpen, RefreshCw } from 'lucide-vue-next'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
  projectPath: string
}>()

const fs = useTauriFs()
const loading = ref(false)
const readme = ref('')
const error = ref<string | null>(null)
const fileName = ref('README.md')

const readmeHtml = computed(() => {
  return renderMarkdown(readme.value)
})

async function loadReadme() {
  loading.value = true
  error.value = null
  readme.value = ''
  try {
    const candidates = ['README.md', 'Readme.md', 'readme.md']
    for (const name of candidates) {
      const path = `${props.projectPath}/${name}`
      if (await fs.exists(path).catch(() => false)) {
        fileName.value = name
        readme.value = await fs.readTextFile(path)
        return
      }
    }
    error.value = 'No README.md file found in this project.'
  }
  catch (e: any) {
    error.value = e?.message ?? 'Failed to read README.md.'
  }
  finally {
    loading.value = false
  }
}

watch(() => props.projectPath, loadReadme, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <BookOpen class="size-4 text-indigo-300" />
        <div>
          <h3 class="text-sm font-semibold text-[var(--text)]">Project Info</h3>
          <p class="text-xs text-[var(--text-muted)]">{{ fileName }}</p>
        </div>
      </div>
      <button
        class="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05] transition-colors"
        title="Refresh README"
        :disabled="loading"
        @click="loadReadme"
      >
        <RefreshCw class="size-3.5" :class="loading ? 'animate-spin' : ''" />
      </button>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-[var(--text-muted)]">
      Loading README...
    </div>
    <div v-else-if="error" class="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/80">
      {{ error }}
    </div>
    <article
      v-else
      class="markdown-body rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4"
      v-html="readmeHtml"
    />
  </div>
</template>

<style scoped>
.markdown-body :deep(h1) { font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.75rem; }
.markdown-body :deep(h2) { font-size: 1.125rem; font-weight: 650; color: white; margin-top: 1.25rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.375rem; }
.markdown-body :deep(h3) { font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 1rem; margin-bottom: 0.375rem; }
.markdown-body :deep(p) { color: rgba(255,255,255,0.65); font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.75rem; }
.markdown-body :deep(a) { color: #a5b4fc; text-decoration: underline; text-underline-offset: 2px; }
.markdown-body :deep(ul) { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.75rem; }
.markdown-body :deep(ol) { list-style-type: decimal; margin-left: 1.25rem; margin-bottom: 0.75rem; }
.markdown-body :deep(li) { color: rgba(255,255,255,0.65); font-size: 0.875rem; margin-bottom: 0.25rem; }
.markdown-body :deep(code) { font-size: 0.75rem; font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: #c4b5fd; }
.markdown-body :deep(pre) { background: rgba(0,0,0,0.28); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.875rem; overflow-x: auto; margin-bottom: 0.875rem; }
.markdown-body :deep(pre code) { background: transparent; padding: 0; }
.markdown-body :deep(blockquote) { border-left: 2px solid rgba(99,102,241,0.5); padding-left: 0.875rem; color: rgba(255,255,255,0.5); font-style: italic; }
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 0.875rem; font-size: 0.8125rem; }
.markdown-body :deep(th),
.markdown-body :deep(td) { border: 1px solid var(--border); padding: 0.5rem; color: rgba(255,255,255,0.65); }
.markdown-body :deep(th) { color: white; background: rgba(255,255,255,0.05); }
</style>
