alter table public.guests
  add column if not exists guest_type text default 'adulto' check (guest_type in ('adulto', 'crianca')),
  add column if not exists child_age int check (child_age >= 0 and child_age <= 17);
