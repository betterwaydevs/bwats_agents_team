"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListTodo, Clock, Loader2, CheckCircle2, PackageCheck } from "lucide-react";
import type { BacklogTask } from "@/lib/types";

interface StatsBarProps {
  tasks: BacklogTask[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const total = tasks.length;
  const pending = tasks.filter(
    (t) => t.status === "pending" || t.status === "not started"
  ).length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const devComplete = tasks.filter((t) => t.status === "dev-complete").length;
  const done = tasks.filter((t) => t.status === "done").length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: ListTodo,
      color: "text-foreground",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Loader2,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Dev-Complete",
      value: devComplete,
      icon: PackageCheck,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Done",
      value: done,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`size-4 ${stat.color}`} />
          </CardHeader>
          <CardContent className="px-4">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
