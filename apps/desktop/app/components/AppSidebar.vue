<script setup lang="ts">
import { Check, ChevronDown, House, FolderKanban, UserCircle2, Settings, Sun, Moon, PanelLeftClose, PanelLeftOpen, Server, ShieldCheck, Map } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const projects = useProjectsStore()
const app = useAppStore()
const collapsed = useState('sidebar-collapsed', () => false)
const projectSelectorOpen = ref(false)

const navItems = [
  { icon: House,            label: 'Home',      to: '/', exact: true },
  { icon: UserCircle2,     label: 'Profile',   to: '/profile', exact: true },
]

const activeProject = computed(() => projects.activeProject)
const projectToolItems = computed(() => [
  {
    icon: FolderKanban,
    label: activeProject.value ? 'Project Workspace' : 'Project Workspace',
    to: activeProject.value ? `/projects/${activeProject.value.id}` : '/',
    exact: false,
    disabled: !activeProject.value,
  },
  { icon: Map, label: 'Roadmap', to: '/roadmap', exact: true, disabled: false },
  { icon: ShieldCheck, label: 'Security Analyzer', to: '/security', exact: true, disabled: false },
])

const appToolItems = [
  { icon: Server, label: 'Service Controller', to: '/services', exact: true, disabled: false },
]

function isActive(item: { to: string; exact?: boolean }) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

function selectProject(id: string) {
  if (!id) return
  projects.setActive(id)
  projectSelectorOpen.value = false
  if (route.path.startsWith('/projects/')) {
    void router.push(`/projects/${id}`)
  }
}

function projectInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return (words[0]?.[0] ?? 'P') + (words[1]?.[0] ?? words[0]?.[1] ?? '')
}

function projectToolLabel(project: typeof projects.projects[number]) {
  return project.activeAITool || project.aiTools?.[0] || project.aiTool || 'codex'
}

watch(() => route.fullPath, () => {
  projectSelectorOpen.value = false
})
</script>

