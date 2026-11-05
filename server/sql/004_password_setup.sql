BEGIN;
CREATE TABLE IF NOT EXISTS password_setup_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_setup_expiry_idx ON password_setup_tokens (expires_at);
COMMIT;
