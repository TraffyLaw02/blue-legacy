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

create or replace function public.normalize_player_name_for_moderation(value text)
returns text
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  select btrim(regexp_replace(
    translate(replace(replace(lower(regexp_replace(value, '[[:cntrl:]]+', '', 'g')), 'œ', 'oe'), 'æ', 'ae'),
      'àáâäãåçèéêëìíîïñòóôöõùúûüýÿ0134@5$789!',
      'aaaaaaceeeeiiiinooooouuuuyyoieaasstbgi'),
    '[^a-z]+', ' ', 'g'));
$$;

-- IMPORTANT : garder ces catégories et leurs cas de test synchronisés avec leaderboard.js.
create or replace function public.player_name_has_strict_forbidden_content(value text)
returns boolean
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  with forms as (
    select
      public.normalize_player_name_for_moderation(value) as normalized
  ), compacted as (
    select
      normalized,
      replace(normalized, ' ', '') as compact
    from forms
  ), blocked(term) as (
    select unnest(array[
      'nigger','nigga','negro','negre','bougnoule','bamboula','gook','chink',
      'kike','yid','raghead','sandnigger','towelhead','paki','chinetoque',
      'youpin','youpine','feuj','salejuif','salejuive','bicot','crouille',
      'moukere','faggot','tranny','shemale','pede','pedale','tafiole','tapette','gouine'
    ]::text[])
  )
  select exists (
    select 1
    from compacted, blocked
    where case
      when char_length(term) <= 4 then
        compact = term or term = any(regexp_split_to_array(normalized, '[[:space:]]+'))
      else
        position(term in compact) > 0
    end
  );
$$;

create or replace function public.player_name_has_general_profanity(value text)
returns boolean
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from regexp_split_to_table(public.normalize_player_name_for_moderation(value), '[[:space:]]+') token
    where token = any(array[
      'abruti','abrutie','batard','batarde','bite','bordel','con','connard','connasse',
      'couille','couilles','encule','enculee','fdp','merde','pute','salope','salaud',
      'asshole','bitch','cunt','fuck','fucker','motherfucker','retard','shit','slut','whore'
    ]::text[])
  );
$$;

create or replace function public.player_name_part_is_allowed(value text)
returns boolean
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  select not public.player_name_has_strict_forbidden_content(value)
    and not public.player_name_has_general_profanity(value);
$$;

create or replace function public.player_identity_is_allowed(first_name text, last_name text)
returns boolean
language sql
immutable
strict
parallel safe
set search_path = pg_catalog
as $$
  select public.player_name_part_is_allowed(first_name)
    and public.player_name_part_is_allowed(last_name);
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

alter table public.player_profiles
  drop constraint if exists player_profiles_allowed_public_name;
alter table public.player_profiles
  add constraint player_profiles_allowed_public_name check (
    public.player_identity_is_allowed(first_name, last_name)
  ) not valid;

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
  if public.player_name_has_strict_forbidden_content(v_first_name)
    or public.player_name_has_strict_forbidden_content(v_last_name) then
    raise exception 'Forbidden discriminatory player name' using errcode = '22023';
  end if;
  if public.player_name_has_general_profanity(v_first_name)
    or public.player_name_has_general_profanity(v_last_name) then
    raise exception 'Forbidden profanity player name' using errcode = '22023';
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

-- Classement mensuel : jusqu'à trois titres issus des arcs légendaires.
alter table public.monthly_leaderboard
  add column if not exists legendary_titles text[] not null default '{}'::text[];

alter table public.monthly_leaderboard
  drop constraint if exists monthly_leaderboard_allowed_public_name;
alter table public.monthly_leaderboard
  add constraint monthly_leaderboard_allowed_public_name check (
    public.player_identity_is_allowed(player_first_name, player_last_name)
  ) not valid;

-- L'ancienne signature doit être retirée pour éviter une résolution RPC ambiguë dans PostgREST.
drop function if exists public.submit_monthly_score(text, text, text, boolean, text, text, boolean, integer);

