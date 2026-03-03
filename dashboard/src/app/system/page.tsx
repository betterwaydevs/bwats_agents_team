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
import { ChevronDown, ChevronRight, Brain, BookOpen, FolderCog } from "lucide-react";

interface ProjectRule {
  project: string;
  content: string;
}

interface SystemData {
  learnings: string;
  memory: string;
  projectRules: ProjectRule[];
}

function CollapsibleCard({
  title,
  icon: Icon,
  content,
  defaultOpen = false,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  content: string;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!content) return null;

  const lineCount = content.split("\n").length;

  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 text-left"
        >
          <Icon className="size-5 shrink-0 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
          {badge && (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {badge}
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {lineCount} lines
          </span>
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {open && (
        <CardContent className="px-4 pt-0 pb-4">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono leading-relaxed max-h-[60vh] overflow-auto rounded-md bg-muted/50 p-4">
            {content}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}

export default function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/system")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header
        title="System"
        subtitle="Learnings, memory, and project rules"
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-4">
          <CollapsibleCard
            title="Learnings"
            icon={Brain}
            content={data.learnings}
            defaultOpen
            badge="LEARNINGS.md"
          />

          <CollapsibleCard
            title="Memory"
            icon={BookOpen}
            content={data.memory}
            badge="MEMORY.md"
          />

          {data.projectRules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-2">
                <FolderCog className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Project Rules</h2>
                <Badge variant="secondary" className="ml-1">
                  {data.projectRules.length}
                </Badge>
              </div>
              {data.projectRules.map((rule) => (
                <CollapsibleCard
                  key={rule.project}
                  title={rule.project}
                  icon={FolderCog}
                  content={rule.content}
                  badge="CLAUDE.md"
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-12">
          Failed to load system data
        </div>
      )}
    </div>
  );
}
