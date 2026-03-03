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

  return { tasks, loading, error, refetch: fetchBacklog };
}
