import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "dev-complete":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "not started":
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    statusColors[status.toLowerCase()] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <Badge
      variant="secondary"
      className={cn("border-0 capitalize", colorClass)}
    >
      {status}
    </Badge>
  );
}
