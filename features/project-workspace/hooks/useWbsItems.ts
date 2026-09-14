"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWbsItems,
  insertWbsItem,
  removeWbsItem,
  seedWbsFromScope,
  type WbsItem,
} from "../api";

export function useWbsItems(projectId: string) {
  const [items, setItems] = useState<WbsItem[]>([]);

  const load = useCallback(async () => {
    const data = await fetchWbsItems(projectId);
    setItems(data);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = useCallback(
    async (name: string, parentId: string | null = null) => {
      const row = await insertWbsItem(projectId, name, parentId);
      setItems((prev) => [...prev, row]);
    },
    [projectId]
  );

  const deleteItem = useCallback(async (id: string) => {
    await removeWbsItem(id);
    // Cascade delete takes care of children on the server; reload for clean state
    setItems((prev) => prev.filter((i) => i.id !== id && i.parent_id !== id));
  }, []);

  const seedFromScope = useCallback(
    async (scopeIn: string) => {
      const newItems = await seedWbsFromScope(projectId, scopeIn);
      setItems((prev) => [...prev, ...newItems]);
    },
    [projectId]
  );

  return { items, addItem, deleteItem, seedFromScope, reload: load };
}
