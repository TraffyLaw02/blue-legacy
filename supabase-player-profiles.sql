begin;

create or replace function public.normalize_player_name_part(value text)
returns text
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  select lower(regexp_replace(btrim(value), '[[:space:]]+', ' ', 'g'));
$$;

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 40),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 40),
  d_cosmetic boolean not null default false,
  normalized_name text generated always as (
    public.normalize_player_name_part(last_name) || ' ' ||
    public.normalize_player_name_part(first_name)
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists player_profiles_normalized_name_key
  on public.player_profiles (normalized_name);

alter table public.player_profiles enable row level security;

drop policy if exists "Public profiles are readable" on public.player_profiles;
create policy "Public profiles are readable"
  on public.player_profiles for select
  to authenticated
  using (true);

drop policy if exists "Users insert their own public profile" on public.player_profiles;
create policy "Users insert their own public profile"
  on public.player_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own public profile" on public.player_profiles;
create policy "Users update their own public profile"
  on public.player_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on table public.player_profiles from anon;
grant select, insert, update on table public.player_profiles to authenticated;

create or replace function public.upsert_player_profile(
  p_first_name text,
  p_last_name text,
  p_d_cosmetic boolean default false
)
returns setof public.player_profiles
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_first_name text := regexp_replace(btrim(coalesce(p_first_name, '')), '[[:space:]]+', ' ', 'g');
  v_last_name text := regexp_replace(btrim(coalesce(p_last_name, '')), '[[:space:]]+', ' ', 'g');
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if char_length(v_first_name) not between 1 and 40 or char_length(v_last_name) not between 1 and 40 then
    raise exception 'Invalid player name' using errcode = '22023';
  end if;

  insert into public.player_profiles (user_id, first_name, last_name, d_cosmetic)
  values (v_user_id, v_first_name, v_last_name, coalesce(p_d_cosmetic, false))
  on conflict (user_id) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        d_cosmetic = excluded.d_cosmetic,
        updated_at = now();

  update public.monthly_leaderboard
    set player_first_name = v_first_name,
        player_last_name = v_last_name,
        player_d_cosmetic = coalesce(p_d_cosmetic, false)
    where user_id = v_user_id
      and month_key = to_char(timezone('UTC', now()), 'YYYY-MM');

  return query select * from public.player_profiles where user_id = v_user_id;
end;
$$;

create or replace function public.set_player_profile_d_cosmetic(p_d_cosmetic boolean)
returns setof public.player_profiles
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  update public.player_profiles
    set d_cosmetic = coalesce(p_d_cosmetic, false), updated_at = now()
    where user_id = v_user_id;

  if not found then
    raise exception 'Public player profile missing' using errcode = 'P0002';
  end if;

  update public.monthly_leaderboard
    set player_d_cosmetic = coalesce(p_d_cosmetic, false)
    where user_id = v_user_id
      and month_key = to_char(timezone('UTC', now()), 'YYYY-MM');

  return query select * from public.player_profiles where user_id = v_user_id;
end;
$$;

revoke all on function public.upsert_player_profile(text, text, boolean) from public, anon;
revoke all on function public.set_player_profile_d_cosmetic(boolean) from public, anon;
grant execute on function public.upsert_player_profile(text, text, boolean) to authenticated;
grant execute on function public.set_player_profile_d_cosmetic(boolean) to authenticated;

commit;
