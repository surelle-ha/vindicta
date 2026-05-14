import type { NotificationType } from '~/stores/notifications'

export function useNotifications() {
  const store = useNotificationsStore()
  const app = useAppStore()

  function notify(message: string, type: NotificationType = 'info') {
    if (app.notificationsEnabled) {
      store.push(message, type)
    }
  }

  return { notify }
}
