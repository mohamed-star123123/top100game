-- Run once in Supabase: SQL Editor -> New query -> Run
create table if not exists public.rk_scores (
  code text primary key,
  name text,
  wins int default 0,
  games int default 0,
  updated timestamptz default now()
);
alter table public.rk_scores enable row level security;

create or replace function public.rk_submit(p_code text, p_name text, p_won boolean)
returns void language sql security definer set search_path = public as $$
  insert into public.rk_scores (code, name, wins, games, updated)
  values (p_code, p_name, case when p_won then 1 else 0 end, 1, now())
  on conflict (code) do update set
    name = excluded.name,
    wins = public.rk_scores.wins + (case when p_won then 1 else 0 end),
    games = public.rk_scores.games + 1,
    updated = now();
$$;

create or replace function public.rk_top(p_limit int)
returns table(name text, wins int, games int) language sql security definer set search_path = public as $$
  select name, wins, games from public.rk_scores
  order by wins desc, games asc, name asc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.rk_submit(text, text, boolean) to anon, authenticated;
grant execute on function public.rk_top(int) to anon, authenticated;
