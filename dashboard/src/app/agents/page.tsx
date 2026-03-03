"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User } from "lucide-react";

interface AgentDef {
  name: string;
  filename: string;
  content: string;
}

const ROLE_COLORS: Record<string, string> = {
  "Project Manager": "bg-indigo-500",
  "Product Owner": "bg-amber-500",
  "Frontend Developer": "bg-cyan-500",
  "Backend Developer": "bg-purple-500",
  "Chrome Ext Developer": "bg-orange-500",
  "Python Developer": "bg-green-500",
  "Qa Tester": "bg-pink-500",
};

function AgentCard({ agent }: { agent: AgentDef }) {
  const [expanded, setExpanded] = useState(false);

  // Get first meaningful line as description
  const lines = agent.content.split("\n").filter((l) => l.trim());
  const descLine = lines.find(
    (l) => !l.startsWith("#") && !l.startsWith("---") && l.length > 10
  );
  const description = descLine
    ? descLine.length > 200
      ? descLine.slice(0, 200) + "..."
      : descLine
    : "";

  const dotColor = ROLE_COLORS[agent.name] || "bg-muted-foreground";

  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2 text-left"
        >
          <span className={`size-3 rounded-full shrink-0 ${dotColor}`} />
          <CardTitle className="text-base">{agent.name}</CardTitle>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {agent.filename}
          </Badge>
          {expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
        </button>
        {!expanded && description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 pl-5">
            {description}
          </p>
        )}
      </CardHeader>
      {expanded && (
        <CardContent className="px-4 pt-0 pb-4">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono leading-relaxed max-h-[60vh] overflow-auto rounded-md bg-muted/50 p-4">
            {agent.content}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header
        title="Agent Roster"
        subtitle={`${agents.length} agents configured`}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.filename} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-12">
          No agent definitions found
        </div>
      )}
    </div>
  );
}