<template>
  <aside
    class="shrink-0 flex flex-col border-r border-[var(--border)] transition-[width] duration-200 ease-in-out overflow-hidden"
    :class="collapsed ? 'w-12' : 'w-52'"
    style="background: var(--bg-surface);"
  >
    <!-- Logo + collapse toggle -->
    <div class="h-11 px-3 flex items-center border-b border-[var(--border)]" :class="collapsed ? 'justify-center' : 'gap-2'">
      <template v-if="!collapsed">
        <div class="vindicta-mark size-6 shrink-0" aria-hidden="true">
          <span class="vindicta-mark__slash vindicta-mark__slash--left" />
          <span class="vindicta-mark__slash vindicta-mark__slash--right" />
          <span class="vindicta-mark__core" />
        </div>
        <span class="flex-1 text-sm font-semibold text-[var(--text)] tracking-tight truncate opacity-80">Vindicta</span>
      </template>
      <button
        class="size-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.06] transition-colors shrink-0"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="collapsed = !collapsed"
      >
        <PanelLeftClose v-if="!collapsed" class="size-3.5" />
        <PanelLeftOpen v-else class="size-3.5" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scroll">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
        :class="[
          collapsed ? 'justify-center' : '',
          isActive(item)
            ? 'bg-indigo-600/15 text-indigo-400'
            : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05]',
        ]"
        :title="collapsed ? item.label : undefined"
      >
        <component :is="item.icon" class="size-3.5 shrink-0" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </NuxtLink>

      <!-- Project tools section -->
      <div class="pt-3">
        <p v-if="!collapsed" class="px-2 mb-1 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">
          Project Tools
        </p>
        <div v-else class="h-px bg-[var(--border)] mx-1 mb-2" />
        <NuxtLink
          v-for="item in projectToolItems"
          :key="item.to + item.label"
          :to="item.to"
          class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
          :class="[
            collapsed ? 'justify-center' : '',
            item.disabled ? 'pointer-events-none opacity-45' : '',
            !item.disabled && isActive(item)
              ? 'bg-indigo-600/15 text-indigo-400'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05]',
          ]"
          :title="collapsed ? item.label : undefined"
        >
          <component :is="item.icon" class="size-3.5 shrink-0 text-violet-400/70" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </div>

      <!-- App tools section -->
      <div class="pt-3">
        <p v-if="!collapsed" class="px-2 mb-1 text-[10px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">
          App Tools
        </p>
        <div v-else class="h-px bg-[var(--border)] mx-1 mb-2" />
        <NuxtLink
          v-for="item in appToolItems"
          :key="item.to + item.label"
          :to="item.to"
          class="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
          :class="[
            collapsed ? 'justify-center' : '',
            !item.disabled && isActive(item)
              ? 'bg-indigo-600/15 text-indigo-400'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05]',
          ]"
          :title="collapsed ? item.label : undefined"
        >
          <component :is="item.icon" class="size-3.5 shrink-0 text-violet-400/70" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Project selector -->
    <div v-if="projects.hasProjects" class="border-t border-[var(--border)] p-2">
      <template v-if="!collapsed">
        <label class="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
          Active Project
        </label>
        <div class="relative">
          <button
            class="flex h-11 w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-white/[0.04] px-2 text-left transition-colors hover:border-indigo-500/25 hover:bg-white/[0.06]"
            @click="projectSelectorOpen = !projectSelectorOpen"
          >
            <span class="grid size-7 shrink-0 place-items-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-bold uppercase text-indigo-200">
              {{ activeProject ? projectInitials(activeProject.name) : 'PR' }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xs font-semibold text-[var(--text)]">{{ activeProject?.name ?? 'Select project' }}</span>
              <span class="mt-0.5 block truncate text-[10px] text-[var(--text-faint)]">
                {{ activeProject?.code ?? 'No code' }} / {{ activeProject ? projectToolLabel(activeProject) : 'No tool' }}
              </span>
            </span>
            <ChevronDown class="size-3.5 shrink-0 text-[var(--text-faint)] transition-transform" :class="projectSelectorOpen ? 'rotate-180' : ''" />
          </button>

          <div
            v-if="projectSelectorOpen"
            class="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-30 overflow-hidden rounded-xl border border-[var(--border)] bg-[#111114]/95 shadow-2xl shadow-black/40 backdrop-blur-md"
          >
            <button
              v-for="project in projects.projects"
              :key="project.id"
              class="flex w-full items-center gap-2 border-b border-white/[0.04] px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-white/[0.06]"
              :class="project.id === activeProject?.id ? 'bg-indigo-500/10' : ''"
              @click="selectProject(project.id)"
            >
              <span class="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-[10px] font-bold uppercase text-white/70">
                {{ projectInitials(project.name) }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-xs font-medium text-[var(--text)]">{{ project.name }}</span>
                <span class="mt-0.5 block truncate text-[10px] text-[var(--text-faint)]">{{ project.code }} / {{ projectToolLabel(project) }}</span>
              </span>
              <Check v-if="project.id === activeProject?.id" class="size-3.5 shrink-0 text-indigo-300" />
            </button>
          </div>
        </div>
      </template>
      <NuxtLink
        v-else
        :to="activeProject ? `/projects/${activeProject.id}` : '/'"
        class="flex h-8 items-center justify-center rounded-md text-[var(--text-faint)] hover:bg-white/[0.05] hover:text-[var(--text)]"
        :title="activeProject?.name ?? 'Select project'"
      >
        <FolderKanban class="size-3.5" />
      </NuxtLink>
    </div>

    <!-- Theme toggle -->
    <button
      class="h-8 flex items-center gap-2 px-3 border-t border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-white/[0.03] transition-colors"
      :class="collapsed ? 'justify-center' : ''"
      :title="app.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="app.toggleTheme()"
    >
      <Sun v-if="app.theme === 'dark'" class="size-3.5 shrink-0" />
      <Moon v-else class="size-3.5 shrink-0" />
      <span v-if="!collapsed" class="text-xs">{{ app.theme === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
    </button>

    <!-- Settings link -->
    <NuxtLink
      to="/settings"
      class="h-9 flex items-center gap-2 px-3 border-t border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text)] hover:bg-white/[0.03] transition-colors"
      :class="[
        collapsed ? 'justify-center' : '',
        route.path === '/settings' ? 'bg-indigo-600/10 text-indigo-400' : '',
      ]"
      :title="collapsed ? 'Settings' : undefined"
    >
      <Settings class="size-3.5 shrink-0" />
      <span v-if="!collapsed" class="text-xs">Settings</span>
    </NuxtLink>
  </aside>
</template>

<style scoped>
.vindicta-mark {
  position: relative;
  overflow: hidden;
  border-radius: 0.45rem;
  background:
    radial-gradient(circle at 30% 20%, rgba(103, 232, 249, 0.9), transparent 28%),
    radial-gradient(circle at 72% 80%, rgba(167, 139, 250, 0.85), transparent 32%),
    linear-gradient(135deg, #18123f 0%, #4f46e5 58%, #0891b2 100%);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.vindicta-mark::after {
  content: "";
  position: absolute;
  inset: 1px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: inherit;
  pointer-events: none;
}

.vindicta-mark__slash {
  position: absolute;
  top: 4px;
  width: 3px;
  height: 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.28);
  transform-origin: center;
}

.vindicta-mark__slash--left {
  left: 7px;
  transform: rotate(-23deg);
}

.vindicta-mark__slash--right {
  right: 7px;
  background: #a5f3fc;
  transform: rotate(23deg);
}

.vindicta-mark__core {
  position: absolute;
  left: 50%;
  bottom: 5px;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 0 12px rgba(165, 243, 252, 0.85);
  transform: translateX(-50%);
}
</style>
