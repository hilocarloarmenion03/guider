"use client";

import { useProject } from "../../hooks/useProject";
import { useState, useEffect, useRef } from "react";

export function TitleStep({ projectId }: { projectId: string }) {
  const { project, update } = useProject(projectId);
  const [title, setTitle] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (project) setTitle(project.title);
  }, [project]);

  function handleChange(value: string) {
    setTitle(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      update({ title: value });
    }, 500);
  }

  return (
    <section className="space-y-2">
      <label
        htmlFor="project-title"
        className="text-base font-medium text-neutral-900 dark:text-neutral-100"
      >
        Project Title
      </label>
      <input
        id="project-title"
        type="text"
        value={title}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="e.g. Lost and Found System"
        className="w-full text-sm border border-neutral-300 dark:border-neutral-600
                   rounded px-3 py-2 bg-transparent
                   focus:outline-none focus:ring-2 focus:ring-neutral-400"
      />
    </section>
  );
}
