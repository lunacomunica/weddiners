-- Adiciona coluna save_the_date_status na tabela guests
alter table public.guests
  add column if not exists save_the_date_status text not null default 'nao_enviado'
  check (save_the_date_status in ('nao_enviado', 'enviado', 'visualizado'));
