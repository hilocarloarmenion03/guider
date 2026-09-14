"use client";

import { useProject } from "../../hooks/useProject";
import { useVerbs } from "../../hooks/useVerbs";
import { findUnlinkedVerbs } from "../../utils/sanityCheck";
import { useState } from "react";

export function SanityCheckNotice({ projectId }: { projectId: string }) {
  const { project } = useProject(projectId);
  const { verbs } = useVerbs(projectId);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!project || verbs.length === 0) return null;

  const unlinked = findUnlinkedVerbs(
    project.scope_in,
    verbs.map((v) => v.name)
  ).filter((name) => !dismissed.has(name));

  if (unlinked.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="rounded-md border border-amber-300 dark:border-amber-700
                      bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
          Sanity Check
        </p>
        <ul className="space-y-1">
          {unlinked.map((verbName) => (
            <li
              key={verbName}
              className="flex items-center justify-between text-sm text-amber-700 dark:text-amber-400"
            >
              <span>
                &ldquo;{verbName}&rdquo; doesn&apos;t obviously connect to your
                scope — intentional?
              </span>
              <button
                onClick={() =>
                  setDismissed((prev) => new Set(prev).add(verbName))
                }
                className="text-xs text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 ml-2"
              >
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
