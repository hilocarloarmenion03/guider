// features/project-workspace/components/steps/ActorsStep.tsx

import { AddRowList } from '../AddRowList';
import { useActors } from '../../hooks/useActors';

export function ActorsStep({ projectId }: { projectId: string }) {
  const { actors, addActor, deleteActor } = useActors(projectId);

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-base font-medium text-neutral-900">Actors</h2>
        <p className="text-sm text-neutral-500">
          Who will actually touch this system?
        </p>
      </div>

      <AddRowList
        label="Actor name"
        rows={actors}
        onAdd={addActor}
        onDelete={deleteActor}
      />
    </section>
  );
}

// NounsStep.tsx follows the exact same shape — swap useActors -> useNouns,
// "Actor name" -> "Noun name", "Who will actually touch this system?" ->
// "Not attributes yet, just nouns — the main things the system needs to
// remember." Do not introduce a different pattern for Nouns.
