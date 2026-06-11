-- Zebra — initial schema + the safety invariant as RLS policy.
-- Applies in sprint 2 when Supabase goes live; mirrors the local-mode model
-- in apps/web/src/lib/content/types.ts and the filter in filter.ts.

-- ============ Types ============
create type age_band as enum ('3-5', '6-8', '9-12');
create type story_lang as enum ('en', 'ur');
create type content_status as enum (
  'draft',
  'pending_review',
  'rejected',
  'published_library',
  'published_profile',
  'published_class'
);

-- ============ Families & profiles ============
-- A family row belongs to the authenticated parent (auth.users).
create table families (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  pin_hash text not null,
  pin_salt text not null,
  created_at timestamptz not null default now()
);

-- Child profiles are NOT auth users (COPPA: the adult is the account holder).
create table child_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  age_band age_band not null,
  language story_lang not null,
  avatar text not null default '🦓',
  created_at timestamptz not null default now()
);

-- ============ Content ============
create table stories (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,            -- { "en": ..., "ur": ... }
  theme text not null,
  age_bands age_band[] not null check (array_length(age_bands, 1) >= 1),
  status content_status not null default 'draft',
  -- scoping: exactly one of these is set for published_profile / published_class
  profile_id uuid references child_profiles(id) on delete cascade,
  class_id uuid,                   -- FK added when classes land (sprint 4)
  -- provenance & audit (safety plan §1.6)
  created_by uuid references auth.users(id),
  generation_prompt jsonb,         -- the structured prompt that produced it
  moderation_verdict jsonb,        -- raw results from every moderation layer
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  pages jsonb not null,            -- [{ text: {en,ur}, art, audio? }]
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  action text not null,            -- generated | moderated | approved | rejected | unpublished
  story_id uuid,
  detail jsonb
);

-- ============ Row-Level Security ============
alter table families enable row level security;
alter table child_profiles enable row level security;
alter table stories enable row level security;
alter table audit_log enable row level security;

-- Parents see and manage only their own family.
create policy family_owner on families
  for all using (owner = auth.uid()) with check (owner = auth.uid());

create policy profiles_of_owner on child_profiles
  for all using (
    family_id in (select id from families where owner = auth.uid())
  ) with check (
    family_id in (select id from families where owner = auth.uid())
  );

-- THE SAFETY INVARIANT (docs/plan/04-safety-and-compliance.md §0):
-- the child-facing client role can only ever read published content.
-- Kid Mode uses a restricted JWT claim (role: 'kid', profile_id) minted by
-- the app; adult sessions read their own drafts via the owner policy below.
create policy kid_reads_published_only on stories
  for select using (
    (
      status = 'published_library'
      or (status = 'published_profile'
          and profile_id = (auth.jwt() -> 'app_metadata' ->> 'kid_profile_id')::uuid)
    )
    and (auth.jwt() -> 'app_metadata' ->> 'kid_profile_id') is not null
  );

-- Adults manage their own creations (drafts, review queue, approvals).
create policy owner_manages_own_stories on stories
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

-- Audit log: insert-only from server functions; no client reads.
create policy audit_insert_server on audit_log
  for insert with check (false); -- service role bypasses RLS; clients can't write

-- ============ Hard guard: nothing reaches 'published_*' without approval ============
create or replace function enforce_approval_gate() returns trigger
language plpgsql as $$
begin
  if new.status in ('published_library', 'published_profile', 'published_class') then
    if new.approved_by is null or new.approved_at is null then
      raise exception 'SAFETY: content cannot be published without an approver';
    end if;
    if new.moderation_verdict is null then
      raise exception 'SAFETY: content cannot be published without a moderation verdict';
    end if;
  end if;
  return new;
end $$;

create trigger approval_gate before insert or update on stories
  for each row execute function enforce_approval_gate();
