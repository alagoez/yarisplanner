-- Basit listeler (alınacaklar, filmler, hedefler, birikim hedefleri…) ve haftalık akşam yemeği planı.
-- Tarihli ve hatırlatmalı şeyler (özel günler, ödemeler, randevular) items tablosunda kalır.

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  list text not null check (char_length(list) between 1 and 40),
  title text not null check (char_length(title) between 1 and 200),
  category text check (char_length(category) <= 40),
  amount numeric(12, 2) check (amount >= 0),
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index list_items_user_list_idx on public.list_items (user_id, list);

-- Gün başına bir akşam yemeği
create table public.meals (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  meal text not null check (char_length(meal) between 1 and 200),
  primary key (user_id, day)
);

alter table public.list_items enable row level security;
alter table public.meals enable row level security;

create policy "kendi liste kayıtları" on public.list_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "kendi yemekleri" on public.meals
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
