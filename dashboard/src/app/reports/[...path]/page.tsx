"use client";

import { use, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function ReportViewPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: segments } = use(params);
  const fullPath = segments.map(decodeURIComponent).join("/");
  const taskId = segments[0];
  const filename = segments[segments.length - 1];

  const humanizedFilename = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const [taskTitle, setTaskTitle] = useState<string>("");

  useEffect(() => {
    fetch("/api/backlog")
      .then((r) => r.json())
      .then((tasks: { id: string; title: string }[]) => {
        const found = tasks.find((t) => t.id === taskId);
        if (found) setTaskTitle(found.title);
      })
      .catch(console.error);
  }, [taskId]);

  const displayTitle = taskTitle
    ? `${taskId}: ${taskTitle}`
    : `${taskId}: ${humanizedFilename}`;

  return (
    <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
      <Header
        title={displayTitle}
        actions={
          <div className="flex gap-2">
            <Link href={`/tasks/${taskId}`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View Task
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Reports
              </Button>
            </Link>
          </div>
        }
      />
      {taskTitle && (
        <p className="text-sm text-muted-foreground -mt-2">{humanizedFilename}</p>
      )}
      <div className="flex-1 min-h-0">
        <ReportViewer path={fullPath} />
      </div>
    </div>
  );
}
