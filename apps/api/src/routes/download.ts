import { Hono } from 'hono'
import type { Bindings } from '../types'

export const downloadRouter = new Hono<{ Bindings: Bindings }>()

downloadRouter.get('/validate', async (c) => {
  const token = c.req.query('token')

  if (!token) {
    return c.json({ valid: false, error: 'No token provided.' }, 400)
  }

  const row = await c.env.DB.prepare(
    'SELECT name FROM beta_requests WHERE token = ?',
  )
    .bind(token)
    .first<{ name: string }>()

  if (!row) {
    return c.json({ valid: false, error: 'Invalid or expired token.' }, 404)
  }

  return c.json({ valid: true, name: row.name })
})
