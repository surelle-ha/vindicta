import type { Context, Next } from 'hono'
import type { Bindings } from '../types'

const MAX_REQUESTS = 3
const WINDOW_SECONDS = 3600

export async function rateLimit(c: Context<{ Bindings: Bindings }>, next: Next) {
  const ip =
    c.req.header('CF-Connecting-IP') ??
    c.req.header('X-Forwarded-For') ??
    'unknown'
  const key = `rl:beta:${ip}`

  const raw = await c.env.RATE_LIMIT_KV.get(key)
  const count = raw ? parseInt(raw, 10) : 0

  if (count >= MAX_REQUESTS) {
    return c.json({ error: 'Too many requests. Please try again in an hour.' }, 429)
  }

  await c.env.RATE_LIMIT_KV.put(key, String(count + 1), {
    expirationTtl: WINDOW_SECONDS,
  })

  await next()
}
