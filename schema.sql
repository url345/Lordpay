create table charges (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null default encode(gen_random_bytes(12),'hex'),
  amount_cents integer not null check (amount_cents > 0),
  description text,
  status text not null default 'pending'
    check (status in ('pending','paid','expired','cancelled')),
  provider text, provider_charge_id text,
  pix_copy_paste text, pix_qr_base64 text,
  external_ref text unique,
  created_at timestamptz default now(), paid_at timestamptz,
  unique (provider, provider_charge_id)
);
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null, event_id text not null,
  payload jsonb, received_at timestamptz default now(),
  unique (provider, event_id)
);
alter table charges enable row level security;
alter table webhook_events enable row level security;
create policy admin_read_charges on charges for select
  using (auth.jwt() ->> 'email' = 'TROQUE_PELO_SEU_EMAIL');
create policy admin_read_events on webhook_events for select
  using (auth.jwt() ->> 'email' = 'TROQUE_PELO_SEU_EMAIL');
