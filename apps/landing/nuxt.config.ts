import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-12',
  ssr: true,
  modules: [],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Vindicta — Local-First Security Workspace',
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Vindicta is a free local desktop security workspace: AI code review, vulnerability findings, dependency inventory, secret checks, and portable scan history — all on your machine.',
        },
        { property: 'og:title', content: 'Vindicta — Local-First Security Workspace' },
        {
          property: 'og:description',
          content: 'AI security scanning, findings tracking, and dependency checks — offline, on your machine.',
        },
        { property: 'og:image', content: '/icon.png' },
        { name: 'theme-color', content: '#1e1f22' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['ogl'],
    },
  },
})
