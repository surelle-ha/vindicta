import type { Component } from 'vue'

export interface ContextMenuItem {
  label?: string
  icon?: Component
  action?: () => void
  separator?: boolean
  disabled?: boolean
  danger?: boolean
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
}

const state = reactive<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  items: [],
})

export function useContextMenu() {
  function show(items: ContextMenuItem[], event: MouseEvent) {
    event.preventDefault()
    state.items = items
    state.visible = true

    // Position within viewport
    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuW = 180
    const menuH = items.length * 32 + 16
    state.x = event.clientX + menuW > vw ? event.clientX - menuW : event.clientX
    state.y = event.clientY + menuH > vh ? event.clientY - menuH : event.clientY
  }

  function hide() {
    state.visible = false
  }

  return { state, show, hide }
}
