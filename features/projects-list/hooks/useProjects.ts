"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchProjects,
  createProject,
  deleteProject,
  type ProjectRow,
} from "../api";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProject = useCallback(
    async (title: string) => {
      const row = await createProject(title);
      setProjects((prev) => [row, ...prev]);
      return row;
    },
    []
  );

  const removeProject = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { projects, loading, addProject, removeProject, reload: load };
}
