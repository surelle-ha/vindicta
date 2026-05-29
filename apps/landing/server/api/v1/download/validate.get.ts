import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event) as { token?: string }

  if (!token || typeof token !== 'string' || token.length < 32) {
    return { valid: false }
  }

  try {
    const sql  = await useDb()
    const rows = await sql`
      SELECT name FROM beta_signups WHERE token = ${token} LIMIT 1
    `
    if (!rows.length) return { valid: false }
    return { valid: true, name: rows[0]!.name }
  } catch {
    return { valid: false }
  }
})
