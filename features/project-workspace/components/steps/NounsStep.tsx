"use client";

import { AddRowList } from "../AddRowList";
import { useNouns } from "../../hooks/useNouns";

export function NounsStep({ projectId }: { projectId: string }) {
  const { nouns, addNoun, deleteNoun } = useNouns(projectId);

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Nouns
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Not attributes yet, just nouns — the main things the system needs to
          remember.
        </p>
      </div>

      <AddRowList
        label="Noun name"
        rows={nouns}
        onAdd={addNoun}
        onDelete={deleteNoun}
      />
    </section>
  );
}
