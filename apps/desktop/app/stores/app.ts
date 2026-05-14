import { defineStore } from 'pinia'

export type AppTheme = 'dark' | 'light'

export interface SmtpSettings {
  enabled: boolean
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromName: string
  fromEmail: string
}

interface AppSettings {
  theme: AppTheme
  notificationsEnabled: boolean
  smtp: SmtpSettings
}

const DEFAULT_SMTP: SmtpSettings = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  username: '',
  password: '',
  fromName: '',
  fromEmail: '',
}

export const useAppStore = defineStore('app', {
  state: (): AppSettings & { launched: boolean } => ({
    launched: false,
    theme: 'dark',
    notificationsEnabled: true,
    smtp: { ...DEFAULT_SMTP },
  }),

  actions: {
    async init() {
      try {
        const { useTauriStore } = await import('~/composables/useTauriStore')
        const store = useTauriStore()
        const saved = await store.get<AppSettings>('app-settings')
        if (saved) {
          this.theme = saved.theme ?? 'dark'
          this.notificationsEnabled = saved.notificationsEnabled ?? true
          this.smtp = { ...DEFAULT_SMTP, ...(saved.smtp ?? {}) }
        }
      }
      catch {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('vindicta-app-settings') : null
        if (raw) {
          try {
            const saved = JSON.parse(raw) as Partial<AppSettings>
            this.theme = saved.theme ?? 'dark'
            this.notificationsEnabled = saved.notificationsEnabled ?? true
            this.smtp = { ...DEFAULT_SMTP, ...(saved.smtp ?? {}) }
          }
          catch { /* ignore */ }
        }
      }
    },

    async enter() {
      this.launched = true
      await this._persist()
    },

    async toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      await this._persist()
    },

    async setNotifications(value: boolean) {
      this.notificationsEnabled = value
      await this._persist()
    },

    async setSmtp(settings: Partial<SmtpSettings>) {
      this.smtp = { ...this.smtp, ...settings }
      await this._persist()
    },

    async _persist() {
      const settings: AppSettings = {
        theme: this.theme,
        notificationsEnabled: this.notificationsEnabled,
        smtp: this.smtp,
      }
      try {
        const { useTauriStore } = await import('~/composables/useTauriStore')
        const store = useTauriStore()
        await store.set('app-settings', settings)
        await store.save()
      }
      catch {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vindicta-app-settings', JSON.stringify(settings))
        }
      }
    },
  },
})
