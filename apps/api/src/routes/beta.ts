import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { rateLimit } from '../middleware/rateLimit'
import { sendBetaInviteEmail } from '../services/email'
import type { Bindings } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .trim()
    .toLowerCase(),
})

export const betaRouter = new Hono<{ Bindings: Bindings }>()

betaRouter.post('/', rateLimit, zValidator('json', schema), async (c) => {
  const { name, email } = c.req.valid('json')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM beta_requests WHERE email = ?',
  )
    .bind(email)
    .first()

  if (existing) {
    return c.json(
      { error: 'This email is already registered for the beta.' },
      409,
    )
  }

  const token = crypto.randomUUID()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await c.env.DB.prepare(
    'INSERT INTO beta_requests (id, name, email, token, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, name, email, token, now)
    .run()

  const downloadUrl = `${c.env.DOWNLOAD_BASE_URL}/download?token=${token}`

  await sendBetaInviteEmail({ name, email, downloadUrl, apiKey: c.env.RESEND_API_KEY })

  return c.json({ message: 'Check your email for your download link.' }, 201)
})
