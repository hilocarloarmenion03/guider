"use client";

import { useProject } from "../../hooks/useProject";
import { useState, useEffect, useRef } from "react";

export function ScopeStep({ projectId }: { projectId: string }) {
  const { project, update } = useProject(projectId);
  const [scopeIn, setScopeIn] = useState("");
  const [scopeOut, setScopeOut] = useState("");
  const debounceInRef = useRef<ReturnType<typeof setTimeout>>();
  const debounceOutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (project) {
      setScopeIn(project.scope_in ?? "");
      setScopeOut(project.scope_out ?? "");
    }
  }, [project]);

  function handleScopeIn(value: string) {
    setScopeIn(value);
    clearTimeout(debounceInRef.current);
    debounceInRef.current = setTimeout(() => {
      update({ scope_in: value });
    }, 500);
  }

  function handleScopeOut(value: string) {
    setScopeOut(value);
    clearTimeout(debounceOutRef.current);
    debounceOutRef.current = setTimeout(() => {
      update({ scope_out: value });
    }, 500);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Scope
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Decide boundaries before anything else, or your diagrams will balloon.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="scope-in"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          What&apos;s IN
        </label>
        <textarea
          id="scope-in"
          value={scopeIn}
          onChange={(e) => handleScopeIn(e.target.value)}
          placeholder="One feature or capability per line"
          rows={4}
          className="w-full text-sm border border-neutral-300 dark:border-neutral-600
                     rounded px-3 py-2 bg-transparent resize-y
                     focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="scope-out"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          What&apos;s OUT
        </label>
        <textarea
          id="scope-out"
          value={scopeOut}
          onChange={(e) => handleScopeOut(e.target.value)}
          placeholder="Explicitly excluded features"
          rows={3}
          className="w-full text-sm border border-neutral-300 dark:border-neutral-600
                     rounded px-3 py-2 bg-transparent resize-y
                     focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>
    </section>
  );
}
