"use client";

import { AddRowList } from "../AddRowList";
import { useActors } from "../../hooks/useActors";

export function ActorsStep({ projectId }: { projectId: string }) {
  const { actors, addActor, deleteActor } = useActors(projectId);

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Actors
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
