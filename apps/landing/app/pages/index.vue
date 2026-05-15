<script setup lang="ts">
import type { Component } from 'vue'
import {
  Apple,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Columns3,
  FileJson,
  FolderKanban,
  Laptop,
  Lightbulb,
  Mail,
  Monitor,
  PanelTop,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-vue-next'
import vindictaBanner from '~/assets/images/vindicta-banner.png'

type Feature = {
  title: string
  description: string
  icon: Component
  detail: string
}

type Platform = {
  value: string
  label: string
  detail: string
  icon: Component
}

const showWaitlist = ref(false)
const submitted = ref(false)
const email = ref('')
const selectedPlatform = ref('windows')

const waitlistValid = computed(() => email.value.trim().includes('@') && selectedPlatform.value.length > 0)

const heroStats = [
  { label: 'Local file format', value: 'vindicta.json' },
  { label: 'Core workflow', value: 'tickets to sprints' },
  { label: 'AI handoff', value: 'Codex ready' },
]

const features: Feature[] = [
  {
    title: 'Local project registry',
    description: 'Register real workspaces and keep project context tied to the code that lives on your machine.',
    icon: FolderKanban,
    detail: 'Dashboard, project metadata, README context, local paths',
  },
  {
    title: 'Configurable kanban',
    description: 'Shape columns, roles, ticket priorities, and assignments around the way your project actually moves.',
    icon: Columns3,
    detail: 'Custom columns, roles, status flow, comments',
  },
  {
    title: 'Vibe sprint planning',
    description: 'Turn a goal into a focused sprint, attach tickets, run AI clarification, and export sprint reports.',
    icon: CalendarClock,
    detail: 'Sprint goals, ticket picker, reports, backlog return',
  },
  {
    title: 'AI handover workspace',
    description: 'Bundle sprint tickets and project context into a Codex handover that returns structured updates.',
    icon: Bot,
    detail: 'Effort levels, JSON handover output, activity history',
  },
  {
    title: 'Project health checks',
    description: 'Keep local tooling visible with doctor-style checks for shell readiness, project status, and setup gaps.',
    icon: ScanSearch,
    detail: 'Launch checks, security review, service readiness',
  },
  {
    title: 'Portable project file',
    description: 'Store the operating state in a local Vindicta file so the workflow can travel with the repo.',
    icon: FileJson,
    detail: 'Offline-first, readable project state, no account gate',
  },
]

const workflow = [
  { title: 'Read context', detail: 'Capture project notes, README signals, roles, and local workspace paths.', icon: Lightbulb },
  { title: 'Plan the sprint', detail: 'Clarify scope, draft tickets, choose effort, and start focused work.', icon: ClipboardList },
  { title: 'Hand off to AI', detail: 'Send the sprint to Codex with clear constraints, then sync structured ticket updates.', icon: WandSparkles },
]

const platforms: Platform[] = [
  { value: 'windows', label: 'Windows', detail: 'Desktop waitlist priority', icon: Monitor },
  { value: 'macos', label: 'macOS', detail: 'Interest list', icon: Apple },
  { value: 'linux', label: 'Linux', detail: 'Interest list', icon: Laptop },
]

function openWaitlist() {
  submitted.value = false
  showWaitlist.value = true
}

function closeWaitlist() {
  showWaitlist.value = false
}

function joinWaitlist() {
  if (!waitlistValid.value) return
  submitted.value = true
}
</script>

<template>
  <div class="min-h-screen overflow-hidden bg-[#0d0d0f] text-white">
    <div class="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div class="landing-dither absolute inset-0" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(79,70,229,0.24),transparent_34%),linear-gradient(180deg,rgba(13,13,15,0.08),#0d0d0f_82%)]" />
      <div class="absolute inset-0 bg-black/35" />
    </div>

    <nav class="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <a href="#" class="flex items-center gap-3" aria-label="Vindicta home">
        <img :src="vindictaBanner" alt="Vindicta" class="h-12 w-auto object-contain sm:h-14" draggable="false">
      </a>
      <div class="hidden items-center gap-6 text-sm text-white/55 sm:flex">
        <a href="#features" class="transition-colors hover:text-white">Features</a>
        <a href="#workflow" class="transition-colors hover:text-white">Workflow</a>
        <button class="inline-flex items-center gap-2 rounded-lg border border-indigo-200/25 bg-indigo-300/10 px-3 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-100/45 hover:bg-indigo-300/15" @click="openWaitlist">
          <Mail class="size-4" />
          Waitlist
        </button>
      </div>
      <button class="inline-flex items-center gap-2 rounded-lg border border-indigo-200/25 bg-indigo-300/10 px-3 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-100/45 hover:bg-indigo-300/15 sm:hidden" @click="openWaitlist">
        <Mail class="size-4" />
        Join
      </button>
    </nav>

    <main class="relative z-10">
      <section class="hero-section mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)] lg:px-8">
        <div class="hero-copy max-w-3xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-white/[0.04] px-3 py-1 text-xs font-medium text-indigo-100/80 shadow-lg shadow-black/20 backdrop-blur">
            <Sparkles class="size-3.5 text-indigo-200" />
            Free local project management for vibe-coded work
          </div>

          <h1 class="mt-8 max-w-4xl text-5xl font-bold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Plan the sprint. Hand it to AI. Keep the board honest.
          </h1>

          <p class="mt-6 max-w-2xl text-base leading-7 text-white/58 sm:text-lg">
            Vindicta is a desktop command center for local projects: tickets, kanban, sprint planning, AI handovers, and portable project state in one focused workflow.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <button class="group inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200/50" @click="openWaitlist">
              Join the waitlist
              <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a href="#features" class="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/78 transition hover:border-white/18 hover:bg-white/[0.07]">
              Explore features
              <ChevronRight class="size-4" />
            </a>
          </div>

          <div class="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div v-for="stat in heroStats" :key="stat.label" class="rounded-lg border border-white/[0.08] bg-black/20 p-3 backdrop-blur">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">{{ stat.label }}</p>
              <p class="mt-1 text-sm font-semibold text-white/78">{{ stat.value }}</p>
            </div>
          </div>
        </div>

        <div class="hero-visual relative mx-auto flex aspect-square w-full max-w-[35rem] items-center justify-center lg:mx-0">
          <div class="orb-shell">
            <div class="orb-nebula" />
            <div class="orb-ring orb-ring-back orb-ring-xl" />
            <div class="orb-ring orb-ring-back orb-ring-lg" />
            <div class="orb-ring orb-ring-back orb-ring-md" />
            <div class="orb-core">
              <div class="orb-core-glow" />
              <div class="orb-lens" />
              <div class="orb-body" />
              <div class="orb-shine" />
            </div>
            <div class="orb-ring orb-ring-front orb-ring-xl" />
            <div class="orb-ring orb-ring-front orb-ring-lg" />
            <div class="orb-ring orb-ring-front orb-ring-md" />
            <span class="orb-particle orb-particle-one" />
            <span class="orb-particle orb-particle-two" />
            <span class="orb-particle orb-particle-three" />
          </div>

          <div class="hero-panel hero-panel-top">
            <div class="flex items-center gap-2">
              <ShieldCheck class="size-4 text-emerald-200/80" />
              <span class="text-xs font-semibold text-white/76">Local-first</span>
            </div>
            <p class="mt-1 text-xs text-white/42">Project state stays with the repo.</p>
          </div>

          <div class="hero-panel hero-panel-bottom">
            <div class="flex items-center gap-2">
              <PanelTop class="size-4 text-indigo-200/80" />
              <span class="text-xs font-semibold text-white/76">AI Handover</span>
            </div>
            <p class="mt-1 text-xs text-white/42">Sprint scope becomes agent-ready context.</p>
          </div>
        </div>
      </section>

      <section id="features" class="section-reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="mb-8 max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/70">Product features</p>
          <h2 class="mt-3 text-3xl font-bold tracking-normal text-white sm:text-4xl">Grounded in the desktop workflow.</h2>
          <p class="mt-4 text-sm leading-6 text-white/50">
            The landing page now mirrors what the app actually does: local project setup, sprint planning, board work, and AI handoff.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="feature in features" :key="feature.title" class="feature-card group rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 shadow-xl shadow-black/15 backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-200/24 hover:bg-white/[0.055]">
            <div class="flex items-start gap-4">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200/20 bg-indigo-300/10 text-indigo-100">
                <component :is="feature.icon" class="size-5" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-white">{{ feature.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-white/48">{{ feature.description }}</p>
              </div>
            </div>
            <div class="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-xs text-white/36">
              <CheckCircle2 class="size-3.5 text-emerald-200/60" />
              {{ feature.detail }}
            </div>
          </article>
        </div>
      </section>

      <section id="workflow" class="section-reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-center">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/70">How it moves</p>
            <h2 class="mt-3 text-3xl font-bold tracking-normal text-white sm:text-4xl">A calmer loop for AI-assisted project work.</h2>
            <p class="mt-4 text-sm leading-6 text-white/50">
              Vindicta keeps the human planning layer explicit before an AI tool touches the codebase, then records what changed back on the board.
            </p>
            <button class="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#101014] transition hover:bg-indigo-100" @click="openWaitlist">
              Get launch updates
              <Mail class="size-4" />
            </button>
          </div>

          <div class="grid gap-3">
            <div v-for="(step, index) in workflow" :key="step.title" class="workflow-row rounded-lg border border-white/[0.08] bg-black/24 p-4 backdrop-blur">
              <div class="flex items-start gap-4">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-indigo-100">
                  <component :is="step.icon" class="size-5" />
                </div>
                <div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/28">Step {{ index + 1 }}</p>
                  <h3 class="mt-1 text-base font-semibold text-white">{{ step.title }}</h3>
                  <p class="mt-1 text-sm leading-6 text-white/48">{{ step.detail }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-white/[0.07] px-4 py-8 text-center text-xs text-white/28">
      <span>Vindicta, 2026. Built for local-first project flow.</span>
    </footer>

    <Transition name="modal">
      <div v-if="showWaitlist" class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-4 backdrop-blur-sm sm:items-center" @click.self="closeWaitlist">
        <div class="modal-panel w-full max-w-lg rounded-lg border border-white/12 bg-[#111116] p-5 shadow-2xl shadow-black/50">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/70">Coming soon</p>
              <h2 class="mt-2 text-2xl font-bold text-white">Join the platform waitlist</h2>
              <p class="mt-2 text-sm leading-6 text-white/48">Pick a desktop platform and leave an email for launch updates.</p>
            </div>
            <button class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/62 transition hover:bg-white/[0.08] hover:text-white" aria-label="Close waitlist modal" @click="closeWaitlist">
              <X class="size-4" />
            </button>
          </div>

          <form v-if="!submitted" class="mt-6 space-y-5" @submit.prevent="joinWaitlist">
            <div class="grid gap-3 sm:grid-cols-3">
              <label v-for="platform in platforms" :key="platform.value" class="cursor-pointer">
                <input v-model="selectedPlatform" class="peer sr-only" type="radio" name="platform" :value="platform.value">
                <span class="block rounded-lg border border-white/[0.08] bg-white/[0.035] p-3 transition peer-checked:border-indigo-200/50 peer-checked:bg-indigo-300/12">
                  <span class="flex items-center gap-2 text-sm font-semibold text-white/78">
                    <component :is="platform.icon" class="size-4 text-indigo-100" />
                    {{ platform.label }}
                  </span>
                  <span class="mt-1 block text-xs text-white/36">{{ platform.detail }}</span>
                </span>
              </label>
            </div>

            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Email</span>
              <input v-model="email" type="email" required placeholder="you@example.com" class="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-200/45 focus:ring-2 focus:ring-indigo-300/15">
            </label>

            <button type="submit" :disabled="!waitlistValid" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35">
              Join waitlist
              <ArrowRight class="size-4" />
            </button>
          </form>

          <div v-else class="mt-6 rounded-lg border border-emerald-300/18 bg-emerald-300/10 p-4">
            <div class="flex items-start gap-3">
              <CheckCircle2 class="mt-0.5 size-5 shrink-0 text-emerald-200" />
              <div>
                <h3 class="text-sm font-semibold text-white">You are on the list.</h3>
                <p class="mt-1 text-sm leading-6 text-white/50">Vindicta launch updates will go to {{ email.trim() }}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
