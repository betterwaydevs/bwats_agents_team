"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBacklog } from "@/hooks/useBacklog";
import { Header } from "@/components/layout/Header";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TypeBadge } from "@/components/dashboard/TypeBadge";
import { MiniPipeline } from "@/components/task-detail/DeliveryPipeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { BacklogTask, DeliveryStage } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "dev-complete", label: "Dev-Complete" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

const AGENT_MAP: Record<string, { label: string; color: string }[]> = {
  BACK: [{ label: "backend-developer", color: "bg-purple-500" }],
  FRONT: [{ label: "frontend-developer", color: "bg-cyan-500" }],
  BOTH: [
    { label: "backend-developer", color: "bg-purple-500" },
    { label: "frontend-developer", color: "bg-cyan-500" },
  ],
  EXT: [{ label: "chrome-ext-developer", color: "bg-orange-500" }],
  TEST: [{ label: "qa-tester", color: "bg-pink-500" }],
  "FRONT/INFRA": [{ label: "frontend-developer", color: "bg-cyan-500" }],
};

function TaskRow({
  task,
  deliveryStages,
  onStatusChange,
}: {
  task: BacklogTask;
  deliveryStages?: DeliveryStage[];
  onStatusChange?: (id: string, status: string) => void;
}) {
  const agents = AGENT_MAP[task.type] || [];

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-muted-foreground">
            {task.id}
          </span>
          <StatusBadge status={task.status} />
          <TypeBadge type={task.type} />
          {deliveryStages && deliveryStages.length > 0 && (
            <MiniPipeline stages={deliveryStages} />
          )}
        </div>
        <p className="mt-1 font-medium truncate">{task.title}</p>
        {agents.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {agents.map((agent) => (
              <div
                key={agent.label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className={`size-2 rounded-full ${agent.color}`}
                />
                {agent.label}
              </div>
            ))}
          </div>
        )}
      </Link>
      {onStatusChange && (
        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task.id, value)}
        >
          <SelectTrigger size="sm" className="w-[130px] shrink-0">
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
      )}
      <Link href={`/tasks/${task.id}`}>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </div>
  );
}

function StatusSection({
  title,
  icon: Icon,
  tasks,
  deliveries,
  defaultOpen = true,
  statusFilter,
  onStatusChange,
}: {
  title: string;
  icon: React.ElementType;
  tasks: BacklogTask[];
  deliveries: Record<string, DeliveryStage[]>;
  defaultOpen?: boolean;
  statusFilter: string;
  onStatusChange?: (id: string, status: string) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-5" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary" className="ml-1">
          {tasks.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {(defaultOpen ? tasks : tasks.slice(0, 5)).map((task) => (
          <TaskRow
            key={`${task.id}-${task.title}`}
            task={task}
            deliveryStages={deliveries[task.id]}
            onStatusChange={onStatusChange}
          />
        ))}
        {!defaultOpen && tasks.length > 5 && (
          <Link
            href={`/?status=${statusFilter}`}
            className="block text-sm text-muted-foreground text-center py-3 hover:text-primary transition-colors"
          >
            +{tasks.length - 5} more
          </Link>
        )}
      </div>
    </div>
  );
}

const STATUS_FILTER_LABELS: Record<string, string> = {
  "in-progress": "In Progress",
  "dev-complete": "Dev-Complete",
  done: "Completed",
  pending: "Pending",
  blocked: "Blocked",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const { tasks, loading, error, updateStatus } = useBacklog();
  const [deliveries, setDeliveries] = useState<Record<string, DeliveryStage[]>>({});

  const handleStatusChange = async (id: string, status: string) => {
    const ok = await updateStatus(id, status);
    if (ok) {
      toast.success(`${id} status updated to ${status}`);
    } else {
      toast.error(`Failed to update ${id} status`);
    }
  };

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const res = await fetch("/api/delivery");
        if (res.ok) {
          const data = await res.json();
          setDeliveries(data);
        }
      } catch {
        // Silently fail — delivery dots are optional
      }
    }
    fetchDeliveries();
  }, []);

  const { inProgress, devComplete, done, pending, blocked } = useMemo(() => {
    const inProgress: BacklogTask[] = [];
    const devComplete: BacklogTask[] = [];
    const done: BacklogTask[] = [];
    const pending: BacklogTask[] = [];
    const blocked: BacklogTask[] = [];

    for (const t of tasks) {
      switch (t.status) {
        case "in-progress":
          inProgress.push(t);
          break;
        case "dev-complete":
          devComplete.push(t);
          break;
        case "done":
          done.push(t);
          break;
        case "blocked":
          blocked.push(t);
          break;
        default:
          pending.push(t);
      }
    }
    return { inProgress, devComplete, done, pending, blocked };
  }, [tasks]);

  if (error) {
    return (
      <div className="p-6">
        <Header title="Dashboard" />
        <div className="mt-8 text-center text-destructive">
          Failed to load backlog: {error}
        </div>
      </div>
    );
  }

  // Filtered view: show only tasks matching the status query param
  if (statusFilter && STATUS_FILTER_LABELS[statusFilter]) {
    const filteredTasks = tasks.filter((t) => {
      if (statusFilter === "pending") {
        return t.status !== "in-progress" && t.status !== "dev-complete" && t.status !== "done" && t.status !== "blocked";
      }
      return t.status === statusFilter;
    });

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </div>
        <Header
          title={`${STATUS_FILTER_LABELS[statusFilter]} Tasks`}
          subtitle={`${filteredTasks.length} tasks`}
        />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskRow
                key={`${task.id}-${task.title}`}
                task={task}
                deliveryStages={deliveries[task.id]}
                onStatusChange={handleStatusChange}
              />
            ))}
            {filteredTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No {STATUS_FILTER_LABELS[statusFilter].toLowerCase()} tasks.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header
        title="Dashboard"
        subtitle={`${tasks.length} tasks tracked`}
        actions={
          <Link href="/tasks/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </Link>
        }
      />

      {/* Filter tabs — visible on all screen sizes */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { label: "In Progress", status: "in-progress", count: inProgress.length },
          { label: "Dev-Complete", status: "dev-complete", count: devComplete.length },
          { label: "Completed", status: "done", count: done.length },
          { label: "Pending", status: "pending", count: pending.length },
        ].map((f) => (
          <Link
            key={f.status}
            href={`/?status=${f.status}`}
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {f.label}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {f.count}
            </Badge>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <>
          <StatsBar tasks={tasks} />

          <StatusSection
            title="In Progress"
            icon={Clock}
            tasks={inProgress}
            deliveries={deliveries}
            statusFilter="in-progress"
            onStatusChange={handleStatusChange}
          />

          <StatusSection
            title="Dev-Complete"
            icon={PackageCheck}
            tasks={devComplete}
            deliveries={deliveries}
            statusFilter="dev-complete"
            onStatusChange={handleStatusChange}
          />

          {blocked.length > 0 && (
            <StatusSection
              title="Blocked"
              icon={AlertCircle}
              tasks={blocked}
              deliveries={deliveries}
              statusFilter="blocked"
              onStatusChange={handleStatusChange}
            />
          )}

          <Separator />

          <StatusSection
            title="Completed"
            icon={CheckCircle2}
            tasks={done}
            deliveries={deliveries}
            defaultOpen={false}
            statusFilter="done"
            onStatusChange={handleStatusChange}
          />

          <StatusSection
            title="Pending"
            icon={FileText}
            tasks={pending}
            deliveries={deliveries}
            defaultOpen={false}
            statusFilter="pending"
            onStatusChange={handleStatusChange}
          />
        </>
      )}
    </div>
  );
}
