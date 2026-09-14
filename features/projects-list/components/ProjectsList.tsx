"use client";

import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "./ProjectCard";
import { NewProjectButton } from "./NewProjectButton";
import { LogoutButton } from "@/components/logout-button";

export function ProjectsList() {
  const { projects, loading, addProject, removeProject } = useProjects();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          My Projects
        </h1>
        <LogoutButton />
      </div>

      <div className="space-y-3">
        <NewProjectButton
          onCreate={async (title) => {
            await addProject(title);
          }}
        />

        {loading && projects.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">
            Loading…
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">
            No projects yet. Create one to get started.
          </p>
        )}

        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onDelete={removeProject} />
        ))}
      </div>
    </div>
  );
}
