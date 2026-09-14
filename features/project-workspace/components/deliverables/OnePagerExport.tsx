"use client";

import { useProject } from "../../hooks/useProject";
import { useActors } from "../../hooks/useActors";
import { useNouns } from "../../hooks/useNouns";
import { useVerbs } from "../../hooks/useVerbs";

export function OnePagerExport({ projectId }: { projectId: string }) {
  const { project } = useProject(projectId);
  const { actors } = useActors(projectId);
  const { nouns } = useNouns(projectId);
  const { verbs } = useVerbs(projectId);

  if (!project) return null;

  function generateMarkdown() {
    const lines: string[] = [];
    lines.push(`# ${project!.title}`);
    lines.push("");

    if (project!.idea) {
      lines.push("## Problem Statement");
      lines.push(project!.idea);
      lines.push("");
    }

    if (project!.scope_in) {
      lines.push("## Scope — In");
      lines.push(project!.scope_in);
      lines.push("");
    }

    if (project!.scope_out) {
      lines.push("## Scope — Out");
      lines.push(project!.scope_out);
      lines.push("");
    }

    if (actors.length > 0) {
      lines.push("## Actors");
      actors.forEach((a) => lines.push(`- ${a.name}`));
      lines.push("");
    }

    if (nouns.length > 0) {
      lines.push("## Nouns");
      nouns.forEach((n) => lines.push(`- ${n.name}`));
      lines.push("");
    }

    if (verbs.length > 0) {
      lines.push("## Verbs (Use Cases)");
      verbs.forEach((v) => {
        lines.push(
          `- **${v.name}** — ${v.actorNames.join(", ")} → ${v.nounNames.join(", ")}`
        );
      });
      lines.push("");
    }

    return lines.join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateMarkdown());
  }

  function handleDownload() {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project!.title.replace(/\s+/g, "_")}_one_pager.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        One-Pager Export
      </h3>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="text-sm px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600
                     text-neutral-700 dark:text-neutral-300
                     hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Copy as Markdown
        </button>
        <button
          onClick={handleDownload}
          className="text-sm px-3 py-1 rounded bg-neutral-800 dark:bg-neutral-200
                     text-white dark:text-neutral-900
                     hover:bg-neutral-700 dark:hover:bg-neutral-300"
        >
          Download .md
        </button>
      </div>
    </div>
  );
}
