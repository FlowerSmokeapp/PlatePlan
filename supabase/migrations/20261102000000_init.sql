-- PlatePlan database: accounts (profiles), free trial, offer cache and scan log.

-- One profile per account, created automatically on sign-up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  premium_until timestamptz,
  trial_used boolean not null default false,
  allergies text[] not null default '{}',
  dislikes text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update their own profile" on public.profiles for update using (auth.uid() = id);
-- Users may only change their preferences, never their Premium status.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (allergies, dislikes) on public.profiles to authenticated;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Free trial: once per account.
create function public.start_trial() returns timestamptz
language plpgsql security definer set search_path = public as $$
declare until timestamptz;
begin
  update public.profiles
     set premium_until = now() + interval '7 days', trial_used = true
   where id = auth.uid() and not trial_used
  returning premium_until into until;
  if until is null then raise exception 'Trial already used'; end if;
  return until;
end $$;
revoke execute on function public.start_trial() from public, anon;
grant execute on function public.start_trial() to authenticated;

-- Delete your own account (and everything linked to it).
create function public.delete_me() returns void
language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();
$$;
revoke execute on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;

-- Offers fetched by the "offers" function. Only the server can read or write it.
create table public.offers_cache (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.offers_cache enable row level security;

-- One row per photo scan, used to cap scans per day. Only the server can read or write it.
create table public.scan_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index scan_log_user_day on public.scan_log (user_id, created_at);
alter table public.scan_log enable row level security;
