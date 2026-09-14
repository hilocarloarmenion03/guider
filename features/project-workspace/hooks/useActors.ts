"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchActors, insertActor, removeActor, type Actor } from "../api";

export function useActors(projectId: string) {
  const [actors, setActors] = useState<Actor[]>([]);

  const load = useCallback(async () => {
    const data = await fetchActors(projectId);
    setActors(data);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addActor = useCallback(
    async (name: string) => {
      const row = await insertActor(projectId, name);
      setActors((prev) => [...prev, row]);
    },
    [projectId]
  );

  const deleteActor = useCallback(async (id: string) => {
    await removeActor(id);
    setActors((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { actors, addActor, deleteActor, reload: load };
}
