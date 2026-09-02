-- Blue Legacy 1.1 — classement Mode Histoire
-- Migration additive : n'altère ni la table ni la RPC du classement classique.
begin;

create table if not exists public.monthly_story_leaderboard (
  month_key text not null check (month_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_first_name text not null check (char_length(player_first_name) between 1 and 40),
  player_last_name text not null check (char_length(player_last_name) between 1 and 40),
  player_d_cosmetic boolean not null default false,
  character_name text not null,
  story_id text not null,
  story_title text not null,
  character_title text,
  dream_completed boolean not null default false,
  conclusion_label text,
  legendary_titles text[] not null default '{}',
  score integer not null check (score between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (month_key, user_id, story_id),
  constraint monthly_story_leaderboard_allowed_public_name check (
    public.player_identity_is_allowed(player_first_name, player_last_name)
  ) not valid
);

alter table public.monthly_story_leaderboard
  add column if not exists character_title text,
  add column if not exists dream_completed boolean not null default false,
  add column if not exists conclusion_label text,
  add column if not exists legendary_titles text[] not null default '{}';

alter table public.monthly_story_leaderboard enable row level security;
drop policy if exists "story leaderboard readable" on public.monthly_story_leaderboard;
create policy "story leaderboard readable" on public.monthly_story_leaderboard for select using (true);

drop function if exists public.submit_monthly_story_score(text,text,text,boolean,text,text,text,integer);

create or replace function public.submit_monthly_story_score(
  p_month_key text,
  p_player_first_name text,
  p_player_last_name text,
  p_player_d_cosmetic boolean,
  p_character_name text,
  p_story_id text,
  p_story_title text,
  p_character_title text,
  p_dream_completed boolean,
  p_conclusion_label text,
  p_legendary_titles text[],
  p_score integer
)
returns setof public.monthly_story_leaderboard
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_first_name text := regexp_replace(btrim(coalesce(p_player_first_name, '')), '[[:space:]]+', ' ', 'g');
  v_last_name text := regexp_replace(btrim(coalesce(p_player_last_name, '')), '[[:space:]]+', ' ', 'g');
  v_story_id text := left(regexp_replace(lower(btrim(coalesce(p_story_id, ''))), '[^a-z0-9-]', '', 'g'), 50);
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if char_length(v_first_name) not between 1 and 40 or char_length(v_last_name) not between 1 and 40
    or not public.player_identity_is_allowed(v_first_name, v_last_name) then
    raise exception 'Invalid player name' using errcode = '22023';
  end if;
  if p_month_key !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' or p_score not between 1 and 100
    or v_story_id = '' or char_length(btrim(coalesce(p_story_title, ''))) not between 1 and 120 then
    raise exception 'Invalid story score' using errcode = '22023';
  end if;

  insert into public.monthly_story_leaderboard (
    month_key, user_id, player_first_name, player_last_name, player_d_cosmetic,
    character_name, story_id, story_title, character_title, dream_completed,
    conclusion_label, legendary_titles, score
  ) values (
    p_month_key, v_user_id, v_first_name, v_last_name, coalesce(p_player_d_cosmetic, false),
    left(btrim(p_character_name), 100), v_story_id, left(btrim(p_story_title), 120),
    nullif(left(btrim(coalesce(p_character_title, '')), 120), ''), coalesce(p_dream_completed, false),
    nullif(left(btrim(coalesce(p_conclusion_label, '')), 120), ''),
    coalesce((select array_agg(left(btrim(title), 120) order by ordinal)
      from unnest(coalesce(p_legendary_titles, '{}')) with ordinality as supplied(title, ordinal)
      where btrim(title) <> '' and ordinal <= 3), '{}'), p_score
  )
  on conflict (month_key, user_id, story_id) do update set
    player_first_name = excluded.player_first_name,
    player_last_name = excluded.player_last_name,
    player_d_cosmetic = excluded.player_d_cosmetic,
    character_name = excluded.character_name,
    story_title = excluded.story_title,
    character_title = excluded.character_title,
    dream_completed = excluded.dream_completed,
    conclusion_label = excluded.conclusion_label,
    legendary_titles = excluded.legendary_titles,
    score = excluded.score,
    updated_at = now()
  where excluded.score > public.monthly_story_leaderboard.score;

  return query select * from public.monthly_story_leaderboard
    where month_key = p_month_key and user_id = v_user_id and story_id = v_story_id;
end;
$$;

revoke all on function public.submit_monthly_story_score(text,text,text,boolean,text,text,text,text,boolean,text,text[],integer) from public, anon;
grant execute on function public.submit_monthly_story_score(text,text,text,boolean,text,text,text,text,boolean,text,text[],integer) to authenticated;
grant select on public.monthly_story_leaderboard to anon, authenticated;

commit;
