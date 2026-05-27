<script setup lang="ts">
import { Activity, Award, BookOpenCheck, GraduationCap, LogIn, MapPin, RotateCcw, UserCircle2 } from 'lucide-vue-next'
import { LESSONS, TOTAL_DAYS } from '~/data/curriculum'

const user = useUserStore()
const academy = useAcademyStore()
const router = useRouter()

const name = ref(user.name)
const email = ref(user.email)
const jobRole = ref(user.jobRole || 'Security Practitioner')

const roles = ['Security Practitioner', 'Developer', 'DevSecOps', 'Pentester', 'Blue Team Analyst', 'Security Engineer', 'Tech Lead', 'Other']
const saved = ref(false)

async function saveProfile() {
  await user.save({ name: name.value.trim(), email: email.value.trim(), jobRole: jobRole.value })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

const initials = computed(() => {
  const n = (name.value || user.name || 'U').trim()
  return n.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})

const tokenUsage = computed(() => user.tokenUsage)
const formattedTotalTokens = computed(() => tokenUsage.value.totalTokens.toLocaleString())
const lastTokenUse = computed(() => {
  if (!tokenUsage.value.lastUsedAt) return 'No AI usage recorded yet'
  return new Date(tokenUsage.value.lastUsedAt).toLocaleString()
})

const academyProgress = computed(() => academy.progressPercent)
const totalLessons = TOTAL_DAYS
const lastLesson = computed(() => {
  if (academy.lastVisitedLessonId) {
    return LESSONS.find(lesson => lesson.id === academy.lastVisitedLessonId) ?? null
  }
  return LESSONS.find(lesson => !academy.isCompleted(lesson.id)) ?? LESSONS[0] ?? null
})
const completedLessons = computed(() => academy.completedCount)
const academyStatus = computed(() => {
  if (academy.allCompleted) return 'Completed'
  if (completedLessons.value > 0) return 'In progress'
  return 'Ready to begin'
})
const badgeTitle = computed(() => {
  if (academy.allCompleted) return 'Security Engineering Graduate'
  if (completedLessons.value >= 15) return 'Pentest Practitioner'
  if (completedLessons.value >= 5) return 'Security Foundations'
  return 'Security Initiate'
})
const badgeSubtitle = computed(() => {
  if (academy.allCompleted) return 'Badge composition ready for export.'
  return 'Badge will evolve as Academy milestones are completed.'
})

onMounted(() => {
  void academy.loadFromDisk()
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6 space-y-6">
    <section class="isolate overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div class="relative z-0 h-52 overflow-hidden">
        <Dither
          class="pointer-events-none z-0 opacity-90"
          :wave-speed="0.03"
          :wave-frequency="2.5"
          :wave-amplitude="0.36"
          :wave-color="[0.34, 0.36, 0.9]"
          :color-num="5"
          :pixel-size="2"
          :disable-animation="false"
          :enable-mouse-interaction="false"
          :mouse-radius="0.8"
        />
        <div class="absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
      </div>

      <div class="relative z-20 px-5 pb-5 sm:px-6">
        <div class="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="relative z-30 shrink-0 rounded-full bg-[var(--bg-card)] p-1 shadow-xl shadow-black/30">
            <div class="size-28 rounded-full border border-indigo-300/25 bg-gradient-to-br from-indigo-500 via-violet-600 to-sky-500 grid place-items-center">
              <span class="text-3xl font-bold text-white drop-shadow-sm">{{ initials }}</span>
            </div>
          </div>
          <div class="min-w-0 flex-1 pb-1">
            <h1 class="truncate text-2xl font-bold text-[var(--text)]">{{ user.name || 'No name set' }}</h1>
            <p class="truncate text-sm text-[var(--text-muted)]">{{ user.email || 'No email set' }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <GlassBadge variant="purple">{{ user.jobRole || 'Developer' }}</GlassBadge>
              <GlassBadge variant="info">{{ tokenUsage.runs }} AI run{{ tokenUsage.runs !== 1 ? 's' : '' }}</GlassBadge>
            </div>
          </div>
          <GlassButton size="sm" class="self-start sm:self-end" @click="router.push('/login')">
            <LogIn class="size-3.5" />
            Sign In
          </GlassButton>
        </div>

        <div class="mt-5 flex items-start gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] p-3">
          <UserCircle2 class="size-4 text-indigo-300 mt-0.5 shrink-0" />
          <p class="text-xs leading-relaxed text-[var(--text-muted)]">
            GitHub and Google login are being prepared. For now, Vindicta keeps this profile and AI activity history locally on this device.
          </p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside class="space-y-6">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
          <div>
            <p class="text-sm font-semibold text-[var(--text)]">Edit Profile</p>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">This identity stays local until sign-in is ready.</p>
          </div>
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Name</label>
            <GlassInput v-model="name" placeholder="Your name" @keydown.enter="saveProfile" />
          </div>
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Email</label>
            <GlassInput v-model="email" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label class="text-xs text-[var(--text-muted)] mb-1.5 block">Role</label>
            <GlassSelect v-model="jobRole" class="w-full">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </GlassSelect>
          </div>
          <GlassButton size="sm" @click="saveProfile">
            {{ saved ? 'Saved!' : 'Save changes' }}
          </GlassButton>
        </div>

        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Activity class="size-3.5 text-indigo-300" />
              <p class="text-sm font-semibold text-[var(--text)]">AI Usage</p>
            </div>
            <GlassButton variant="ghost" size="sm" @click="user.resetTokenUsage()">
              <RotateCcw class="size-3.5" />
              Reset
            </GlassButton>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Total</p>
              <p class="text-lg font-semibold text-[var(--text)]">{{ formattedTotalTokens }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Runs</p>
              <p class="text-lg font-semibold text-[var(--text)]">{{ tokenUsage.runs }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Input</p>
              <p class="text-sm font-medium text-indigo-300">{{ tokenUsage.inputTokens.toLocaleString() }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Output</p>
              <p class="text-sm font-medium text-violet-300">{{ tokenUsage.outputTokens.toLocaleString() }}</p>
            </div>
          </div>

          <p class="text-xs text-[var(--text-muted)]">{{ lastTokenUse }}</p>
        </div>
      </aside>

      <main class="space-y-6">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <GraduationCap class="size-4 text-indigo-300" />
              <div>
                <p class="text-sm font-semibold text-[var(--text)]">Academy Progress</p>
                <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ academyStatus }}</p>
              </div>
            </div>
            <GlassBadge variant="info">{{ completedLessons }}/{{ totalLessons }}</GlassBadge>
          </div>

          <div>
            <div class="flex items-center justify-between text-[10px] text-[var(--text-faint)]">
              <span>Overall progress</span>
              <span>{{ academyProgress }}%</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400" :style="{ width: `${academyProgress}%` }" />
            </div>
          </div>

          <div class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <div class="flex items-start gap-2">
              <MapPin class="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
              <div class="min-w-0">
                <p class="text-xs font-semibold text-[var(--text)]">Where you left off</p>
                <p class="mt-1 truncate text-sm text-[var(--text)]">{{ lastLesson ? `Lesson ${lastLesson.day}: ${lastLesson.title}` : 'Academy not started yet' }}</p>
                <p class="mt-1 text-[11px] text-[var(--text-muted)]">{{ lastLesson?.duration ?? 'Start the first lesson whenever you are ready.' }}</p>
              </div>
            </div>
          </div>

          <GlassButton size="sm" @click="router.push('/academy')">
            <BookOpenCheck class="size-3.5" />
            Continue Academy
          </GlassButton>
        </div>

        <div class="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div class="flex items-start gap-4">
            <div class="grid size-16 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-gradient-to-br from-amber-500/25 via-violet-500/15 to-emerald-500/20">
              <Award class="size-8 text-amber-200" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">Badge Composer</p>
              <h2 class="mt-1 text-lg font-bold text-[var(--text)]">{{ badgeTitle }}</h2>
              <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ badgeSubtitle }}</p>
              <div class="mt-3 grid gap-2 sm:grid-cols-3">
                <div class="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p class="text-[10px] text-[var(--text-faint)]">Academy</p>
                  <p class="text-sm font-semibold text-[var(--text)]">{{ academyProgress }}%</p>
                </div>
                <div class="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p class="text-[10px] text-[var(--text-faint)]">Milestone</p>
                  <p class="truncate text-sm font-semibold text-[var(--text)]">{{ badgeTitle }}</p>
                </div>
                <div class="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                  <p class="text-[10px] text-[var(--text-faint)]">Status</p>
                  <p class="text-sm font-semibold text-amber-200">Prepared</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
