import { neon } from '@neondatabase/serverless'

let initialized = false

export async function useDb() {
  const config = useRuntimeConfig()
  const sql = neon(config.databaseUrl)

  if (!initialized) {
    await sql`
      CREATE TABLE IF NOT EXISTS beta_signups (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL UNIQUE,
        token      TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    initialized = true
  }

  return sql
}
