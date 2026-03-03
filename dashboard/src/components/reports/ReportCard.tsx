import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportFile } from "@/lib/types";

interface ReportCardProps {
  report: ReportFile;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/reports/${report.path}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center gap-3 px-4 pb-2">
          <FileText className="size-8 shrink-0 text-muted-foreground" />
          <CardTitle className="leading-snug">
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-0.5">{report.taskId}</div>
              <div className="text-sm font-semibold line-clamp-2">
                {report.taskTitle ?? report.title}
              </div>
              {report.taskTitle && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{report.title}</div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatBytes(report.size)}</span>
            <span>
              {new Date(report.modified).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
