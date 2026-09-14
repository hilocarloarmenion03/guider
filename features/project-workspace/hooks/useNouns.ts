"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNouns, insertNoun, removeNoun, type Noun } from "../api";

export function useNouns(projectId: string) {
  const [nouns, setNouns] = useState<Noun[]>([]);

  const load = useCallback(async () => {
    const data = await fetchNouns(projectId);
    setNouns(data);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addNoun = useCallback(
    async (name: string) => {
      const row = await insertNoun(projectId, name);
      setNouns((prev) => [...prev, row]);
    },
    [projectId]
  );

  const deleteNoun = useCallback(async (id: string) => {
    await removeNoun(id);
    setNouns((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { nouns, addNoun, deleteNoun, reload: load };
}
