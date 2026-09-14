"use client";

import { useState } from "react";

export function NewProjectButton({
  onCreate,
}: {
  onCreate: (title: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onCreate(trimmed);
      setTitle("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full border-2 border-dashed border-neutral-300
                   dark:border-neutral-600 rounded-lg py-6
                   text-sm text-neutral-500 dark:text-neutral-400
                   hover:border-neutral-400 dark:hover:border-neutral-500
                   hover:text-neutral-700 dark:hover:text-neutral-300
                   transition-colors"
      >
        + New Project
      </button>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Project title"
        className="w-full text-sm border border-neutral-300 dark:border-neutral-600
                   rounded px-2 py-1.5 bg-transparent
                   focus:outline-none focus:ring-2 focus:ring-neutral-400"
      />
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={!title.trim() || saving}
          className="text-sm px-3 py-1 rounded bg-neutral-800 dark:bg-neutral-200
                     text-white dark:text-neutral-900
                     hover:bg-neutral-700 dark:hover:bg-neutral-300
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Creating…" : "Create"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setTitle("");
          }}
          className="text-sm px-3 py-1 text-neutral-500 hover:text-neutral-700
                     dark:hover:text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
