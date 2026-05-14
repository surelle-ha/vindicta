<script setup lang="ts">
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'
import type { AppNotification } from '~/stores/notifications'

const store = useNotificationsStore()

const icons: Record<AppNotification['type'], any> = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
}

const colors: Record<AppNotification['type'], string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error:   'border-red-500/30 bg-red-500/10 text-red-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  info:    'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
}

const iconColors: Record<AppNotification['type'], string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-indigo-400',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-4"
      >
        <div
          v-for="notif in store.items"
          :key="notif.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg max-w-xs w-full"
          :class="colors[notif.type]"
        >
          <component :is="icons[notif.type]" class="size-4 shrink-0" :class="iconColors[notif.type]" />
          <p class="flex-1 text-xs font-medium text-[var(--text)]">{{ notif.message }}</p>
          <button
            class="shrink-0 size-4 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            @click="store.dismiss(notif.id)"
          >
            <X class="size-3" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
