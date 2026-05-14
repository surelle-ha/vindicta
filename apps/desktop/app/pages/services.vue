<script setup lang="ts">
import {
  Activity,
  Clock3,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Network,
  Play,
  Plus,
  RotateCcw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Square,
  Terminal,
  Zap,
} from 'lucide-vue-next'

type ServiceStatus = 'running' | 'stopped' | 'warning'

interface ManagedService {
  id: string
  name: string
  engine: string
  description: string
  status: ServiceStatus
  port: number
  version: string
  uptime: string
  cpu: number
  memory: string
  disk: string
  health: string
  icon: typeof Database
  accent: string
  command: string
  env: string[]
  logs: string[]
}

const services: ManagedService[] = [
  {
    id: 'postgres',
    name: 'PostgreSQL',
    engine: 'Database',
    description: 'Primary relational data service',
    status: 'running',
    port: 5432,
    version: '16.x',
    uptime: '2h 14m',
    cpu: 11,
    memory: '384 MB',
    disk: '1.8 GB',
    health: 'Accepting connections',
    icon: Database,
    accent: 'text-sky-300',
    command: 'postgres -D ./services/postgres/data',
    env: ['POSTGRES_DB=vindicta', 'POSTGRES_USER=local', 'PGPORT=5432'],
    logs: [
      'database system is ready to accept connections',
      'checkpoint complete: wrote 42 buffers',
      'autovacuum launcher started',
    ],
  },
  {
    id: 'redis',
    name: 'Redis',
    engine: 'Cache',
    description: 'Fast cache and queue coordination',
    status: 'running',
    port: 6379,
    version: '7.x',
    uptime: '2h 13m',
    cpu: 4,
    memory: '86 MB',
    disk: '128 MB',
    health: 'Responding to PING',
    icon: Zap,
    accent: 'text-red-300',
    command: 'redis-server ./services/redis/redis.conf',
    env: ['REDIS_PORT=6379', 'REDIS_APPENDONLY=yes'],
    logs: [
      'ready to accept connections tcp',
      'background saving started',
      'db saved on disk',
    ],
  },
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    engine: 'Broker',
    description: 'Message broker for async work',
    status: 'warning',
    port: 5672,
    version: '3.x',
    uptime: '18m',
    cpu: 19,
    memory: '512 MB',
    disk: '620 MB',
    health: 'Management plugin pending',
    icon: Network,
    accent: 'text-amber-300',
    command: 'rabbitmq-server',
    env: ['RABBITMQ_NODE_PORT=5672', 'RABBITMQ_MANAGEMENT_PORT=15672'],
    logs: [
      'started TCP listener on [::]:5672',
      'management plugin is not enabled',
      'cluster status: single node',
    ],
  },
  {
    id: 'minio',
    name: 'MinIO',
    engine: 'Object storage',
    description: 'S3-compatible local object storage',
    status: 'stopped',
    port: 9000,
    version: 'latest',
    uptime: '-',
    cpu: 0,
    memory: '0 MB',
    disk: '0 MB',
    health: 'Stopped',
    icon: HardDrive,
    accent: 'text-emerald-300',
    command: 'minio server ./services/minio/data',
    env: ['MINIO_ROOT_USER=local', 'MINIO_BROWSER=on'],
    logs: [
      'service is stopped',
      'waiting for controller integration',
    ],
  },
]

const projects = useProjectsStore()
const selectedServiceId = ref(services[0]?.id ?? '')
const query = ref('')
const activeProject = computed(() => projects.activeProject)

const selectedService = computed(() =>
  services.find(service => service.id === selectedServiceId.value) ?? services[0],
)

const filteredServices = computed(() => {
  const text = query.value.trim().toLowerCase()
  if (!text) return services
  return services.filter(service =>
    [service.name, service.engine, service.description, String(service.port)].some(value =>
      value.toLowerCase().includes(text),
    ),
  )
})

