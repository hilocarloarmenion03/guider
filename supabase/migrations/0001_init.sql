-- 0001_init.sql
-- System Making Guide Core Schema

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Project',
  idea text,
  scope_in text,
  scope_out text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_id_idx on projects(user_id);

create table actors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index actors_project_id_idx on actors(project_id);

create table nouns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index nouns_project_id_idx on nouns(project_id);

create table verbs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index verbs_project_id_idx on verbs(project_id);

-- many-to-many: a verb can be performed by multiple actors (e.g. "Log In"
-- is one verb shared by Student and Admin), and one actor performs many verbs
create table verb_actors (
  verb_id uuid not null references verbs(id) on delete cascade,
  actor_id uuid not null references actors(id) on delete cascade,
  primary key (verb_id, actor_id)
);
create index verb_actors_actor_id_idx on verb_actors(actor_id);

-- many-to-many: a verb can involve multiple nouns
create table verb_nouns (
  verb_id uuid not null references verbs(id) on delete cascade,
  noun_id uuid not null references nouns(id) on delete cascade,
  primary key (verb_id, noun_id)
);
create index verb_nouns_noun_id_idx on verb_nouns(noun_id);

create table wbs_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  parent_id uuid references wbs_items(id) on delete cascade,  -- null = top-level branch
  created_at timestamptz not null default now()
);
create index wbs_items_project_id_idx on wbs_items(project_id);
create index wbs_items_parent_id_idx on wbs_items(parent_id);

-- ─── Use Case details: one row per Verb, auto-created (Section 4, Step 8) ───
-- Auto-fillable fields (name, actor, nouns) are NOT duplicated here — they're
-- computed at render time by joining back to verbs/actors/verb_nouns/nouns.
-- Only the manual, template-specific fields live here.
create table use_case_details (
  id uuid primary key default gen_random_uuid(),
  verb_id uuid not null unique references verbs(id) on delete cascade,
  uc_number integer not null,          -- sequential per project, e.g. 1 -> "UC-1"
  priority text,                       -- e.g. 'High' | 'Medium' | 'Low', free text is fine for v1
  description text,
  trigger text,
  type text,                           -- e.g. 'External' | 'Temporal'
  preconditions text,
  normal_course text,
  alternative_courses text,
  postconditions text,
  exceptions text,
  created_at timestamptz not null default now()
);
create index use_case_details_verb_id_idx on use_case_details(verb_id);

-- Auto-create a use_case_details row whenever a verb is created, with the
-- next sequential uc_number for that project.
create or replace function create_use_case_detail()
returns trigger as $$
declare
  next_number integer;
begin
  select coalesce(max(ucd.uc_number), 0) + 1 into next_number
  from use_case_details ucd
  join verbs v on v.id = ucd.verb_id
  where v.project_id = new.project_id;

  insert into use_case_details (verb_id, uc_number)
  values (new.id, next_number);

  return new;
end;
$$ language plpgsql;

create trigger verbs_create_use_case_detail
  after insert on verbs
  for each row execute function create_use_case_detail();

-- ─── Diagrams: one row per project per diagram type (erd / dfd / use_case) ───
-- Holds only the draw.io XML. The "INFO" box shown above the canvas is an
-- auto-derived, read-only summary computed live from actors/nouns/verbs —
-- it is NOT stored here or anywhere; never persist it, always recompute.
create table diagrams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  diagram_type text not null check (diagram_type in ('erd', 'dfd', 'use_case')),
  xml text,             -- draw.io diagram XML, null until first save
  updated_at timestamptz not null default now(),
  unique (project_id, diagram_type)
);
create index diagrams_project_id_idx on diagrams(project_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger diagrams_set_updated_at
  before update on diagrams
  for each row execute function set_updated_at();
