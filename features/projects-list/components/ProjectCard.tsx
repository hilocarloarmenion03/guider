"use client";

import { type ProjectRow } from "../api";
import { useRouter } from "next/navigation";

export function ProjectCard({
  project,
  onDelete,
}: {
  project: ProjectRow;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  const updated = new Date(project.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      className="group relative border border-neutral-200 dark:border-neutral-700
                 rounded-lg p-4 cursor-pointer
                 hover:border-neutral-400 dark:hover:border-neutral-500
                 transition-colors"
    >
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
        {project.title}
      </h3>

      {project.idea && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
          {project.idea}
        </p>
      )}

      <p className="mt-2 text-[11px] text-neutral-400 dark:text-neutral-500">
        Updated {updated}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
        className="absolute top-3 right-3 text-xs text-neutral-400
                   hover:text-red-500 opacity-0 group-hover:opacity-100
                   transition-opacity"
        aria-label={`Delete ${project.title}`}
      >
        Delete
      </button>
    </div>
  );
}
