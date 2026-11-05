BEGIN;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
CREATE TABLE IF NOT EXISTS sync_operations (
  change_id UUID PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES portal_users(id),
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted','conflict','forbidden')),
  server_version INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
