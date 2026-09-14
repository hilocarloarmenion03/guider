"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProject, updateProject, type Project } from "../api";

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProject(projectId);
      setProject(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (
      fields: Partial<Pick<Project, "title" | "idea" | "scope_in" | "scope_out">>
    ) => {
      await updateProject(projectId, fields);
      setProject((prev) => (prev ? { ...prev, ...fields } : prev));
    },
    [projectId]
  );

  return { project, loading, update, reload: load };
}
