-- +goose Up
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  external_issuer text not null,
  external_subject text not null,
  email text not null default '',
  name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_issuer, external_subject)
);

create table if not exists auth_sessions (
  id text primary key,
  issuer text not null,
  subject text not null,
  refresh_token text not null,
  claims jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  upstream_expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists auth_sessions_identity_idx
  on auth_sessions (issuer, subject);

create index if not exists auth_sessions_expires_at_idx
  on auth_sessions (expires_at)
  where revoked_at is null;

-- +goose Down
drop index if exists auth_sessions_expires_at_idx;
drop index if exists auth_sessions_identity_idx;
drop table if exists auth_sessions;
drop table if exists app_users;
