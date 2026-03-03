"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { TaskCard } from "@/components/dashboard/TaskCard";
import type { BacklogTask } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-blue-600 dark:text-blue-400",
  "quick-fix": "text-gray-600 dark:text-gray-400",
  intern: "text-purple-600 dark:text-purple-400",
  completed: "text-green-600 dark:text-green-400",
};

const priorityBg: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "quick-fix":
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  intern:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

interface PrioritySectionProps {
  priority: string;
  tasks: BacklogTask[];
  defaultOpen?: boolean;
}

export function PrioritySection({
  priority,
  tasks,
  defaultOpen = false,
}: PrioritySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colorClass = priorityColors[priority.toLowerCase()] ?? "text-foreground";
  const badgeBg =
    priorityBg[priority.toLowerCase()] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-accent/50"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
          <span className={cn("text-sm font-semibold capitalize", colorClass)}>
            {priority}
          </span>
          <Badge variant="secondary" className={cn("border-0", badgeBg)}>
            {tasks.length}
          </Badge>
        </div>
      </button>
      {isOpen && (
        <div className="border-t px-4 pb-4">
          <TaskTable tasks={tasks} />
          <div className="flex flex-col gap-3 pt-3 md:hidden">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
