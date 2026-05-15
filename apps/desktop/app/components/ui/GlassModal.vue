<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  closeable?: boolean
}>(), {
  closeable: true,
})

const emit = defineEmits<{
  close: []
}>()

const model = defineModel<boolean>()

function close() {
  if (model.value && props.closeable === false) return
  model.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="model"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        />

        <!-- Panel -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            v-if="model"
            class="relative glass flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden sm:max-h-[calc(100dvh-2rem)]"
            :class="[
              maxWidth === 'sm' ? 'max-w-sm' :
              maxWidth === 'lg' ? 'max-w-2xl' :
              maxWidth === 'xl' ? 'max-w-4xl' :
              'max-w-lg',
            ]"
          >
            <div v-if="title" class="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
              <h2 class="min-w-0 truncate text-base font-semibold text-white">{{ title }}</h2>
              <button
                v-if="closeable"
                class="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                @click="close"
              >
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 custom-scroll sm:p-6">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
