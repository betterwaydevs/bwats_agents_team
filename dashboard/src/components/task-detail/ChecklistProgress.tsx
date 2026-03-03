import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ChecklistProgressProps {
  total: number;
  checked: number;
}

export function ChecklistProgress({ total, checked }: ChecklistProgressProps) {
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

  const colorClass =
    checked === total && total > 0
      ? "[&_[data-slot=progress-indicator]]:bg-green-500"
      : checked > 0
        ? "[&_[data-slot=progress-indicator]]:bg-blue-500"
        : "[&_[data-slot=progress-indicator]]:bg-gray-400";

  return (
    <div className="flex items-center gap-3">
      <Progress value={percentage} className={cn("h-2 w-40", colorClass)} />
      <span className="text-sm text-muted-foreground">
        {checked}/{total}
      </span>
    </div>
  );
}
