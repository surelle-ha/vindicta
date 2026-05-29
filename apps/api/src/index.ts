import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { betaRouter } from './routes/beta'
import { downloadRouter } from './routes/download'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = ['https://vindicta.surelle.xyz', 'http://localhost:3002']
      return allowed.includes(origin) ? origin : null
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.route('/api/v1/beta', betaRouter)
app.route('/api/v1/download', downloadRouter)

app.notFound((c) => c.json({ error: 'Not found.' }, 404))

export default app
