-- Tabela de mesas
create table if not exists public.tables (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  name       text not null,
  capacity   int not null default 10 check (capacity > 0),
  created_at timestamptz not null default now()
);

-- Coluna table_id na tabela de guests
alter table public.guests
  add column if not exists table_id uuid references public.tables(id) on delete set null;

-- RLS
alter table public.tables enable row level security;

create policy "couple owns tables" on public.tables
  for all using (
    couple_id in (select id from public.couples where user_id = auth.uid())
  );

-- Indexes
create index if not exists tables_couple_id_idx on public.tables(couple_id);
create index if not exists guests_table_id_idx on public.guests(table_id);
