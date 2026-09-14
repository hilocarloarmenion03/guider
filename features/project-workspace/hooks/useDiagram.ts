"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDiagram,
  upsertDiagram,
  type DiagramType,
  type DiagramRow,
} from "../api";

export function useDiagram(projectId: string, diagramType: DiagramType) {
  const [diagram, setDiagram] = useState<DiagramRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDiagram(projectId, diagramType);
      setDiagram(data);
    } finally {
      setLoading(false);
    }
  }, [projectId, diagramType]);

  useEffect(() => {
    load();
  }, [load]);

  const saveXml = useCallback(
    async (xml: string) => {
      await upsertDiagram(projectId, diagramType, xml);
      setDiagram((prev) =>
        prev ? { ...prev, xml } : { id: "", diagram_type: diagramType, xml }
      );
    },
    [projectId, diagramType]
  );

  return { diagram, loading, saveXml, reload: load };
}
