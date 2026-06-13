-- Tabela de parcelas de pagamento de fornecedores
create table if not exists public.vendor_payments (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  couple_id   uuid not null references public.couples(id) on delete cascade,
  installment_number int not null default 1,
  amount      numeric(10,2) not null,
  due_date    date not null,
  paid        boolean not null default false,
  paid_at     timestamptz,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Campo forma de pagamento na tabela de vendors
alter table public.vendors
  add column if not exists payment_method text;

-- RLS
alter table public.vendor_payments enable row level security;

create policy "couple owns payments" on public.vendor_payments
  for all using (
    couple_id in (
      select id from public.couples where user_id = auth.uid()
    )
  );

-- Index
create index if not exists vendor_payments_vendor_id_idx on public.vendor_payments(vendor_id);
create index if not exists vendor_payments_couple_id_idx on public.vendor_payments(couple_id);
create index if not exists vendor_payments_due_date_idx on public.vendor_payments(due_date);
