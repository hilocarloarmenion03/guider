# START HERE — Agent Brief

**Read this file first, in full, before writing any code, schema, or config.** This is the orchestration layer — it tells you what this project *is*, why it exists, what's already been decided, and where the rest of the context lives. Everything in this repo of documents is deliberate; nothing here is filler.

Your role: implement. All the product, design, and data-model decisions have already been made by the user and their planning assistant (Claude, acting as system analyst/PM). Do not re-derive these decisions from scratch, and do not silently change them. If something in this brief or the spec seems wrong, incomplete, or in tension with something else, **ask before proceeding** — don't guess, don't "improve" it unilaterally.

---

## 1. The core idea — read this even if you skim everything else

The user is a student developer who kept losing track of system-design planning: notes on paper, actor lists in one doc, diagram screenshots buried in a phone camera roll — scattered, disconnected, easy to forget. This project exists to fix that by being **one guided tool that holds the idea and everything derived from it in one place.**

It's built around a specific, fixed methodology (see `figma-reference/00-methodology-source.png` for the original source material this is based on):

```
1. Idea / Problem Statement  →  plain language, no jargon, just the why
2. Scope (In / Out)          →  draw boundaries before anything balloons
3. Identify Actors           →  who touches the system
4. List Nouns                →  what the system needs to remember
5. List Verbs                →  what the system does
6. THEN formalize into diagrams — not before
```

The critical insight that shapes the entire data model: **steps 3, 4, and 5 aren't independent lists — they link together.** A Verb is the connector: it has one-or-more Actors (who does it) and one-or-more Nouns (what it touches). Once that trio is captured, the formal deliverables (Use Case Diagram, ERD, DFD, WBS) are just *different views* of the same linked data — the user should never have to retype the same information twice.

**If you remember only one thing from this brief, remember this:** the whole product is "write it once, connected; view it many ways." Every design decision downstream exists in service of that.

---

## 2. Where everything else lives

- **`PROJECT_SPEC.md`** — the actual build spec. Full data model (SQL), RLS policies, the guided flow step-by-step, what's in scope, what's explicitly out of scope, UI state-derivation rules, folder structure, naming conventions, and the definition of done. This is your primary reference for *how* to build.
- **`frontend-reference/`** — working reference code (not throwaway examples) showing the exact shape of the two patterns that must not drift: `AddRowList.tsx` (simple repeatable rows for Actors/Nouns) and `VerbsStep.tsx` (the trio-linking mini-form, multi-select actors, multi-select nouns, save disabled until complete). Match these patterns; don't reinvent them.
- **`figma-reference/`** — the user's own mockups, described in detail in section 3 below. These are the visual source of truth for layout and interaction flow — treat mismatches between a written description and a Figma image as a signal to ask, not to pick one arbitrarily.

Read `PROJECT_SPEC.md` in full before starting. This brief gives you the *why* and ties the visuals to the spec; the spec gives you the *exact what*.

---

## 3. The Figma reference images, explained

These are the user's own mockups, in the order they evolved. Later images supersede earlier ones where they conflict — if `07` shows something differently than `03`, trust `07`.

- **`00-methodology-source.png`** — the original 6-step methodology this whole tool is based on. This is the source material, not a UI mockup — it explains *why* the steps are ordered and worded the way they are in `PROJECT_SPEC.md` section 4.

- **`01-mini-form-sketch.png`** — a hand-drawn note establishing the "mini form" pattern: each guided step gets its own question(s) shown above the input, mirroring that step's own sub-question(s) from the methodology — not one big undifferentiated text box per step.

- **`02-use-case-template-example.png`** — a textbook Use Case template (Use Case Name, Actor, ID, Priority, Description, Trigger, Preconditions, Normal Course, Alternative Courses, Postconditions, Exceptions, Summary Inputs/Outputs/Source/Destination). This is the field-shape reference for the `use_case_details` table and the UC-n detail view in `PROJECT_SPEC.md` section 4, Step 8 — **not a literal screen to copy pixel-for-pixel**, just the field list to implement. Of these fields, only Use Case Name, Actor(s), and Summary Inputs/Outputs/Source/Destination are computed automatically from linked data; everything else is a manual field the user fills in optionally.

