import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TypeBadge } from "@/components/dashboard/TypeBadge";
import { ChecklistProgress } from "@/components/task-detail/ChecklistProgress";
import type { BacklogTask, SpecFile } from "@/lib/types";

interface TaskHeaderProps {
  task: BacklogTask;
  spec?: SpecFile;
}

export function TaskHeader({ task, spec }: TaskHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm text-muted-foreground">
          {task.id}
        </span>
        <StatusBadge status={task.status} />
        <TypeBadge type={task.type} />
      </div>
      <h1 className="text-xl font-bold tracking-tight md:text-2xl">
        {task.title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>
          Owner: <span className="font-medium text-foreground">{task.owner}</span>
        </span>
        {task.completed && (
          <span>
            Completed: <span className="font-medium text-foreground">{task.completed}</span>
          </span>
        )}
      </div>
      {spec && spec.checkboxes.total > 0 && (
        <ChecklistProgress
          total={spec.checkboxes.total}
          checked={spec.checkboxes.checked}
        />
      )}
    </div>
  );
}
