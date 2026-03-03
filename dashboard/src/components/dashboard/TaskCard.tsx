import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TypeBadge } from "@/components/dashboard/TypeBadge";
import type { BacklogTask } from "@/lib/types";

interface TaskCardProps {
  task: BacklogTask;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              {task.id}
            </span>
            <StatusBadge status={task.status} />
          </div>
          <CardTitle className="text-sm leading-snug">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <div className="flex items-center justify-between">
            <TypeBadge type={task.type} />
            <span className="text-xs text-muted-foreground">{task.owner}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
