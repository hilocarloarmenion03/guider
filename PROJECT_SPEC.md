# System Making Guide — Project Spec (v1)

**Role of this document:** This is the build brief for the coding AI agent. It defines what to build, the data model, the flow, and explicit boundaries. Treat every "Out of Scope" item as a hard no for v1 — do not add it even if it seems easy or helpful.

---

## 1. What this is

A guided web tool that walks a user from a raw idea to formal system-design deliverables (Use Case Diagram, ERD, DFD, WBS), based on a fixed methodology:

`Idea → Scope → Actors → Nouns → Verbs → (Diagrams derived automatically)`

The core principle: **the user writes each step once.** The diagrams are not separately authored — they are *views* generated from the same underlying data. The agent's job is to build the data model and the guided input flow correctly; the "diagrams" for v1 are structured text/data views, not visual diagram rendering.

---

## 2. Tech stack (fixed — do not substitute)

- Next.js (App Router)
- Supabase (Postgres + client SDK) — using the official `supabase-starter` template as the base
- Vercel for deployment
- No additional backend framework. No ORM beyond the Supabase client unless discussed first.
- **draw.io Embed Mode** (`embed.diagrams.net`) via iframe — for manual ERD, DFD, and Use Case diagrams. Communicates via `postMessage`: load an XML payload on open, receive updated XML on save. No other diagram library needed.

---

## 3. Core data model

One project = one root idea/system, owned by the logged-in user (via the Supabase-starter's built-in auth). A user can have multiple projects.

### Tables — `supabase/migrations/0001_init.sql`

```sql
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
```

**Design notes:**
- A Verb can be performed by **multiple** Actors (e.g. "Log In" shared by Student and Admin), via `verb_actors` — same many-to-many shape as `verb_nouns`. A Verb must still have **at least one** Actor and **at least one** Noun to be valid (the trio rule, section 3d) — "at least one" now applies to both sides.
- `wbs_items.parent_id` is `on delete cascade` — deleting a parent WBS branch deletes its children.
- Deleting an Actor or Noun that's still linked to a Verb just removes that join-table row — the Verb itself isn't deleted, it just loses that one link (as long as it still has ≥1 of each remaining; if a delete would drop a Verb below the minimum, the UI should warn/prevent it rather than silently leaving an incomplete Verb).

### RLS — `supabase/migrations/0002_rls.sql`

Every table's row-level security is scoped to the owning user via `projects.user_id`, using the starter's existing `auth.users`:

```sql
alter table projects enable row level security;
alter table actors enable row level security;
alter table nouns enable row level security;
alter table verbs enable row level security;
alter table verb_actors enable row level security;
alter table verb_nouns enable row level security;
alter table wbs_items enable row level security;
alter table use_case_details enable row level security;
alter table diagrams enable row level security;

create policy "own projects" on projects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own actors" on actors
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own nouns" on nouns
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own verbs" on verbs
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own wbs_items" on wbs_items
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own verb_nouns" on verb_nouns
  for all using (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  );

create policy "own verb_actors" on verb_actors
  for all using (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  );

create policy "own use_case_details" on use_case_details
  for all using (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  );

create policy "own diagrams" on diagrams
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
```

---

## 3a. Repo, infra, and deployment conventions

- **GitHub**: one repo, `main` = production. Schema changes live as versioned files in `supabase/migrations/`, never applied by hand in the Supabase dashboard.
- **Supabase**: one cloud project, linked via the Supabase CLI. Use `supabase start` for local dev (local Postgres + auth) so development never touches production data directly. Migrations are written and tested locally, then pushed to the cloud project.
- **Auth**: use the Supabase-starter's existing auth pages/flow as-is (`/login`, etc.) — do not rebuild or replace it.
- **Vercel**: connected directly to the GitHub repo, auto-deploys on push to `main`, preview deployments on branches/PRs. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public); a service-role key, if ever needed, stays server-only and is never exposed to the client.
- **Routes** (thin — see section 3b): `/login` (from starter), `/projects` (list), `/projects/[projectId]` (the guided workspace).

