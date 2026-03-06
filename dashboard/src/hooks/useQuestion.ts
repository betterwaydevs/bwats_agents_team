"use client";

import { useState, useEffect, useCallback } from "react";

interface QuestionData {
  status: "pending" | "answered" | "none";
  question: string;
  answer: string;
  date: string;
  agent: string;
}

export function useQuestion(id: string) {
  const [data, setData] = useState<QuestionData>({ status: "none", question: "", answer: "", date: "", agent: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch question");
      const json = await res.json();
      setData(json);
    } catch {
      setData({ status: "none", question: "", answer: "", date: "", agent: "" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const submit = useCallback(
    async (answer: string) => {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/questions/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer }),
        });
        if (!res.ok) throw new Error("Failed to submit answer");
        setData((prev) => ({ ...prev, status: "answered", answer }));
        return true;
      } catch {
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [id]
  );

  return {
    question: data.question,
    status: data.status,
    answer: data.answer,
    date: data.date,
    agent: data.agent,
    loading,
    submitting,
    submit,
  };
}
