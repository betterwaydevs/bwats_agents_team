import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  BACK: "border-purple-400 text-purple-700 dark:text-purple-400",
  FRONT: "border-cyan-400 text-cyan-700 dark:text-cyan-400",
  BOTH: "border-indigo-400 text-indigo-700 dark:text-indigo-400",
  EXT: "border-orange-400 text-orange-700 dark:text-orange-400",
  TEST: "border-pink-400 text-pink-700 dark:text-pink-400",
  "FRONT/INFRA": "border-cyan-400 text-cyan-700 dark:text-cyan-400",
};

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colorClass =
    typeColors[type.toUpperCase()] ??
    "border-gray-400 text-gray-700 dark:text-gray-400";

  return (
    <Badge variant="outline" className={cn(colorClass)}>
      {type}
    </Badge>
  );
}
