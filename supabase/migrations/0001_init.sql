-- Zebra — initial schema + the safety invariant enforced in the database.
-- Mirrors apps/web/src/lib/content/types.ts and the local-mode filter.ts.
-- Apply once in the Supabase SQL Editor (or via `supabase db push`).

-- ============ Types ============
do $$ begin
  create type age_band as enum ('3-5', '6-8', '9-12');
exception when duplicate_object then null; end $$;

do $$ begin
  create type story_lang as enum ('en', 'ur');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum (
    'draft', 'pending_review', 'rejected',
    'published_library', 'published_profile', 'published_class'
  );
exception when duplicate_object then null; end $$;

-- ============ Families & profiles ============
-- A family belongs to the authenticated parent (auth.users). The PIN is the
-- kid→parent gate (hashed); auth is the real account boundary.
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  pin_hash text not null,
  pin_salt text not null,
  created_at timestamptz not null default now(),
  unique (owner)
);

-- Child profiles are NOT auth users (COPPA: the adult is the account holder).
create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  age_band age_band not null,
  language story_lang not null,
  avatar text not null default '🦓',
  created_at timestamptz not null default now()
);
create index if not exists idx_profiles_family on child_profiles(family_id);

-- ============ Content ============
create table if not exists stories (
  id text primary key,                       -- slug for library; uuid for generated
  title jsonb not null,                       -- { "en": ..., "ur": ... }
  theme text not null,
  age_bands age_band[] not null check (array_length(age_bands, 1) >= 1),
  status content_status not null default 'draft',
  cover_scene text not null default 'zee',
  profile_id uuid references child_profiles(id) on delete cascade,
  class_id uuid,                              -- FK added when classes land (sprint 5)
  created_by uuid references auth.users(id) on delete set null,
  generation_prompt jsonb,                    -- the structured prompt that produced it
  moderation_verdict jsonb,                   -- results from every moderation layer
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  pages jsonb not null,                       -- [{ text:{en,ur}, art, audio? }]
  created_at timestamptz not null default now()
);
-- Indexes on the columns RLS / queries filter by (keeps reads <50ms at scale).
create index if not exists idx_stories_status on stories(status);
create index if not exists idx_stories_profile on stories(profile_id);
create index if not exists idx_stories_creator on stories(created_by);

create table if not exists audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  action text not null,                       -- generated|moderated|approved|rejected|unpublished
  story_id text,
  detail jsonb
);

-- ============ Hard guard: no 'published_*' without moderation + approval ============
-- The strongest safety guarantee — independent of who reads the row.
create or replace function enforce_approval_gate() returns trigger
language plpgsql as $$
begin
  if new.status in ('published_library', 'published_profile', 'published_class') then
    if new.approved_at is null then
      raise exception 'SAFETY: content cannot be published without an approval timestamp';
    end if;
    if new.moderation_verdict is null then
      raise exception 'SAFETY: content cannot be published without a moderation verdict';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists approval_gate on stories;
create trigger approval_gate before insert or update on stories
  for each row execute function enforce_approval_gate();

-- ============ Row-Level Security ============
alter table families enable row level security;
alter table child_profiles enable row level security;
alter table stories enable row level security;
alter table audit_log enable row level security;

-- Parents see/manage only their own family & profiles.
drop policy if exists family_owner on families;
create policy family_owner on families
  for all using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists profiles_of_owner on child_profiles;
create policy profiles_of_owner on child_profiles
  for all using (family_id in (select id from families where owner = auth.uid()))
  with check (family_id in (select id from families where owner = auth.uid()));

-- The curated library is public-safe (every row is human-reviewed).
drop policy if exists library_is_public on stories;
create policy library_is_public on stories
  for select using (status = 'published_library');

-- Adults manage their OWN creations (drafts, review queue, approvals).
drop policy if exists owner_manages_own_stories on stories;
create policy owner_manages_own_stories on stories
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

-- audit_log: writes only via service role (which bypasses RLS); no client access.
drop policy if exists audit_no_client on audit_log;
create policy audit_no_client on audit_log for all using (false) with check (false);

-- ============ Kid read path (DB-enforced safety boundary) ============
-- Kid Mode runs under the parent's session. This SECURITY DEFINER function is
-- the ONLY way Kid Mode fetches stories: it can return published content for a
-- profile the caller owns — and structurally cannot return a draft/pending row.
create or replace function kid_library(p_profile_id uuid)
returns setof stories
language sql stable security definer set search_path = public as $$
  select s.* from stories s
  join child_profiles cp on cp.id = p_profile_id
  join families f on f.id = cp.family_id and f.owner = auth.uid()  -- must own the profile
  where (cp.age_band = any (s.age_bands))
    and (
      s.status = 'published_library'
      or (s.status = 'published_profile' and s.profile_id = p_profile_id)
    );
$$;

revoke all on function kid_library(uuid) from public;
grant execute on function kid_library(uuid) to authenticated;
