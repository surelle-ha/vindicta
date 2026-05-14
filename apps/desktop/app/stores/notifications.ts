export type NotificationType = 'info' | 'success' | 'error' | 'warning'

export interface AppNotification {
  id: string
  message: string
  type: NotificationType
  at: number
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as AppNotification[],
  }),
  actions: {
    push(message: string, type: NotificationType = 'info') {
      const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      this.items.push({ id, message, type, at: Date.now() })
      setTimeout(() => this.dismiss(id), 4000)
    },
    dismiss(id: string) {
      this.items = this.items.filter(n => n.id !== id)
    },
  },
})