- **`03-figma-system-tab-steps-1-5.png`** — the SYSTEM tab as a single scrolling page, all 5 steps stacked vertically, each with its guide text shown beside the input (matching the `01` sketch). The top nav shows SYSTEM/UCD/ERD/DFD tabs, with small "UC" and "WBS" sub-tab pills under UCD and ERD respectively. This establishes: **the writing steps are one continuous scroll, not separate tabs** — tabs are only for switching between the deliverable views (UCD/ERD/DFD), not for the input steps themselves.

- **`04-figma-actor-link-early-concept.png`** — an early sketch of an Actor row ("Admin") showing linked processes as chips ("Proc 1", "Proc 2") plus an "Add Process" button. This is the first appearance of the core linking mechanic, before it was generalized and renamed.

- **`05-figma-link-widget-all-rows.png`** — the linking pattern applied consistently: Actor rows, Noun rows, **and Verb rows** all show a chip + a button labeled **"LINK"** (renamed from "Add Process" — see `PROJECT_SPEC.md` section 3d, "Linking widget"). This confirms the button label is generic ("LINK") everywhere, not type-specific, because the row itself already gives context for what's being linked.

- **`06-figma-select-or-create-panel.png`** — what happens when LINK is clicked: a two-panel flow. First panel offers **Select** (pick from existing) or **Create**. If Create is chosen, a second panel asks for a name field plus another **Select** (or **Create**) for whatever piece is still missing — e.g., creating a new Verb from an Actor row asks for the verb name, then asks you to Select (or Create) a Noun for it, since a Verb can't be saved without one. This is the literal implementation of the "trio rule" and "entry points" described in `PROJECT_SPEC.md` section 3d — build the picker exactly as this cascading Select-or-Create flow, not as a single combined form.

- **`07-figma-info-drawio-bigbox.png`** — the shape of the UCD/ERD/DFD deliverable tabs: an "INFO" box above a large box labeled (in the mockup) "UCD/ERD/DFD DRAWIO", with Reload/Save controls. Per later discussion (captured in `PROJECT_SPEC.md` section 4, Step 8), the INFO box is **auto-derived and read-only** (a live summary of Actor→Verb→Noun data, format: `Actor(s) → Verb → Noun(s)`, one row per verb) — the user never types into it directly. The big box below it is the actual draw.io iframe embed, where the user manually draws the diagram, informed by what they read in the INFO box above.

---

## 4. Stack, non-negotiable

- **GitHub** — one repo, `main` = production, schema changes as versioned files under `supabase/migrations/`, never hand-edited in the Supabase dashboard.
- **Vercel** — connected to the repo, auto-deploys on push to `main`.
- **Supabase** — Postgres + auth + client SDK, built on the official `supabase-starter` template. Keep its existing auth/routing rather than rebuilding it. Full schema and RLS are in `PROJECT_SPEC.md` section 3.
- **Next.js** (App Router) — "thin route" pattern: `app/` is routing only, all real logic lives in `features/`. Full folder structure and naming conventions are in `PROJECT_SPEC.md` section 3b.
- **draw.io Embed Mode** (`embed.diagrams.net`) via iframe + postMessage — for ERD, DFD, and the Use Case diagram. Manual drawing only; no auto-generated visual graphs (React Flow, Dagre, or similar were considered and explicitly rejected — see `PROJECT_SPEC.md` section 5).

---

## 5. How to work

1. Read `PROJECT_SPEC.md` fully.
2. Look at every image in `figma-reference/` alongside section 3 above.
3. Skim `frontend-reference/` to internalize the two core patterns (simple add-row, and the trio mini-form).
4. Build in this order: schema + RLS migrations → thin routes + auth (verify starter's auth still works) → guided flow (Title→Idea→Scope→Actors→Nouns→Verbs, including the Select-or-Create linking widget) → sanity check → UCD list view + UC-n detail view → WBS seeding → draw.io embeds for ERD/DFD/Use Case with their auto-derived INFO boxes.
5. If a decision isn't covered by this brief, the spec, or the Figma images — stop and ask. Do not assume, and do not add features from `PROJECT_SPEC.md` section 5's "out of scope" list under any framing.
