<script setup lang="ts">
const { state, hide } = useContextMenu()

function runItem(item: { action?: () => void }) {
  item.action?.()
  hide()
}

onMounted(() => {
  document.addEventListener('click', hide)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', hide)
  document.removeEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') hide()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,transform] duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-[opacity,transform] duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="state.visible"
        class="fixed z-[9999] min-w-[160px] py-1 rounded-lg bg-[#1a1a1e] border border-white/[0.1] shadow-xl shadow-black/50"
        :style="{ left: `${state.x}px`, top: `${state.y}px` }"
        @click.stop
      >
        <template v-for="(item, i) in state.items" :key="i">
          <div v-if="item.separator" class="h-px bg-white/[0.07] my-1" />
          <button
            v-else
            class="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors"
            :class="[
              item.disabled
                ? 'text-white/20 cursor-not-allowed'
                : item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white/65 hover:text-white hover:bg-white/[0.07]',
            ]"
            :disabled="item.disabled"
            @click="runItem(item)"
          >
            <component :is="item.icon" v-if="item.icon" class="size-3.5 shrink-0" />
            {{ item.label }}
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
