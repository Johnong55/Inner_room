CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text UNIQUE,
  password_hash text,
  anonymous boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS user_entries (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity text NOT NULL CHECK (entity IN ('journal', 'mood', 'letter', 'conversation', 'thought')),
  entity_id text NOT NULL,
  ciphertext text NOT NULL,
  iv text NOT NULL,
  auth_tag text NOT NULL,
  client_updated_at timestamptz NOT NULL,
  server_updated_at timestamptz NOT NULL DEFAULT now(),
  deleted boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, entity, entity_id)
);

CREATE INDEX IF NOT EXISTS user_entries_sync_idx ON user_entries(user_id, server_updated_at);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deletion_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_user_hash text NOT NULL,
  deleted_at timestamptz NOT NULL DEFAULT now()
);
