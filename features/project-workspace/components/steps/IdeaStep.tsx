"use client";

import { useProject } from "../../hooks/useProject";
import { useState, useEffect, useRef } from "react";

export function IdeaStep({ projectId }: { projectId: string }) {
  const { project, update } = useProject(projectId);
  const [idea, setIdea] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (project) setIdea(project.idea ?? "");
  }, [project]);

  function handleChange(value: string) {
    setIdea(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      update({ idea: value });
    }, 500);
  }

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Idea / Problem Statement
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Describe the problem like you&apos;re talking to a friend. No diagrams
          yet — just the why.
        </p>
      </div>
      <textarea
        id="project-idea"
        value={idea}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="What problem does this system solve?"
        rows={4}
        className="w-full text-sm border border-neutral-300 dark:border-neutral-600
                   rounded px-3 py-2 bg-transparent resize-y
                   focus:outline-none focus:ring-2 focus:ring-neutral-400"
      />
    </section>
  );
}
