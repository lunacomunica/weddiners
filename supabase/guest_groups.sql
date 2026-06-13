-- Tabela de grupos de convidados
create table if not exists public.guest_groups (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  name       text not null,
  token      uuid not null default gen_random_uuid(), -- token único para o link de RSVP
  created_at timestamptz not null default now()
);

-- Coluna group_id na tabela de guests
alter table public.guests
  add column if not exists group_id uuid references public.guest_groups(id) on delete set null;

-- RLS
alter table public.guest_groups enable row level security;

create policy "couple owns groups" on public.guest_groups
  for all using (
    couple_id in (select id from public.couples where user_id = auth.uid())
  );

-- Leitura pública do grupo via token (para o RSVP público)
create policy "public read group by token" on public.guest_groups
  for select using (true);

create index if not exists guest_groups_couple_id_idx on public.guest_groups(couple_id);
create index if not exists guest_groups_token_idx on public.guest_groups(token);
create index if not exists guests_group_id_idx on public.guests(group_id);
