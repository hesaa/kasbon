-- Kasbon: debts table + strict RLS.
-- Forward-only migration. Run via Supabase SQL Editor or `supabase db push`.

create type public.debt_type as enum ('owed_to_me', 'i_owe');

create table public.debts (
  id               uuid primary key default gen_random_uuid(),
  -- default auth.uid() is a safety net; the API also sets it explicitly.
  user_id          uuid not null default auth.uid()
                     references auth.users (id) on delete cascade,
  type             public.debt_type not null,
  counterpart_name text not null,
  amount           bigint not null,                 -- whole Rupiah, never decimals
  note             text,
  -- D1: when the debt happened. WIB date, because the DB clock is UTC.
  debt_date        date not null default ((now() at time zone 'Asia/Jakarta')::date),
  due_date         date,
  settled_at       timestamptz,                     -- null = belum lunas
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint debts_name_len     check (char_length(btrim(counterpart_name)) between 1 and 100),
  constraint debts_amount_range check (amount > 0 and amount <= 1000000000000),
  constraint debts_note_len     check (note is null or char_length(note) <= 200),
  constraint debts_due_after    check (due_date is null or due_date >= debt_date)
);

create index debts_user_date_idx
  on public.debts (user_id, debt_date desc, created_at desc);
create index debts_user_unsettled_idx
  on public.debts (user_id) where settled_at is null;

-- Row-level guard rails + idempotent settle.
-- * id / user_id / created_at can never change (defense in depth next to RLS WITH CHECK).
-- * Settling an already-settled row keeps the ORIGINAL settled_at  => PATCH settled=true is idempotent.
create function public.debts_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id         := old.id;
  new.user_id    := old.user_id;
  new.created_at := old.created_at;
  if old.settled_at is not null and new.settled_at is not null then
    new.settled_at := old.settled_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger debts_before_update
  before update on public.debts
  for each row execute function public.debts_before_update();

-- ---------- Row Level Security ----------
alter table public.debts enable row level security;

-- Nobody unauthenticated touches this table, even via the REST API.
revoke all on table public.debts from anon;
grant select, insert, update, delete on table public.debts to authenticated;

-- (select auth.uid()) is evaluated once per statement (faster than calling auth.uid() per row).
create policy "debts_select_own" on public.debts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "debts_insert_own" on public.debts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "debts_update_own" on public.debts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);   -- also blocks re-assigning a row to someone else

create policy "debts_delete_own" on public.debts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- Summary totals ----------
-- SECURITY INVOKER => runs with the caller's rights, so RLS still applies.
-- Used by the dashboard cards (correct even past PostgREST's 1000-row cap).
create function public.debt_summary()
returns table (owed_to_me bigint, i_owe bigint, open_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(sum(amount) filter (where type = 'owed_to_me'), 0)::bigint,
    coalesce(sum(amount) filter (where type = 'i_owe'), 0)::bigint,
    count(*)::bigint
  from public.debts
  where settled_at is null;
$$;

revoke execute on function public.debt_summary() from public, anon;
grant  execute on function public.debt_summary() to authenticated;
