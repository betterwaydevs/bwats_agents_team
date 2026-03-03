"use client";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TypeBadge } from "@/components/dashboard/TypeBadge";
import { ChecklistProgress } from "@/components/task-detail/ChecklistProgress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BacklogTask, SpecFile } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "dev-complete", label: "Dev-Complete" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

interface TaskHeaderProps {
  task: BacklogTask;
  spec?: SpecFile;
  onStatusChange?: (status: string) => void;
}

export function TaskHeader({ task, spec, onStatusChange }: TaskHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm text-muted-foreground">
          {task.id}
        </span>
        {onStatusChange ? (
          <Select
            value={task.status}
            onValueChange={onStatusChange}
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={task.status} />
        )}
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