---

## 3b. File structure — "thin route" / feature-folder pattern

`app/` contains only routing plumbing. Each route file imports and renders one component from `features/`. All real logic, state, and markup live in `features/`, organized by domain, not by route.

```
app/
  layout.tsx                      -- thin, global providers only
  page.tsx                        -- thin, redirects to /projects
  login/
    page.tsx                      -- from starter, unchanged
  projects/
    page.tsx                      -- thin: <ProjectsList />
    [projectId]/
      page.tsx                    -- thin: <ProjectWorkspace projectId={...} />

features/
  projects-list/
    components/
      ProjectsList.tsx
      ProjectCard.tsx
      NewProjectButton.tsx
    hooks/
      useProjects.ts
    api.ts                        -- supabase queries for this feature only

  project-workspace/
    components/
      ProjectWorkspace.tsx        -- the single guided-flow page shell
      AddRowList.tsx              -- shared repeatable-row component
      steps/
        TitleStep.tsx
        IdeaStep.tsx
        ScopeStep.tsx
        ActorsStep.tsx
        NounsStep.tsx
        VerbsStep.tsx             -- the mini-form step (linking layer)
        SanityCheckNotice.tsx
      deliverables/
        DeliverablesPanel.tsx
        UcdListView.tsx           -- actor -> verb -> nouns list
        UseCaseDetailView.tsx     -- one UC-n form per verb (auto fields + manual fields)
        DiagramCanvas.tsx         -- shared draw.io iframe embed, used by ERD/DFD/Use Case diagram
        WbsView.tsx
        OnePagerExport.tsx        -- bonus feature
    hooks/
      useProject.ts
      useActors.ts
      useNouns.ts
      useVerbs.ts
      useWbsItems.ts
      useUseCaseDetails.ts
      useDiagram.ts             -- load/save draw.io XML + notes per diagram_type
    api.ts                        -- supabase queries for this feature only
    utils/
      sanityCheck.ts              -- plain keyword-overlap logic, no AI calls

lib/
  supabase/
    client.ts                     -- browser client
    server.ts                     -- server client (from starter)

supabase/
  migrations/
    0001_init.sql
    0002_rls.sql
```

**Naming conventions**
- Folders: kebab-case (`project-workspace`, `projects-list`)
- Component files: PascalCase matching the component (`VerbsStep.tsx`)
- Hooks: camelCase, `use` prefix (`useVerbs.ts`)
- DB tables/columns: snake_case, plural table names (`verb_nouns`, `wbs_items`, `parent_id`)
- Each feature's `api.ts` is the **only** place that calls the Supabase client for that feature — components and hooks never import Supabase directly, they go through `api.ts`.

---

## 3c. Frontend reference implementation (do not deviate from this pattern)

Reference component code is provided alongside this spec, in `frontend-reference/`. These are not throwaway examples — they define the exact patterns to reuse:

- `ProjectWorkspace.tsx` — the single scrolling page shell. All steps are stacked `<section>` blocks, no tabs, no step-locking mechanism. Order is enforced naturally: Verbs' actor/noun pickers are simply empty until Actors/Nouns have entries.
- `AddRowList.tsx` — the shared repeatable single-field list (Supabase-table-editor style: existing rows + a persistent add-row at the bottom). Used as-is by Actors and Nouns steps — do not build a separate pattern per step.
- `steps/ActorsStep.tsx` — shows the guide-question + section-heading pattern every step must follow. Nouns follows the identical shape.
- `steps/VerbsStep.tsx` — the one step that deviates from AddRowList, because a verb is a **mini-form**: name + actor dropdown + noun multi-select (toggle buttons). This is the linking layer the whole data model depends on — do not simplify it to a single text field.

**Not yet provided as reference code** (agent should follow the written spec in section 4, Step 8 for these): `DiagramCanvas.tsx` (the draw.io iframe wrapper + postMessage load/save logic) and `UseCaseDetailView.tsx` (the UC-n template form). Ask if the intended shape is unclear rather than guessing.

