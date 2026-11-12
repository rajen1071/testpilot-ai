-- Phase 1: profiles, organizations, memberships, projects, project_environments
create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, created_at timestamptz not null default now()
);
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  plan text not null default 'free' check (plan in ('free','pro','team')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text, base_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table project_environments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null, url text not null,
  kind text not null default 'qa' check (kind in ('dev','qa','staging','prod')),
  created_at timestamptz not null default now()
);
create index on memberships (user_id);
create index on projects (org_id, created_at desc);
create index on project_environments (project_id);

create function is_org_member(o uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from memberships where org_id = o and user_id = auth.uid()) $$;

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into profiles(id,email) values (new.id,new.email); return new; end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table projects enable row level security;
alter table project_environments enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid());
create policy "own profile update" on profiles for update using (id = auth.uid());
create policy "members read org" on organizations for select using (is_org_member(id));
create policy "read own memberships" on memberships for select using (user_id = auth.uid() or is_org_member(org_id));
create policy "members read projects" on projects for select using (is_org_member(org_id));
create policy "members read envs" on project_environments for select
  using (exists (select 1 from projects p where p.id = project_id and is_org_member(p.org_id)));
-- Writes go through the FastAPI backend (service role), which enforces roles.
