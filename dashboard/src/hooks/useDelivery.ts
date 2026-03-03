"use client";

import { useState, useEffect, useCallback } from "react";
import type { DeliveryLog } from "@/lib/types";

export function useDelivery(id: string) {
  const [delivery, setDelivery] = useState<DeliveryLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDelivery = useCallback(async () => {
    try {
      const res = await fetch(`/api/delivery/${id}`);
      if (res.status === 404) {
        setDelivery(null);
        setError(null);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch delivery log");
      const data = await res.json();
      setDelivery(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  const updateStage = useCallback(
    async (role: string, label: string, field: string, value: string) => {
      try {
        const res = await fetch(`/api/delivery/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, label, field, value }),
        });
        if (!res.ok) throw new Error("Failed to update delivery stage");
        const data = await res.json();
        setDelivery(data);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return false;
      }
    },
    [id]
  );

  return { delivery, loading, error, refetch: fetchDelivery, updateStage };
}
