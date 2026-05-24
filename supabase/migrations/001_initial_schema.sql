-- FQ26 · esquema inicial (ejecutar en Supabase → SQL Editor)

-- Perfiles (1 por usuario auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null,
  fav_team text not null default '',
  display_name text,
  bio text default '',
  avatar_color text default '#f5c842',
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  last_login timestamptz,
  login_count int not null default 0,
  total_minutes int not null default 0,
  page_visits jsonb not null default '{}'::jsonb
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

-- Quiniela
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null,
  pick text check (pick in ('1', 'X', '2')),
  home_score int,
  away_score int,
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists predictions_user_id_idx on public.predictions (user_id);

-- Fantasy
create table if not exists public.fantasy_lineups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_key int not null,
  formation text not null,
  players jsonb not null default '{}'::jsonb,
  subs jsonb not null default '{}'::jsonb,
  captain text,
  updated_at timestamptz not null default now(),
  unique (user_id, day_key)
);

create index if not exists fantasy_lineups_user_id_idx on public.fantasy_lineups (user_id);

-- Foro
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  text text not null,
  likes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists forum_comments_post_id_idx on public.forum_comments (post_id);

-- Resultados manuales / admin (compartidos)
create table if not exists public.match_states (
  match_id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Trigger: crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, fav_team, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'fav_team', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.predictions enable row level security;
alter table public.fantasy_lineups enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.match_states enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy profiles_update on public.profiles for update to authenticated using (auth.uid() = id);
create policy profiles_delete on public.profiles for delete to authenticated using (true);

-- predictions
create policy predictions_select on public.predictions for select to authenticated using (true);
create policy predictions_insert on public.predictions for insert to authenticated with check (auth.uid() = user_id);
create policy predictions_update on public.predictions for update to authenticated using (auth.uid() = user_id);
create policy predictions_delete on public.predictions for delete to authenticated using (auth.uid() = user_id);

-- fantasy
create policy fantasy_select on public.fantasy_lineups for select to authenticated using (true);
create policy fantasy_insert on public.fantasy_lineups for insert to authenticated with check (auth.uid() = user_id);
create policy fantasy_update on public.fantasy_lineups for update to authenticated using (auth.uid() = user_id);
create policy fantasy_delete on public.fantasy_lineups for delete to authenticated using (auth.uid() = user_id);

-- forum posts
create policy forum_posts_select on public.forum_posts for select to authenticated using (true);
create policy forum_posts_insert on public.forum_posts for insert to authenticated with check (auth.uid() = user_id);
create policy forum_posts_update on public.forum_posts for update to authenticated using (auth.uid() = user_id);
create policy forum_posts_delete on public.forum_posts for delete to authenticated using (auth.uid() = user_id);

-- forum comments
create policy forum_comments_select on public.forum_comments for select to authenticated using (true);
create policy forum_comments_insert on public.forum_comments for insert to authenticated with check (auth.uid() = user_id);
create policy forum_comments_delete on public.forum_comments for delete to authenticated using (auth.uid() = user_id);

-- match states (todos leen; escriben autenticados — panel admin protegido por contraseña en app)
create policy match_states_select on public.match_states for select to authenticated using (true);
create policy match_states_insert on public.match_states for insert to authenticated with check (true);
create policy match_states_update on public.match_states for update to authenticated using (true);
create policy match_states_delete on public.match_states for delete to authenticated using (true);
