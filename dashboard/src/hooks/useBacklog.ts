"use client";

import { useState, useEffect, useCallback } from "react";
import type { BacklogTask } from "@/lib/types";

export function useBacklog() {
  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBacklog = useCallback(async () => {
    try {
      const res = await fetch("/api/backlog");
      if (!res.ok) throw new Error("Failed to fetch backlog");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBacklog();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBacklog, 30000);
    return () => clearInterval(interval);
  }, [fetchBacklog]);

  const updateStatus = useCallback(
    async (id: string, status: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/backlog", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (!res.ok) throw new Error("Failed to update status");
        const data = await res.json();
        setTasks(data);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return false;
      }
    },
    []
  );

  return { tasks, loading, error, refetch: fetchBacklog, updateStatus };
}
