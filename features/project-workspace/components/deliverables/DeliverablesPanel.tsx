"use client";

import { useState } from "react";
import { UcdListView } from "./UcdListView";
import { UseCaseDetailView } from "./UseCaseDetailView";
import { DiagramCanvas } from "./DiagramCanvas";
import { WbsView } from "./WbsView";
import { useVerbs } from "../../hooks/useVerbs";
import { useActors } from "../../hooks/useActors";
import { useNouns } from "../../hooks/useNouns";

type MainTab = "SYSTEM" | "UCD" | "ERD" | "DFD";
type SubTab = "list" | "UC" | "WBS";

export function DeliverablesPanel({ projectId }: { projectId: string }) {
  const [mainTab, setMainTab] = useState<MainTab>("UCD");
  const [subTab, setSubTab] = useState<SubTab>("list");
  const { verbs } = useVerbs(projectId);
  const { actors } = useActors(projectId);
  const { nouns } = useNouns(projectId);

  // Build the INFO box summaries
  function buildUcdInfo() {
    return verbs.map(
      (v) => `${v.actorNames.join(", ")}  →  ${v.name}  →  ${v.nounNames.join(", ")}`
    );
  }

  function buildErdInfo() {
    // One row per noun: Noun ← Verb(s) that touch it ← Actor(s) involved
    const nounMap: Record<string, { verbs: Set<string>; actors: Set<string> }> = {};
    for (const v of verbs) {
      for (let i = 0; i < v.nounIds.length; i++) {
        const nounName = v.nounNames[i];
        if (!nounMap[nounName]) {
          nounMap[nounName] = { verbs: new Set(), actors: new Set() };
        }
        nounMap[nounName].verbs.add(v.name);
        v.actorNames.forEach((a) => nounMap[nounName].actors.add(a));
      }
    }
    return Object.entries(nounMap).map(
      ([noun, { verbs: vs, actors: as_ }]) =>
        `${noun}  ←  ${[...vs].join(", ")}  ←  ${[...as_].join(", ")}`
    );
  }

  function buildDfdInfo() {
    // Same as UCD: Actor(s) → Verb → Noun(s)
    return buildUcdInfo();
  }

  const mainTabs: MainTab[] = ["UCD", "ERD", "DFD"];

  return (
    <section className="space-y-4">
      <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        Deliverables
      </h2>

      {/* Main tab nav */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-700">
        {mainTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setMainTab(tab);
              setSubTab("list");
            }}
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              mainTab === tab
                ? "border-neutral-800 dark:border-neutral-200 text-neutral-900 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {tab}
            {/* Sub-tab pills */}
            {tab === "UCD" && (
              <span className="ml-1 text-[10px] text-neutral-400">UC</span>
            )}
            {tab === "ERD" && (
              <span className="ml-1 text-[10px] text-neutral-400">WBS</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-tab pills for UCD */}
      {mainTab === "UCD" && (
        <div className="flex gap-1">
          <PillButton
            active={subTab === "list"}
            onClick={() => setSubTab("list")}
          >
            List
          </PillButton>
          <PillButton
            active={subTab === "UC"}
            onClick={() => setSubTab("UC")}
          >
            UC Details
          </PillButton>
        </div>
      )}

      {/* Sub-tab pills for ERD */}
      {mainTab === "ERD" && (
        <div className="flex gap-1">
          <PillButton
            active={subTab === "list"}
            onClick={() => setSubTab("list")}
          >
            Diagram
          </PillButton>
          <PillButton
            active={subTab === "WBS"}
            onClick={() => setSubTab("WBS")}
          >
            WBS
          </PillButton>
        </div>
      )}

      {/* Content */}
      {mainTab === "UCD" && subTab === "list" && (
        <>
          <InfoBox lines={buildUcdInfo()} label="UCD Info" />
          <DiagramCanvas projectId={projectId} diagramType="use_case" />
        </>
      )}

      {mainTab === "UCD" && subTab === "UC" && (
        <UseCaseDetailView projectId={projectId} />
      )}

      {mainTab === "ERD" && subTab === "list" && (
        <>
          <InfoBox lines={buildErdInfo()} label="ERD Info" />
          <DiagramCanvas projectId={projectId} diagramType="erd" />
        </>
      )}

      {mainTab === "ERD" && subTab === "WBS" && (
        <WbsView projectId={projectId} />
      )}

      {mainTab === "DFD" && (
        <>
          <InfoBox lines={buildDfdInfo()} label="DFD Info" />
          <DiagramCanvas projectId={projectId} diagramType="dfd" />
        </>
      )}
    </section>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
        active
          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200"
          : "border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

function InfoBox({ lines, label }: { lines: string[]; label: string }) {
  if (lines.length === 0) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-md px-4 py-3">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
          {label}
        </p>
        <p className="text-sm text-neutral-400 italic">
          Add verbs with linked actors and nouns to see the summary here.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-md px-4 py-3">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
        {label} (read-only — auto-derived from your data)
      </p>
      <ul className="space-y-0.5">
        {lines.map((line, i) => (
          <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 font-mono">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
