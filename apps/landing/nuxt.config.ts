import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-12',
  ssr: true,
  modules: [],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Vindicta - Local-first project management for AI-assisted work',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Vindicta is a free local desktop workflow for project tickets, kanban, sprint planning, and AI handovers.' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
