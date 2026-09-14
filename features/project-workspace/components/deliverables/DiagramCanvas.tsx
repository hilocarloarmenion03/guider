"use client";

import { useRef, useEffect, useCallback } from "react";
import { useDiagram } from "../../hooks/useDiagram";
import type { DiagramType } from "../../api";

const DRAWIO_URL = "https://embed.diagrams.net/?embed=1&proto=json&spin=1&saveAndExit=1&noSaveBtn=0&noExitBtn=1";

export function DiagramCanvas({
  projectId,
  diagramType,
}: {
  projectId: string;
  diagramType: DiagramType;
}) {
  const { diagram, loading, saveXml } = useDiagram(projectId, diagramType);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== "https://embed.diagrams.net") return;

      let msg;
      try {
        msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (msg.event === "init") {
        // draw.io is ready — load existing XML or blank
        const xml = diagram?.xml || "";
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            action: "load",
            xml: xml,
            autosave: 1,
          }),
          "https://embed.diagrams.net"
        );
        initializedRef.current = true;
      }

      if (msg.event === "save" || msg.event === "autosave") {
        saveXml(msg.xml);
      }

      if (msg.event === "exit") {
        // User clicked exit — save the latest
        if (msg.xml) {
          saveXml(msg.xml);
        }
      }
    },
    [diagram, saveXml]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  if (loading) {
    return (
      <div className="h-[500px] border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
        <p className="text-sm text-neutral-400">Loading diagram…</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
      <iframe
        ref={iframeRef}
        src={DRAWIO_URL}
        className="w-full h-[500px] border-0"
        title={`${diagramType} diagram`}
      />
    </div>
  );
}