Styling: plain Tailwind, neutral palette (`neutral-*` grays, one dark accent for primary buttons), no custom design system. Visual polish is not a priority for v1 — functional clarity over decoration.

---

## 3d. UI state-derivation rules (base mockup + rules, not per-case mockups)

The user will provide a minimal Figma mockup covering only: the Actors/Nouns list shell (one empty state, one row with linked chips), the Verb mini-form (empty and mid-fill), one example of the inline "create new" sub-form, and the tab shells (SYSTEM/UCD/ERD/DFD). **Every other UI state below must be derived from these rules, not separately mocked up.**

**The trio rule (hard restriction, not a warning):**
A Verb is only ever saved complete: one name + at least one Actor + at least one Noun. Actor and Noun are both many-to-many with Verb — there is no partially-saved Verb state. Concretely:
- Whichever field(s) a new-verb form is missing, show them **immediately, inline, in the same form** — never save-then-detect-error. E.g. creating a verb from an Actor row shows the verb-name field AND the noun picker/creator together, from the start.
- The Save/Add button for a new verb stays disabled until name + ≥1 actor + ≥1 noun are all present. No separate validation step, no toast/error message — the button simply doesn't activate until the form is complete.

**The three entry points behave identically (same end state, different starting field):**
- From an **Actor** row: that Actor is pre-selected as one of the verb's actors (more can be added); the "+Verb" control needs a verb name + noun(s).
- From a **Noun** row: Noun is fixed; the "+Verb" control needs a verb name + actor(s).
- From the **Verbs** step itself: nothing is fixed; the mini-form needs all three (name, actor(s), noun(s)).
- In all three cases, whichever piece (Actor and/or Noun) doesn't yet exist gets a "create new" affordance inline; whichever already exists is shown as a pickable/searchable list instead. Never force creating something that already exists.

