"use client";

import { useWbsItems } from "../../hooks/useWbsItems";
import { useProject } from "../../hooks/useProject";
import { useState } from "react";

export function WbsView({ projectId }: { projectId: string }) {
  const { project } = useProject(projectId);
  const { items, addItem, deleteItem, seedFromScope } =
    useWbsItems(projectId);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [seeded, setSeeded] = useState(false);

  const topLevel = items.filter((i) => !i.parent_id);
  const childrenOf = (parentId: string) =>
    items.filter((i) => i.parent_id === parentId);

  async function handleSeed() {
    if (!project?.scope_in) return;
    await seedFromScope(project.scope_in);
    setSeeded(true);
  }

  async function handleAddChild(parentId: string) {
    const trimmed = childName.trim();
    if (!trimmed) return;
    await addItem(trimmed, parentId);
    setChildName("");
    setAddingChildOf(null);
  }

  return (
    <div className="space-y-3">
      {/* Seed button */}
      {topLevel.length === 0 && !seeded && (
        <button
          onClick={handleSeed}
          disabled={!project?.scope_in}
          className="text-sm px-3 py-1.5 rounded bg-neutral-800 dark:bg-neutral-200
                     text-white dark:text-neutral-900
                     hover:bg-neutral-700 dark:hover:bg-neutral-300
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Seed WBS from Scope In
        </button>
      )}

      {topLevel.length === 0 && (
        <p className="text-sm text-neutral-400 italic">
          {project?.scope_in
            ? 'Click "Seed WBS from Scope In" to auto-create top-level items from your scope.'
            : "Fill in the Scope step first to seed the WBS."}
        </p>
      )}

      {/* WBS tree */}
      <div className="space-y-1">
        {topLevel.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {item.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAddingChildOf(
                      addingChildOf === item.id ? null : item.id
                    );
                    setChildName("");
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  + Child
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-xs text-neutral-400 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="ml-6 space-y-1 mt-1">
              {childrenOf(item.id).map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between px-3 py-1 border border-neutral-100 dark:border-neutral-700 rounded"
                >
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {child.name}
                  </span>
                  <button
                    onClick={() => deleteItem(child.id)}
                    className="text-xs text-neutral-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Inline add child */}
              {addingChildOf === item.id && (
                <div className="flex items-center gap-2 px-3 py-1">
                  <input
                    autoFocus
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddChild(item.id)
                    }
                    placeholder="Child item name"
                    className="flex-1 text-sm border border-neutral-300 dark:border-neutral-600
                               rounded px-2 py-1 bg-transparent
                               focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <button
                    onClick={() => handleAddChild(item.id)}
                    className="text-sm px-2 py-0.5 rounded bg-neutral-800 dark:bg-neutral-200
                               text-white dark:text-neutral-900 text-xs"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
