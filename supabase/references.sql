-- ─── Tabela references ───────────────────────────────────────────────────────

create table if not exists public.references (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  category    text not null,
  image_url   text not null,
  note        text,
  source_url  text,
  source_type text check (source_type in ('pinterest', 'instagram', 'upload', 'link')),
  created_at  date not null default current_date
);

-- Índice para queries por couple
create index if not exists references_couple_id_idx on public.references(couple_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.references enable row level security;

-- Cada couple só enxerga os próprios registros
create policy "Couples can view own references"
  on public.references for select
  using (
    couple_id = (
      select id from public.couples where user_id = auth.uid()
    )
  );

create policy "Couples can insert own references"
  on public.references for insert
  with check (
    couple_id = (
      select id from public.couples where user_id = auth.uid()
    )
  );

create policy "Couples can delete own references"
  on public.references for delete
  using (
    couple_id = (
      select id from public.couples where user_id = auth.uid()
    )
  );

-- ─── Storage bucket references ────────────────────────────────────────────────

-- Cria o bucket (execute via Supabase dashboard ou CLI se preferir)
insert into storage.buckets (id, name, public)
values ('references', 'references', false)
on conflict (id) do nothing;

-- Leitura: couple só lê arquivos do próprio prefixo {couple_id}/*
create policy "Couples can read own reference images"
  on storage.objects for select
  using (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = (
      select id::text from public.couples where user_id = auth.uid()
    )
  );

-- Upload: couple só sobe arquivos para o próprio prefixo
create policy "Couples can upload own reference images"
  on storage.objects for insert
  with check (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = (
      select id::text from public.couples where user_id = auth.uid()
    )
  );

-- Delete: couple só deleta arquivos do próprio prefixo
create policy "Couples can delete own reference images"
  on storage.objects for delete
  using (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = (
      select id::text from public.couples where user_id = auth.uid()
    )
  );
