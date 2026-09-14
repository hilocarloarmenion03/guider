// features/project-workspace/components/steps/VerbsStep.tsx
//
// Mini-form step: each verb links one-or-more actors to one-or-more nouns.
// Both "Done by" and "Involves" are multi-select toggle pickers.

"use client";

import { useState } from "react";
import { useActors } from "../../hooks/useActors";
import { useNouns } from "../../hooks/useNouns";
import { useVerbs } from "../../hooks/useVerbs";

export function VerbsStep({ projectId }: { projectId: string }) {
  const { actors } = useActors(projectId);
  const { nouns } = useNouns(projectId);
  const { verbs, addVerb, deleteVerb } = useVerbs(projectId);

  const [name, setName] = useState("");
  const [actorIds, setActorIds] = useState<string[]>([]);
  const [nounIds, setNounIds] = useState<string[]>([]);

  function toggleActor(id: string) {
    setActorIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function toggleNoun(id: string) {
    setNounIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  }

  async function handleAdd() {
    if (!name.trim() || actorIds.length === 0 || nounIds.length === 0) return;
    await addVerb({ name: name.trim(), actorIds, nounIds });
    setName("");
    setActorIds([]);
    setNounIds([]);
  }

  const canSave = name.trim() && actorIds.length > 0 && nounIds.length > 0;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Verbs
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Just verbs — the main things the system does.
        </p>
      </div>

      <div className="border border-neutral-200 dark:border-neutral-700 rounded-md divide-y divide-neutral-200 dark:divide-neutral-700">
        {/* Existing verbs, shown read-only */}
        {verbs.map((verb) => (
          <div
            key={verb.id}
            className="flex items-center justify-between px-3 py-2"
          >
            <span className="text-sm text-neutral-800 dark:text-neutral-200">
              <strong>{verb.name}</strong>
              {" — "}
              <span className="text-neutral-500 dark:text-neutral-400">
                {verb.actorNames.join(", ")} · involves{" "}
                {verb.nounNames.join(", ")}
              </span>
            </span>
            <button
              onClick={() => deleteVerb(verb.id)}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Remove
            </button>
          </div>
        ))}

        {/* The mini-form for a new verb */}
        <div className="px-3 py-3 space-y-2 bg-neutral-50 dark:bg-neutral-800/50">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Verb (e.g. "claim item")'
            className="w-full text-sm border border-neutral-300 dark:border-neutral-600
                       rounded px-2 py-1 bg-transparent
                       focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />

          <div>
            <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
              Done by (select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {actors.length === 0 && (
                <span className="text-xs text-neutral-400 italic">
                  Add actors first
                </span>
              )}
              {actors.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleActor(a.id)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    actorIds.includes(a.id)
                      ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200"
                      : "border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
              Involves (select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {nouns.length === 0 && (
                <span className="text-xs text-neutral-400 italic">
                  Add nouns first
                </span>
              )}
              {nouns.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => toggleNoun(n.id)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    nounIds.includes(n.id)
                      ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200"
                      : "border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!canSave}
            className="text-sm px-3 py-1 rounded bg-neutral-800 dark:bg-neutral-200
                       text-white dark:text-neutral-900
                       hover:bg-neutral-700 dark:hover:bg-neutral-300
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add verb
          </button>
        </div>
      </div>
    </section>
  );
}