const runningCount = computed(() => services.filter(service => service.status === 'running').length)
const warningCount = computed(() => services.filter(service => service.status === 'warning').length)
const stoppedCount = computed(() => services.filter(service => service.status === 'stopped').length)

const statusClasses: Record<ServiceStatus, string> = {
  running: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  stopped: 'border-white/10 bg-white/[0.04] text-[var(--text-muted)]',
}

const dotClasses: Record<ServiceStatus, string> = {
  running: 'bg-emerald-400 shadow-emerald-400/40',
  warning: 'bg-amber-400 shadow-amber-400/40',
  stopped: 'bg-zinc-500 shadow-zinc-500/20',
}

function cpuBarStyle(cpu: number) {
  return { width: `${Math.min(100, Math.max(0, cpu))}%` }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-5">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <div class="grid size-9 place-items-center rounded-lg border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
            <Server class="size-4" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-[var(--text)]">Service Controller</h1>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">
              {{ activeProject ? `Local service stack for ${activeProject.name}` : 'Local service stack control panel' }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15">
          <Play class="size-3.5" />
          Start Stack
        </button>
        <button class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.07]">
          <Square class="size-3.5" />
          Stop All
        </button>
        <button class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.07]">
          <Plus class="size-3.5" />
          Add Service
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">Running</p>
          <Activity class="size-3.5 text-emerald-300" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ runningCount }}</p>
      </div>
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">Warnings</p>
          <ShieldCheck class="size-3.5 text-amber-300" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ warningCount }}</p>
      </div>
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">Stopped</p>
          <Square class="size-3.5 text-[var(--text-muted)]" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ stoppedCount }}</p>
      </div>
      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-[var(--text-muted)]">Ports</p>
          <Network class="size-3.5 text-indigo-300" />
        </div>
        <p class="mt-2 text-2xl font-semibold text-[var(--text)]">{{ services.length }}</p>
      </div>
    </section>

    <div class="grid min-h-[34rem] gap-5 xl:grid-cols-[1fr_24rem]">
      <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div class="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-semibold text-[var(--text)]">Services</h2>
            <p class="mt-0.5 text-xs text-[var(--text-muted)]">Postgres, Redis, RabbitMQ, and companion services</p>
          </div>
          <label class="relative w-full sm:w-64">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              v-model="query"
              class="h-9 w-full rounded-lg border border-[var(--border)] bg-black/10 pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-indigo-500/40"
              placeholder="Search services"
            >
          </label>
        </div>

        <div class="divide-y divide-[var(--border)]">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            class="grid w-full cursor-pointer gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 lg:grid-cols-[1.2fr_8rem_7rem_10rem_8rem]"
            :class="selectedService?.id === service.id ? 'bg-indigo-500/[0.06]' : ''"
            role="button"
            tabindex="0"
            @click="selectedServiceId = service.id"
            @keydown.enter="selectedServiceId = service.id"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div class="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04]" :class="service.accent">
                <component :is="service.icon" class="size-4" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-semibold text-[var(--text)]">{{ service.name }}</p>
                  <span class="size-1.5 rounded-full shadow-lg" :class="dotClasses[service.status]" />
                </div>
                <p class="mt-0.5 truncate text-xs text-[var(--text-muted)]">{{ service.description }}</p>
              </div>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Status</p>
              <span class="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="statusClasses[service.status]">
                {{ service.status }}
              </span>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Port</p>
              <p class="mt-1 font-mono text-xs text-[var(--text-muted)]">{{ service.port }}</p>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">CPU</p>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div class="h-full rounded-full bg-indigo-400" :style="cpuBarStyle(service.cpu)" />
              </div>
              <p class="mt-1 text-[10px] text-[var(--text-faint)]">{{ service.cpu }}%</p>
            </div>

            <div class="flex items-center gap-2 lg:justify-end">
              <button class="grid size-8 place-items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15" title="Start" @click.stop>
                <Play class="size-3.5" />
              </button>
              <button class="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.07]" title="Stop" @click.stop>
                <Square class="size-3.5" />
              </button>
              <button class="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.07]" title="Restart" @click.stop>
                <RotateCcw class="size-3.5" />
              </button>
            </div>
          </div>

          <div v-if="!filteredServices.length" class="px-4 py-14 text-center">
            <p class="text-sm text-[var(--text-muted)]">No services match the current search.</p>
          </div>
        </div>
      </section>

      <aside v-if="selectedService" class="space-y-5">
        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04]" :class="selectedService.accent">
                <component :is="selectedService.icon" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-[var(--text)]">{{ selectedService.name }}</p>
                <p class="mt-0.5 text-xs text-[var(--text-muted)]">{{ selectedService.engine }} service</p>
              </div>
            </div>
            <span class="inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize" :class="statusClasses[selectedService.status]">
              {{ selectedService.status }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
              <div class="flex items-center gap-2 text-[var(--text-faint)]">
                <Network class="size-3.5" />
                <p class="text-[10px] uppercase tracking-wider">Port</p>
              </div>
              <p class="mt-2 font-mono text-sm text-[var(--text)]">{{ selectedService.port }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
              <div class="flex items-center gap-2 text-[var(--text-faint)]">
                <Clock3 class="size-3.5" />
                <p class="text-[10px] uppercase tracking-wider">Uptime</p>
              </div>
              <p class="mt-2 text-sm text-[var(--text)]">{{ selectedService.uptime }}</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
              <div class="flex items-center gap-2 text-[var(--text-faint)]">
                <Cpu class="size-3.5" />
                <p class="text-[10px] uppercase tracking-wider">CPU</p>
              </div>
              <p class="mt-2 text-sm text-[var(--text)]">{{ selectedService.cpu }}%</p>
            </div>
            <div class="rounded-lg border border-[var(--border)] bg-black/10 p-3">
              <div class="flex items-center gap-2 text-[var(--text-faint)]">
                <Gauge class="size-3.5" />
                <p class="text-[10px] uppercase tracking-wider">Memory</p>
              </div>
              <p class="mt-2 text-sm text-[var(--text)]">{{ selectedService.memory }}</p>
            </div>
          </div>

          <div class="mt-4 rounded-lg border border-[var(--border)] bg-black/10 p-3">
            <div class="flex items-center gap-2 text-[var(--text-faint)]">
              <ShieldCheck class="size-3.5" />
              <p class="text-[10px] uppercase tracking-wider">Health</p>
            </div>
            <p class="mt-2 text-xs text-[var(--text-muted)]">{{ selectedService.health }}</p>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center gap-2">
            <Settings2 class="size-3.5 text-indigo-300" />
            <h2 class="text-sm font-semibold text-[var(--text)]">Runtime</h2>
          </div>
          <div class="mt-3 space-y-3">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Command</p>
              <code class="mt-1 block rounded-lg border border-[var(--border)] bg-black/20 p-2 text-[10px] leading-relaxed text-[var(--text-muted)]">{{ selectedService.command }}</code>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">Environment</p>
              <div class="mt-1 space-y-1">
                <code
                  v-for="item in selectedService.env"
                  :key="item"
                  class="block rounded-lg border border-[var(--border)] bg-black/20 px-2 py-1.5 text-[10px] text-[var(--text-muted)]"
                >
                  {{ item }}
                </code>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Terminal class="size-3.5 text-violet-300" />
              <h2 class="text-sm font-semibold text-[var(--text)]">Logs</h2>
            </div>
            <span class="text-[10px] text-[var(--text-faint)]">{{ selectedService.version }}</span>
          </div>
          <div class="mt-3 max-h-44 space-y-1 overflow-auto custom-scroll rounded-lg border border-[var(--border)] bg-black/25 p-3">
            <p
              v-for="line in selectedService.logs"
              :key="line"
              class="font-mono text-[10px] leading-relaxed text-[var(--text-muted)]"
            >
              <span class="text-indigo-300/70">&gt;</span> {{ line }}
            </p>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
