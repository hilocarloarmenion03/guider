// features/project-workspace/components/AddRowList.tsx
//
// Reusable "Supabase-table-editor style" add-row list.
// Used for simple single-field repeatable steps: Actors, Nouns.

"use client";

import { useState } from "react";

type Row = { id: string; name: string };

type AddRowListProps = {
  label: string; // e.g. "Actor name", "Noun name"
  rows: Row[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
};

export function AddRowList({ label, rows, onAdd, onDelete }: AddRowListProps) {
  const [draft, setDraft] = useState("");

  function handleAdd() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-md divide-y divide-neutral-200 dark:divide-neutral-700">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center justify-between px-3 py-2"
        >
          <span className="text-sm text-neutral-800 dark:text-neutral-200">
            {row.name}
          </span>
          <button
            onClick={() => onDelete(row.id)}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            aria-label={`Remove ${row.name}`}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 px-3 py-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={label}
          className="flex-1 text-sm border border-neutral-300 dark:border-neutral-600
                     rounded px-2 py-1 bg-transparent
                     focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <button
          onClick={handleAdd}
          className="text-sm px-3 py-1 rounded bg-neutral-800 dark:bg-neutral-200
                     text-white dark:text-neutral-900
                     hover:bg-neutral-700 dark:hover:bg-neutral-300"
        >
          Add
        </button>
      </div>
    </div>
  );
}
