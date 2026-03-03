"use client";

import { useState, useEffect } from "react";
import type { SpecFile } from "@/lib/types";

export function useSpec(id: string) {
  const [spec, setSpec] = useState<SpecFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      try {
        const res = await fetch(`/api/specs/${id}`);
        if (res.status === 404) {
          setSpec(null);
          setError(null);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch spec");
        const data = await res.json();
        setSpec(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchSpec();
  }, [id]);

  return { spec, loading, error };
}
