// features/project-workspace/components/ProjectWorkspace.tsx
//
// This is the whole guided flow: ONE scrolling page, steps stacked in
// order. Do NOT split these into separate tabs/routes. app/projects/
// [projectId]/page.tsx should just render <ProjectWorkspace projectId={id} />
// and nothing else — all logic lives here and in the imported step files.

import { TitleStep } from './steps/TitleStep';
import { IdeaStep } from './steps/IdeaStep';
import { ScopeStep } from './steps/ScopeStep';
import { ActorsStep } from './steps/ActorsStep';
import { NounsStep } from './steps/NounsStep';
import { VerbsStep } from './steps/VerbsStep';
import { SanityCheckNotice } from './steps/SanityCheckNotice';
import { DeliverablesPanel } from './deliverables/DeliverablesPanel';

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <TitleStep projectId={projectId} />
      <IdeaStep projectId={projectId} />
      <ScopeStep projectId={projectId} />
      <ActorsStep projectId={projectId} />
      <NounsStep projectId={projectId} />
      <VerbsStep projectId={projectId} />
      <SanityCheckNotice projectId={projectId} />
      <DeliverablesPanel projectId={projectId} />
    </main>
  );
}

// Notes for the agent:
// - Steps are plain stacked <section> blocks (see ActorsStep.tsx / VerbsStep.tsx
//   for the section heading + guide-text pattern all steps must follow).
// - Do not gate steps behind clicks/tabs. Scrolling IS the navigation.
// - Order enforcement (spec section 7): Verbs' actor/noun pickers will just be
//   empty if Actors/Nouns haven't been filled yet — that's enough of a natural
//   nudge. Don't build a separate "locking" mechanism on top of that.
