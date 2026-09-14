"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchUseCaseDetails,
  updateUseCaseDetail,
  type UseCaseDetail,
} from "../api";

export function useUseCaseDetails(projectId: string) {
  const [details, setDetails] = useState<UseCaseDetail[]>([]);

  const load = useCallback(async () => {
    const data = await fetchUseCaseDetails(projectId);
    setDetails(data);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateDetail = useCallback(
    async (
      id: string,
      fields: Partial<Omit<UseCaseDetail, "id" | "verb_id" | "uc_number">>
    ) => {
      await updateUseCaseDetail(id, fields);
      setDetails((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...fields } : d))
      );
    },
    []
  );

  return { details, updateDetail, reload: load };
}
