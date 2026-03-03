"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useBacklog } from "@/hooks/useBacklog";
import { useSpec } from "@/hooks/useSpec";
import { useProgress } from "@/hooks/useProgress";
import { useDelivery } from "@/hooks/useDelivery";
import { Header } from "@/components/layout/Header";
import { TaskHeader } from "@/components/task-detail/TaskHeader";
import { SpecViewer } from "@/components/task-detail/SpecViewer";
import { ProgressTimeline } from "@/components/task-detail/ProgressTimeline";
import { ChecklistProgress } from "@/components/task-detail/ChecklistProgress";
import { DeliveryPipeline } from "@/components/task-detail/DeliveryPipeline";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { ReportCard } from "@/components/reports/ReportCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReportFile } from "@/lib/types";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tasks, loading: backlogLoading, updateStatus } = useBacklog();
  const { spec, loading: specLoading } = useSpec(id);
  const { progress, loading: progressLoading } = useProgress(id);
  const { delivery, loading: deliveryLoading, updateStage } = useDelivery(id);

  const [reports, setReports] = useState<ReportFile[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((all: ReportFile[]) => setReports(all.filter((r) => r.taskId === id)))
      .catch(console.error);
  }, [id]);

  const task = tasks.find((t) => t.id === id);
  const loading = backlogLoading || specLoading || progressLoading || deliveryLoading;

  const handleStatusChange = async (status: string) => {
    const ok = await updateStatus(id, status);
    if (ok) {
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleMarkStageDone = async (role: string, label: string) => {
    const today = new Date().toISOString().split("T")[0];
    const ok = await updateStage(role, label, "Status", "done");
    if (ok) {
      await updateStage(role, label, "Date", today);
      toast.success(`${role}: ${label} marked as done`);
    } else {
      toast.error(`Failed to update ${role}: ${label}`);
    }
  };

  const handleApprove = async (notes: string) => {
    const today = new Date().toISOString().split("T")[0];
    await updateStage("User", "Approval", "Status", "done");
    await updateStage("User", "Approval", "Date", today);
    if (notes) {
      await updateStage("User", "Approval", "Notes", notes);
    }
  };

  const handleReject = async (notes: string) => {
    const today = new Date().toISOString().split("T")[0];
    await updateStage("User", "Approval", "Status", "blocked");
    await updateStage("User", "Approval", "Date", today);
    if (notes) {
      await updateStage("User", "Approval", "Notes", notes);
    }
  };

  const defaultTab = delivery ? "delivery" : "spec";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header
        title={task ? `${task.id}: ${task.title}` : id}
        actions={
          spec && (
            <Link href={`/tasks/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Spec
              </Button>
            </Link>
          )
        }
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {task && <TaskHeader task={task} spec={spec ?? undefined} onStatusChange={handleStatusChange} />}

          {spec && spec.checkboxes.total > 0 && (
            <ChecklistProgress
              total={spec.checkboxes.total}
              checked={spec.checkboxes.checked}
            />
          )}

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList>
              {delivery && (
                <TabsTrigger value="delivery">
                  Delivery
                  {` (${delivery.stages.filter((s) => s.status === "done").length}/${delivery.stages.length})`}
                </TabsTrigger>
              )}
              <TabsTrigger value="spec">Spec</TabsTrigger>
              <TabsTrigger value="progress">
                Progress
                {progress && ` (${progress.sessions.length})`}
              </TabsTrigger>
              <TabsTrigger value="reports">
                Reports{reports.length > 0 ? ` (${reports.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4" /> Chat
              </TabsTrigger>
            </TabsList>

            {delivery && (
              <TabsContent value="delivery" forceMount className={cn("mt-4", "data-[state=inactive]:hidden")}>
                <DeliveryPipeline
                  taskId={id}
                  stages={delivery.stages}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onMarkStageDone={handleMarkStageDone}
                />
              </TabsContent>
            )}

            <TabsContent value="spec" forceMount className={cn("mt-4", "data-[state=inactive]:hidden")}>
              {spec ? (
                <SpecViewer htmlContent={spec.htmlContent} />
              ) : (
                <div className="text-muted-foreground text-center py-12">
                  No spec file found for {id}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" forceMount className={cn("mt-4", "data-[state=inactive]:hidden")}>
              {progress ? (
                <ProgressTimeline sessions={progress.sessions} />
              ) : (
                <div className="text-muted-foreground text-center py-12">
                  No progress log yet for {id}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              {reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((report) => (
                    <ReportCard key={report.filename} report={report} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-12">
                  No reports yet for {id}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <Tabs defaultValue="chat-po">
                <TabsList>
                  <TabsTrigger value="chat-po">PO</TabsTrigger>
                  <TabsTrigger value="chat-pm">PM</TabsTrigger>
                </TabsList>
                <TabsContent value="chat-po" className="mt-2">
                  <ChatInterface
                    agent="product-owner"
                    fixedContext={[id]}
                    suggestedPrompts={["Review this spec", "Suggest edge cases", "Summarize delivery status", "Improve acceptance criteria"]}
                    placeholder={`Ask the PO about ${id}...`}
                    heightClass="h-64 md:h-[calc(100dvh-22rem)]"
                  />
                </TabsContent>
                <TabsContent value="chat-pm" className="mt-2">
                  <ChatInterface
                    agent="project-manager"
                    fixedContext={[id]}
                    suggestedPrompts={["What's the status?", "Break into subtasks", "Who should work on this?", "What are the blockers?"]}
                    placeholder={`Ask the PM about ${id}...`}
                    heightClass="h-64 md:h-[calc(100dvh-22rem)]"
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
