-- Membros do casal (dono + noivo convidado)
CREATE TABLE IF NOT EXISTS public.couple_members (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz default now(),
  unique(couple_id, user_id)
);

-- Convites pendentes
CREATE TABLE IF NOT EXISTS public.couple_invites (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  token      text not null unique default encode(gen_random_bytes(24), 'hex'),
  used       boolean not null default false,
  created_at timestamptz default now()
);

-- RLS
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;

-- Membros: dono e membros do casal podem ver
CREATE POLICY "couple_members_select" ON public.couple_members
  FOR SELECT USING (
    couple_id IN (
      SELECT id FROM public.couples WHERE user_id = auth.uid()
      UNION
      SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid()
    )
  );

-- Membros: só o dono pode inserir/deletar
CREATE POLICY "couple_members_insert" ON public.couple_members
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid())
  );

CREATE POLICY "couple_members_delete" ON public.couple_members
  FOR DELETE USING (
    couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid())
  );

-- Convites: dono pode criar/ver; qualquer um pode ler pelo token (para a página de aceite)
CREATE POLICY "couple_invites_owner" ON public.couple_invites
  FOR ALL USING (
    couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid())
  );

CREATE POLICY "couple_invites_public_read" ON public.couple_invites
  FOR SELECT USING (true);
