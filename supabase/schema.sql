-- Supabase schema for production deployment
-- Run in Supabase SQL editor

create table if not exists audits (
  id text primary key,
  created_at timestamptz not null default now(),
  input jsonb not null,
  result jsonb not null,
  ai_summary text
);

create table if not exists leads (
  id text primary key,
  audit_id text not null references audits(id) on delete cascade,
  email text not null,
  company_name text,
  role text,
  team_size int,
  high_savings boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists leads_audit_id_idx on leads(audit_id);
create index if not exists leads_email_idx on leads(email);

alter table audits enable row level security;
alter table leads enable row level security;

-- Service role bypasses RLS; anon has no direct access
