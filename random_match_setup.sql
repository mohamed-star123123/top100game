-- Run once in Supabase: SQL Editor -> New query -> Run
create table if not exists public.rm_queue (
  code text primary key,
  name text,
  created timestamptz default now(),
  status text default 'waiting'
);
alter table public.rm_queue enable row level security;  -- no policies: players only use the functions below

create or replace function public.rm_wait(p_code text, p_name text)
returns void language sql security definer set search_path = public as $$
  insert into public.rm_queue (code, name, status) values (p_code, p_name, 'waiting')
  on conflict (code) do update set created = now(), status = 'waiting', name = excluded.name;
$$;

create or replace function public.rm_take(p_my_code text, p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  delete from public.rm_queue where created < now() - interval '3 minutes';
  select code into c from public.rm_queue
   where status = 'waiting' and code <> p_my_code and created > now() - interval '3 minutes'
   order by created limit 1 for update skip locked;
  if c is null then return null; end if;
  update public.rm_queue set status = 'matched' where code = c;
  return c;
end;
$$;

create or replace function public.rm_leave(p_code text)
returns void language sql security definer set search_path = public as $$
  delete from public.rm_queue where code = p_code;
$$;

grant execute on function public.rm_wait(text, text) to anon, authenticated;
grant execute on function public.rm_leave(text) to anon, authenticated;
grant execute on function public.rm_take(text, text) to anon, authenticated;