create or replace function public.submit_monthly_score(
  p_month_key text,
  p_player_first_name text,
  p_player_last_name text,
  p_player_d_cosmetic boolean,
  p_character_name text,
  p_character_title text,
  p_legendary_titles text[] default '{}'::text[],
  p_dream_completed boolean default false,
  p_score integer default 1
)
returns setof public.monthly_leaderboard
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_first_name text := regexp_replace(btrim(coalesce(p_player_first_name, '')), '[[:space:]]+', ' ', 'g');
  v_last_name text := regexp_replace(btrim(coalesce(p_player_last_name, '')), '[[:space:]]+', ' ', 'g');
  v_character_name text := left(regexp_replace(btrim(coalesce(p_character_name, 'Légende sans nom')), '[[:space:]]+', ' ', 'g'), 100);
  v_character_title text := nullif(left(regexp_replace(btrim(coalesce(p_character_title, '')), '[[:space:]]+', ' ', 'g'), 120), '');
  v_legendary_titles text[];
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if char_length(v_first_name) not between 1 and 40 or char_length(v_last_name) not between 1 and 40 then
    raise exception 'Invalid player name' using errcode = '22023';
  end if;
  if public.player_name_has_strict_forbidden_content(v_first_name)
    or public.player_name_has_strict_forbidden_content(v_last_name) then
    raise exception 'Forbidden discriminatory player name' using errcode = '22023';
  end if;
  if public.player_name_has_general_profanity(v_first_name)
    or public.player_name_has_general_profanity(v_last_name) then
    raise exception 'Forbidden profanity player name' using errcode = '22023';
  end if;
  if p_month_key !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' or p_score not between 1 and 100 then
    raise exception 'Invalid monthly score' using errcode = '22023';
  end if;

  select coalesce(array_agg(clean_title order by position), '{}'::text[])
    into v_legendary_titles
    from (
      select left(regexp_replace(btrim(title), '[[:space:]]+', ' ', 'g'), 120) as clean_title, position
      from unnest(coalesce(p_legendary_titles, '{}'::text[])) with ordinality as supplied(title, position)
      where nullif(btrim(title), '') is not null
      order by position
      limit 3
    ) normalized_titles;

  insert into public.monthly_leaderboard (
    month_key, user_id, player_first_name, player_last_name, player_d_cosmetic,
    character_name, character_title, legendary_titles, dream_completed, score
  ) values (
    p_month_key, v_user_id, v_first_name, v_last_name, coalesce(p_player_d_cosmetic, false),
    v_character_name, v_character_title, v_legendary_titles, coalesce(p_dream_completed, false), p_score
  )
  on conflict (month_key, user_id) do update
    set player_first_name = excluded.player_first_name,
        player_last_name = excluded.player_last_name,
        player_d_cosmetic = excluded.player_d_cosmetic,
        character_name = excluded.character_name,
        character_title = excluded.character_title,
        legendary_titles = excluded.legendary_titles,
        dream_completed = excluded.dream_completed,
        score = excluded.score,
        updated_at = now()
    where excluded.score > public.monthly_leaderboard.score;

  return query
    select * from public.monthly_leaderboard
    where month_key = p_month_key and user_id = v_user_id;
end;
$$;

revoke all on function public.submit_monthly_score(text, text, text, boolean, text, text, text[], boolean, integer) from public, anon;
grant execute on function public.submit_monthly_score(text, text, text, boolean, text, text, text[], boolean, integer) to authenticated;

commit;

/* ==========================================================
   AUDIT MANUEL NON DESTRUCTIF DES IDENTITÉS HISTORIQUES
   Ces requêtes n'effacent aucun compte et ne modifient aucune progression.
   ========================================================== */
select user_id, first_name, last_name, created_at, updated_at
from public.player_profiles
where not public.player_identity_is_allowed(first_name, last_name)
order by updated_at desc;

select month_key, user_id, player_first_name, player_last_name, score, updated_at
from public.monthly_leaderboard
where not public.player_identity_is_allowed(player_first_name, player_last_name)
order by updated_at desc;

/* Tests manuels recommandés dans une session authentifiée :
   - appeler upsert_player_profile avec une identité normale : accepté ;
   - appeler upsert_player_profile avec un slur manifeste ou obfusqué : erreur 22023 ;
   - appeler submit_monthly_score avec la même identité interdite : erreur 22023.
   Ne pas exécuter de suppression automatique sur les lignes retournées par l'audit. */
