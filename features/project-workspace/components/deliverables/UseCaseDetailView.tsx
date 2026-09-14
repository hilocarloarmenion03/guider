"use client";

import { useVerbs } from "../../hooks/useVerbs";
import { useUseCaseDetails } from "../../hooks/useUseCaseDetails";
import { useState, useRef } from "react";

export function UseCaseDetailView({ projectId }: { projectId: string }) {
  const { verbs } = useVerbs(projectId);
  const { details, updateDetail } = useUseCaseDetails(projectId);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (details.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic py-4">
        Use case details are auto-created when verbs are added.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {details.map((uc) => {
        const verb = verbs.find((v) => v.id === uc.verb_id);
        const isExpanded = expanded === uc.id;

        return (
          <div
            key={uc.id}
            className="border border-neutral-200 dark:border-neutral-700 rounded-md"
          >
            {/* Header / summary row */}
            <button
              onClick={() => setExpanded(isExpanded ? null : uc.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
            >
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                UC-{uc.uc_number}: {verb?.name ?? "Unknown"}
              </span>
              <span className="text-xs text-neutral-400">
                {isExpanded ? "▲" : "▼"}
              </span>
            </button>

            {isExpanded && verb && (
              <div className="px-4 pb-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700 pt-3">
                {/* Auto-filled fields (read-only) */}
                <AutoField
                  label="Use Case Name"
                  value={verb.name}
                />
                <AutoField
                  label="ID"
                  value={`UC-${uc.uc_number}`}
                />
                <AutoField
                  label="Actor(s)"
                  value={verb.actorNames.join(", ")}
                />
                <AutoField
                  label="Summary Inputs/Outputs"
                  value={verb.nounNames.join(", ")}
                />
                <AutoField
                  label="Summary Source/Destination"
                  value={verb.actorNames.join(", ")}
                />

                {/* Manual fields */}
                <ManualField
                  label="Priority"
                  value={uc.priority}
                  onSave={(v) => updateDetail(uc.id, { priority: v })}
                  type="text"
                  placeholder="High / Medium / Low"
                />
                <ManualField
                  label="Description"
                  value={uc.description}
                  onSave={(v) => updateDetail(uc.id, { description: v })}
                  type="textarea"
                />
                <ManualField
                  label="Trigger"
                  value={uc.trigger}
                  onSave={(v) => updateDetail(uc.id, { trigger: v })}
                  type="text"
                />
                <ManualField
                  label="Type"
                  value={uc.type}
                  onSave={(v) => updateDetail(uc.id, { type: v })}
                  type="text"
                  placeholder="External / Temporal"
                />
                <ManualField
                  label="Preconditions"
                  value={uc.preconditions}
                  onSave={(v) => updateDetail(uc.id, { preconditions: v })}
                  type="textarea"
                />
                <ManualField
                  label="Normal Course"
                  value={uc.normal_course}
                  onSave={(v) => updateDetail(uc.id, { normal_course: v })}
                  type="textarea"
                />
                <ManualField
                  label="Alternative Courses"
                  value={uc.alternative_courses}
                  onSave={(v) =>
                    updateDetail(uc.id, { alternative_courses: v })
                  }
                  type="textarea"
                />
                <ManualField
                  label="Postconditions"
                  value={uc.postconditions}
                  onSave={(v) => updateDetail(uc.id, { postconditions: v })}
                  type="textarea"
                />
                <ManualField
                  label="Exceptions"
                  value={uc.exceptions}
                  onSave={(v) => updateDetail(uc.id, { exceptions: v })}
                  type="textarea"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AutoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
        {label}{" "}
        <span className="text-neutral-400 dark:text-neutral-500 font-normal">
          (auto)
        </span>
      </span>
      <p className="text-sm text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800/50 rounded px-2 py-1">
        {value || "—"}
      </p>
    </div>
  );
}

function ManualField({
  label,
  value,
  onSave,
  type,
  placeholder,
}: {
  label: string;
  value: string | null;
  onSave: (value: string) => void;
  type: "text" | "textarea";
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function handleChange(v: string) {
    setDraft(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(v);
    }, 600);
  }

  const inputClass =
    "w-full text-sm border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400";

  return (
    <div>
      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}
