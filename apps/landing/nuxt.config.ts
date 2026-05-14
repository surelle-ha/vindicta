import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-12',
  ssr: true,
  modules: [],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Vindicta — Vibe-coded project management',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Project management built for solo devs and small teams. Offline-first, no sign-up required.' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
