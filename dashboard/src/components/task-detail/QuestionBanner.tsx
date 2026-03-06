"use client";

import { useState } from "react";
import { useQuestion } from "@/hooks/useQuestion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function QuestionBanner({ taskId }: { taskId: string }) {
  const { question, status, agent, loading, submitting, submit } = useQuestion(taskId);
  const [answer, setAnswer] = useState("");

  if (loading || status === "none") return null;

  if (status === "answered") {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Answer submitted</AlertTitle>
      </Alert>
    );
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const ok = await submit(answer.trim());
    if (ok) {
      toast.success("Answer submitted");
    } else {
      toast.error("Failed to submit answer");
    }
  };

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700">Agent needs your input</AlertTitle>
      <AlertDescription>
        {agent && (
          <p className="text-xs text-amber-600/80 mb-1">From: {agent}</p>
        )}
        <p className="whitespace-pre-wrap mt-1 text-foreground">{question}</p>
        <Textarea
          className="mt-3 bg-background"
          rows={3}
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <Button
          className="mt-2"
          size="sm"
          disabled={submitting || !answer.trim()}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit Answer"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
