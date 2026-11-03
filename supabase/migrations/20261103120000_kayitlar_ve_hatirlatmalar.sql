-- Kayıtlar, hatırlatmalar ve bildirim abonelikleri.
-- Tarihli her şey (görev, toplantı, sınav, randevu, seyahat…) tek bir items tablosunda tutulur;
-- modül ekranları bu tablonun filtrelenmiş görünümleridir.

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  notes text check (char_length(notes) <= 2000),
  module text not null default 'genel'
    check (module in ('genel', 'is', 'okul', 'bakim', 'seyahat', 'yemek', 'alisveris', 'finans', 'kisisel')),
  kind text not null default 'gorev'
    check (kind in ('gorev', 'etkinlik', 'toplanti', 'sinav', 'odev', 'randevu', 'odeme', 'seyahat')),
  starts_at timestamptz,
  ends_at timestamptz,
  repeat text check (repeat in ('gunluk', 'haftalik', 'aylik', 'yillik')),
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index items_user_starts_idx on public.items (user_id, starts_at);

-- Bir kayda birden çok hatırlatma eklenebilir (ör. 1 gün önce + 1 saat önce).
-- sent_for: bu hatırlatmanın en son hangi tekrar (starts_at) için gönderildiği.
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  offset_minutes integer not null default 0 check (offset_minutes between 0 and 43200),
  sent_for timestamptz,
  unique (item_id, offset_minutes)
);

create index reminders_item_idx on public.reminders (item_id);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- Herkes yalnızca kendi kayıtlarını görür ve değiştirir.
alter table public.items enable row level security;
alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "kendi kayıtları" on public.items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "kendi hatırlatmaları" on public.reminders
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.items i where i.id = item_id and i.user_id = (select auth.uid()))
  );

create policy "kendi abonelikleri" on public.push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Tekrar türünden bir sonraki adımın aralığı.
create function public.repeat_step(repeat text)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case repeat
    when 'gunluk' then interval '1 day'
    when 'haftalik' then interval '1 week'
    when 'aylik' then interval '1 month'
    when 'yillik' then interval '1 year'
  end
$$;

-- Zamanlayıcının her dakika çağırdığı iş:
-- 1) Zamanı geçmiş tekrarlayan kayıtları bir sonraki tekrara taşır (tamamlandı işaretini sıfırlar).
-- 2) Zamanı gelmiş hatırlatmaları "gönderildi" diye işaretler ve gönderilecekleri döndürür.
-- Son 6 saatten eski kaçmış hatırlatmalar gönderilmez; telefon gece birden dolmasın.
create function public.claim_due_reminders()
returns table (
  reminder_id uuid,
  owner_id uuid,
  item_id uuid,
  title text,
  module text,
  starts_at timestamptz,
  offset_minutes integer
)
language sql
security definer
set search_path = ''
as $$
  update public.items i
  set starts_at = n.next_start,
      ends_at = i.ends_at + (n.next_start - i.starts_at),
      done_at = null
  from (
    select x.id,
      (
        select min(g)
        from generate_series(x.starts_at, now() + interval '1 year 1 day', public.repeat_step(x.repeat)) g
        where g > now()
      ) as next_start
    from public.items x
    where x.repeat is not null and x.starts_at < now() - interval '2 minutes'
  ) n
  where i.id = n.id and n.next_start is not null;

  with due as (
    select r.id, r.user_id, i.id as item_id, i.title, i.module, i.starts_at, r.offset_minutes
    from public.reminders r
    join public.items i on i.id = r.item_id
    where i.starts_at is not null
      and i.done_at is null
      and r.sent_for is distinct from i.starts_at
      and i.starts_at - make_interval(mins => r.offset_minutes) <= now()
      and i.starts_at - make_interval(mins => r.offset_minutes) > now() - interval '6 hours'
    for update of r skip locked
  ),
  marked as (
    update public.reminders r set sent_for = due.starts_at from due where r.id = due.id returning r.id
  )
  select due.id, due.user_id, due.item_id, due.title, due.module, due.starts_at, due.offset_minutes
  from due
  where due.id in (select id from marked);
$$;

revoke execute on function public.claim_due_reminders() from public, anon, authenticated;
grant execute on function public.claim_due_reminders() to service_role;

-- Her dakika bildirim fonksiyonunu çağıran zamanlayıcı.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'hatirlatmalari-gonder',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://fesncrlztmdmaucnsbyw.supabase.co/functions/v1/send-reminders',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    )
  $$
);