**Linking widget, reused everywhere (Actor rows, Noun rows):**
A row (Actor or Noun) shows its linked Verbs as removable chips, plus one **"Link"** button (same label everywhere this pattern appears — not "Add Process," not a type-specific label; context from the row already makes clear what's being linked). Clicking it opens: a searchable list of existing Verbs to link, OR (if none fit) a "create new verb" option — which then asks for whichever of {name, actor, noun(s)} isn't already implied by the row you started from.

**Do not build:**
- A separate error/warning screen for incomplete verbs — prevented at entry, not corrected after.
- Distinct Figma-mocked screens for "empty," "partial," "one-exists," etc. — these are all the same component, just fed different data; the rules above fully describe the behavior differences.

---

## 4. The guided flow (single scrolling page per project)

One page per project. Steps appear in order, top to bottom. Do not use separate tabs for the writing stages (Idea/Scope/Actors/Nouns/Verbs) — this must be a single continuous guided flow, not tab-switching.

Each step shows:
1. A short guide question (copy given below — use as-is)
2. The input field(s) for that step
3. Previously entered items for repeatable steps, in a simple add-row list

### Step 1 — Title
- Guide text: *(none needed — just a plain "Project Title" field)*
- Field: single text input, manual entry, no auto-generation from other fields

### Step 2 — Idea / Problem Statement
- Guide text: "Describe the problem like you're talking to a friend. No diagrams yet — just the why."
- Field: single multi-line text area

### Step 3 — Scope
- Guide text: "Decide boundaries before anything else, or your diagrams will balloon."
- Field 1: "What's IN" — multi-line text area
- Field 2: "What's OUT" — multi-line text area

### Step 4 — Actors
- Guide text: "Who will actually touch this system?"
- Repeatable row: single field, "Actor name"
- Add-row UI pattern: like a Supabase table editor — a "+ Add actor" row/button, entries list below

### Step 5 — Nouns
- Guide text: "Not attributes yet, just nouns — the main things the system needs to remember."
- Repeatable row: single field, "Noun name"
- Same add-row pattern as Actors

### Step 6 — Verbs (mini-form — this is the linking step)
- Guide text: "Just verbs — the main things the system does."
- Repeatable mini-form per entry, three fields:
  - "Verb" — text input
  - "Done by" — **multi-select**, populated from Actors already entered (a verb can have more than one actor — e.g. "Log In" shared by Student and Admin)
  - "Involves" — multi-select, populated from Nouns already entered
- Add-row pattern: same list-below style as Actors/Nouns, but each row has these 3 fields

### Step 7 — Sanity check (soft, non-blocking)
- After Verbs are entered, show a small non-blocking notice for any Verb whose text has no obvious keyword overlap with the Scope "In" text.
- Example: display as a dismissible note, e.g. "This verb doesn't obviously connect to your scope — intentional?"
- This is a simple keyword-overlap check. **Do not call an LLM/AI API for this.** Plain string/keyword matching only.
- Never block saving or progressing because of this check — it's advisory only.

### Step 8 — Deliverables (derived views, shown after Verbs are filled)

**UCD (Use Case list view)**: list each Actor, and under it, list the Verbs linked to that Actor via `verb_actors` (their use cases), with linked Nouns shown alongside. A Verb with multiple Actors appears under each of them. Text/list view.

**Use Case entries (UC-n) — one per Verb, auto-created:**
Every Verb automatically gets one corresponding row in `use_case_details` (see schema addition below) the moment the Verb is created. Opening a UC entry shows a form styled after the standard Use Case template:
  - **Auto-filled, computed at render (not duplicated/stored)**: Use Case Name (= Verb name), Actor(s) (= Verb's linked Actors via `verb_actors`, can be more than one), Summary Inputs/Outputs (= Verb's linked Nouns), Summary Source/Destination (= Verb's linked Actor(s)), ID (auto-generated, `UC-1`, `UC-2`... sequential per project).
  - **Manual, stored fields** (nullable, blank until the user fills them): Priority, Description, Trigger, Type (External/Temporal), Preconditions, Normal Course, Alternative Courses, Postconditions, Exceptions. None of these are required — a UC entry can stay mostly blank indefinitely.

**ERD, DFD, and the Use Case diagram (visual) — draw.io embed, not auto-generated:**
Each of these three gets a "big box" that's a draw.io iframe (`embed.diagrams.net`, Embed Mode), plus a smaller **"INFO" box above it — an auto-derived, read-only summary, computed live from Actors/Nouns/Verbs, never manually typed or persisted.** It exists purely so the user doesn't have to hold the data in their head while manually drawing. Each row is the "whole picture," not split into separate pairwise chunks:
  - **UCD's INFO box**: one row per Verb, formatted `Actor(s)  →  Verb  →  Noun(s)` — e.g. `Student  →  claim item  →  Item, Claim`. Read down this list while placing stick figures (one per unique Actor), ovals (one per Verb), and connecting lines (one per Actor-Verb pair — a Verb with 2 actors gets 2 lines into the same oval).
  - **ERD's INFO box**: one row per Noun, formatted `Noun  ←  Verb(s) that touch it  ←  Actor(s) involved` — e.g. `Item  ←  claim item, post lost report  ←  Student, Admin`. Use this to decide which entities are likely related (nouns that keep showing up together in the same verb probably have a relationship).
  - **DFD's INFO box**: same row shape as UCD (`Actor(s) → Verb → Noun(s)`), since a DFD process is a Verb too — Actors become external entities, Verbs become processes, Nouns become data stores (see section on DFD entity mapping if present).
  - This box is **never edited directly** — it just re-renders whenever Actors/Nouns/Verbs change.

The draw.io canvas itself:
  - On open: load that project's saved XML for that diagram type (blank if none saved yet).
  - On save (draw.io's `save` postMessage event): write the returned XML back to Supabase.
  - Persisted per project, per diagram type — reopening later restores exactly what was last saved.
  - Not auto-populated from Actors/Nouns/Verbs data in v1 — starts blank the first time. (Pre-filling draw.io's XML from linked data is a possible future enhancement, not required for v1.)
  - No Google Drive/OneDrive integration — XML is stored directly in our own Supabase table, keeping this consistent with the rest of the app and avoiding a separate OAuth flow.

**WBS view**: a "Seed WBS from Scope" action — takes each line of the Scope "In" text and creates one `wbs_items` row per line (top-level, `parent_id = null`). After seeding, allow the user to add child items manually (nested under a parent) directly in this view. Do not attempt to auto-generate nested/child items — only the top-level seed is automatic. This stays a simple nested list, not a diagram.

---

## 5. Explicitly out of scope for v1 — do not build these

- Google Drive/OneDrive/GitHub storage integration for draw.io — diagram XML is stored directly in our own `diagrams` table (see schema), no separate OAuth flow.
- Pre-populating draw.io's canvas from Actors/Nouns/Verbs data — v1 diagrams start blank; the user draws manually. (A future enhancement could pre-fill XML from linked data, but it's not required for v1.)
- Any auto-generated visual diagram (no React Flow/Dagre or similar auto-layout graph library) — ERD/DFD/Use Case visuals are 100% manual, via the draw.io embed described in section 4, Step 8.
- Building custom authentication or a custom multi-user system beyond what the Supabase starter already provides and the RLS policies in section 3.
- Any AI/LLM-powered feature (semantic checks, auto-generated user stories, "does this still match the idea" judgment calls). The sanity check in Step 7 is plain keyword matching, not AI.
- Auto-generated project title from Idea text.
- Permissions/access matrix generation.
- API endpoint stub generation or database schema stub generation beyond the tables above.
- Versioning/history of edits per field.
- Cross-project search or reuse of actors/nouns between different projects.
- Drag-and-drop positioning of any kind.

If a feature isn't listed in Section 4 or the "bonus" note below, treat it as out of scope. Ask before adding anything not in this document.

---

## 6. Approved bonus (build only after core flow works)

- **One-pager/glossary export**: a simple assembled text/markdown view combining Title, Idea, Scope, Actors, Nouns, Verbs into one shareable document. This is pure template-filling from existing data — no new logic.

---

## 7. UI/UX guidance

- Functional and clear over polished. Visual design quality is not a priority, but clean, sane defaults are welcome (readable spacing, clear labels) — do not spend significant effort on custom styling/animation.
- Enforce step order top-to-bottom on first pass through a project (don't let someone fill Verbs before Actors/Nouns exist, since the dropdown/multi-select needs that data) — but once initial data exists, allow free editing of any earlier step.
- Add-row lists (Actors, Nouns, Verbs) should behave like a simple table: existing rows shown, a persistent "add new" row/button at the bottom.

---

## 8. Definition of done for v1

- The starter's auth flow works unchanged; a logged-in user only ever sees their own projects (verified via RLS, not just client-side filtering).
- `app/` contains only thin route files; all logic lives under `features/`, matching the structure in section 3b.
- A user can create a project, fill Title → Idea → Scope → Actors → Nouns → Verbs in order, on one scrolling page.
- Verbs correctly link to one-or-more Actors and one-or-more Nouns (both many-to-many via `verb_actors`/`verb_nouns`).
- UCD renders as a list view (actor(s) → verb → nouns); every Verb has an auto-created UC-n entry showing computed fields (name/actor(s)/nouns/ID) plus editable manual fields (Description, Trigger, etc.), saved to `use_case_details`. WBS is a seeded nested list. ERD, DFD, and the Use Case diagram each open a draw.io canvas with an auto-derived, read-only INFO summary above it (computed live from actors/nouns/verbs, never stored); only the drawing (XML) persists per project, via the `diagrams` table.
- The sanity check notice appears for unlinked-looking verbs, without blocking anything.
- Data persists in Supabase (via migrations, not hand-edited in the dashboard) and reloads correctly per project.
- Multiple projects can exist and be switched between.
- Deployed on Vercel, auto-deploying from `main`.
