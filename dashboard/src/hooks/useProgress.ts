"use client";

import { useState, useEffect } from "react";
import type { ProgressFile } from "@/lib/types";

export function useProgress(id: string) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch(`/api/progress/${id}`);
        if (res.status === 404) {
          setProgress(null);
          setError(null);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch progress");
        const data = await res.json();
        setProgress(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [id]);

  return { progress, loading, error };
}
