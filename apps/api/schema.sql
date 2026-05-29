CREATE TABLE IF NOT EXISTS beta_requests (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  email   TEXT NOT NULL UNIQUE,
  token   TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_beta_email ON beta_requests (email);
CREATE INDEX IF NOT EXISTS idx_beta_token ON beta_requests (token);
