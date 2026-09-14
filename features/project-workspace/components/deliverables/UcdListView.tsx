"use client";

import { useVerbs } from "../../hooks/useVerbs";

export function UcdListView({ projectId }: { projectId: string }) {
  const { verbs } = useVerbs(projectId);

  if (verbs.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic py-4">
        No verbs have been created yet. Fill in the Verbs step above to see the
        Use Case list.
      </p>
    );
  }

  // Group verbs by actor — a verb with multiple actors appears under each
  const actorMap: Record<string, typeof verbs> = {};
  for (const v of verbs) {
    for (const actorName of v.actorNames) {
      if (!actorMap[actorName]) actorMap[actorName] = [];
      actorMap[actorName].push(v);
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(actorMap).map(([actorName, actorVerbs]) => (
        <div key={actorName}>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            {actorName}
          </h3>
          <ul className="ml-4 space-y-0.5">
            {actorVerbs.map((v) => (
              <li
                key={v.id}
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                <strong>{v.name}</strong> → {v.nounNames.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
