<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Server,
  ShieldCheck,
  Wifi,
} from 'lucide-vue-next'

const upcomingFeatures = [
  {
    icon: ShieldCheck,
    title: 'Security Baseline Checks',
    description: 'Automated checks against CIS Benchmarks and STIG guidelines for common server configurations.',
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: Lock,
    title: 'SSH Hardening',
    description: 'Audit SSH daemon configuration — disable root login, enforce key-based auth, restrict ciphers.',
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Wifi,
    title: 'Network Exposure Audit',
    description: 'Scan open ports and services, identify unnecessary attack surface, and recommend firewall rules.',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Server,
    title: 'Service Configuration Review',
    description: 'Analyze running services (nginx, Apache, PostgreSQL, Redis) for insecure default configurations.',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Clock,
    title: 'Patch & Update Status',
    description: 'Track outdated packages and OS patches with CVE mapping and criticality scoring.',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: CheckCircle2,
    title: 'Compliance Reports',
    description: 'Generate hardening reports in PDF/JSON format suitable for audits and compliance reviews.',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
]

const references = [
  { label: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks' },
  { label: 'NIST SP 800-123', url: 'https://csrc.nist.gov/publications/detail/sp/800-123/final' },
  { label: 'STIGs (DISA)', url: 'https://public.cyber.mil/stigs/' },
  { label: 'Lynis — Auditing Tool', url: 'https://cisofy.com/lynis/' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pb-8">
    <!-- Header -->
    <div class="flex items-start gap-4">
      <div class="grid size-12 shrink-0 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
        <Server class="size-6 text-emerald-300" />
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-bold text-[var(--text)]">Server Hardening</h1>
          <span class="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">
            Coming Soon
          </span>
        </div>
        <p class="mt-1 text-sm text-[var(--text-muted)]">
          Automated server configuration auditing and hardening guidance — reduce your infrastructure attack surface.
        </p>
      </div>
    </div>

    <!-- Coming soon banner -->
    <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
      <div class="flex items-start gap-4">
        <Clock class="size-5 text-emerald-300 mt-0.5 shrink-0" />
        <div class="space-y-1">
          <p class="text-sm font-semibold text-emerald-300">In Development</p>
          <p class="text-xs leading-relaxed text-[var(--text-muted)]">
            Server Hardening is the next major module coming to Vindicta's Infrastructure section.
            It will allow you to connect to remote or local servers and run automated hardening audits
            against industry-standard benchmarks — no agent installation required.
          </p>
        </div>
      </div>
    </div>

    <!-- Planned features grid -->
    <div class="space-y-3">
      <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">Planned Features</p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          v-for="feature in upcomingFeatures"
          :key="feature.title"
          class="rounded-xl border bg-[var(--bg-card)] p-4 space-y-2 opacity-70"
          :class="feature.border"
        >
          <div class="flex items-center gap-2.5">
            <div class="grid size-8 shrink-0 place-items-center rounded-lg border" :class="[feature.bg, feature.border]">
              <component :is="feature.icon" class="size-4" :class="feature.color" />
            </div>
            <p class="text-sm font-semibold text-[var(--text)]">{{ feature.title }}</p>
          </div>
          <p class="text-xs leading-relaxed text-[var(--text-muted)]">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- References -->
    <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-3">
      <p class="text-xs font-semibold text-[var(--text)]">Useful Resources</p>
      <p class="text-xs leading-relaxed text-[var(--text-muted)]">
        While this feature is in development, these resources provide excellent manual hardening guidance:
      </p>
      <div class="flex flex-wrap gap-2">
        <a
          v-for="ref in references"
          :key="ref.label"
          :href="ref.url"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text)]"
        >
          <ExternalLink class="size-3" />
          {{ ref.label }}
        </a>
      </div>
    </div>
  </div>
</template>
