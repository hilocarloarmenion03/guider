"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchVerbs,
  insertVerb,
  removeVerb,
  type VerbRow,
} from "../api";

export function useVerbs(projectId: string) {
  const [verbs, setVerbs] = useState<VerbRow[]>([]);

  const load = useCallback(async () => {
    const data = await fetchVerbs(projectId);
    setVerbs(data);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addVerb = useCallback(
    async (payload: { name: string; actorIds: string[]; nounIds: string[] }) => {
      await insertVerb(projectId, payload);
      // Reload to get the server-resolved names / join data
      await load();
    },
    [projectId, load]
  );

  const deleteVerb = useCallback(
    async (id: string) => {
      await removeVerb(id);
      setVerbs((prev) => prev.filter((v) => v.id !== id));
    },
    []
  );

  return { verbs, addVerb, deleteVerb, reload: load };
}
