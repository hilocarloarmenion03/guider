# System Making Guide — Progress & Resume Checklist

**Status as of 2026-09-14:** Template cleaned, DB migrations created, ready to build `features/projects-list` and `features/project-workspace`.

---

## 1. Completed So Far

- [x] **Inspected handoff package**:
  - `START_HERE.md` and `PROJECT_SPEC.md` analyzed in full.
  - All 8 Figma reference mockups reviewed (`00` to `07`).
  - Reference components in `frontend-reference/` studied.
- [x] **Template Cleanup (Phase 1)**:
  - Deleted starter tutorial bloat (`components/tutorial/`, `components/hero.tsx`, `components/deploy-button.tsx`, `components/next-logo.tsx`, `components/supabase-logo.tsx`, `app/protected/`).
  - Added [middleware.ts](file:///c:/Users/libra/Music/guider-1/middleware.ts) to hook Supabase session cookies.
  - Set [app/page.tsx](file:///c:/Users/libra/Music/guider-1/app/page.tsx) as a thin route redirecting authenticated users to `/projects` and unauthenticated users to `/auth/login`.
  - Added [app/login/page.tsx](file:///c:/Users/libra/Music/guider-1/app/login/page.tsx) redirect to `/auth/login`.
  - Updated [app/layout.tsx](file:///c:/Users/libra/Music/guider-1/app/layout.tsx) metadata for "System Making Guide".
- [x] **Database Migrations (Phase 2)**:
  - Created [supabase/migrations/0001_init.sql](file:///c:/Users/libra/Music/guider-1/supabase/migrations/0001_init.sql) with all 9 tables, indexes, and the `create_use_case_detail` auto-increment trigger.
  - Created [supabase/migrations/0002_rls.sql](file:///c:/Users/libra/Music/guider-1/supabase/migrations/0002_rls.sql) with strict user-scoped RLS policies.

---

## 2. Exactly Where to Pick Up Next

### Step A: Projects List Feature (`features/projects-list`)
1. Create `features/projects-list/api.ts` (queries for fetching, creating, and deleting projects).
2. Create `features/projects-list/hooks/useProjects.ts`.
3. Create UI components:
   - `features/projects-list/components/ProjectCard.tsx`
   - `features/projects-list/components/NewProjectButton.tsx`
   - `features/projects-list/components/ProjectsList.tsx`
4. Create thin route [app/projects/page.tsx](file:///c:/Users/libra/Music/guider-1/app/projects/page.tsx).

### Step B: Project Workspace Feature (`features/project-workspace`)
1. `features/project-workspace/types.ts`
2. `features/project-workspace/api.ts` (all Supabase mutations for workspace graph)
3. Hooks: `useProject.ts`, `useActors.ts`, `useNouns.ts`, `useVerbs.ts`, `useUseCaseDetails.ts`, `useWbsItems.ts`, `useDiagram.ts`
4. Components:
   - `AddRowList.tsx` (single repeatable row with chips and "LINK" button)
   - `LinkWidgetModal.tsx` (cascading Select-or-Create modal from Figma `05`/`06`)
   - Steps:
     - `TitleStep.tsx`
     - `IdeaStep.tsx`
     - `ScopeStep.tsx`
     - `ActorsStep.tsx`
     - `NounsStep.tsx`
     - `VerbsStep.tsx` (trio rule: disabled until name + >=1 actor + >=1 noun)
     - `SanityCheckNotice.tsx` (keyword overlap check against Scope IN)
   - Deliverables:
     - `DeliverablesPanel.tsx` (top navigation tabs: SYSTEM, UCD, ERD, DFD + UC & WBS sub-pills)
     - `UcdListView.tsx` (`Actor → Verb → Noun(s)`)
     - `UseCaseDetailView.tsx` (UC-n template matching Figure 4-1 with auto & manual fields)
     - `DiagramCanvas.tsx` (draw.io iframe with postMessage XML persistence + live read-only INFO summary box)
     - `WbsView.tsx` (seed from Scope IN lines + hierarchical child items)
     - `OnePagerExport.tsx` (bonus one-pager markdown export)
5. Create thin route [app/projects/[projectId]/page.tsx](file:///c:/Users/libra/Music/guider-1/app/projects/[projectId]/page.tsx).
