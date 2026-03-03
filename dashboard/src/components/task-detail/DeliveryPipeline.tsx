"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import type { DeliveryStage } from "@/lib/types";

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  done: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    label: "Done",
  },
  "in-progress": {
    icon: Loader2,
    color: "text-blue-500",
    bg: "bg-blue-500",
    label: "In Progress",
  },
  pending: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted-foreground",
    label: "Pending",
  },
  blocked: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500",
    label: "Blocked",
  },
};

function StageIcon({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <Icon
      className={`size-5 shrink-0 ${config.color} ${
        status === "in-progress" ? "animate-spin" : ""
      }`}
    />
  );
}

function StageDot({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <span className={`size-2.5 rounded-full ${config.bg}`} />;
}

/** Detect gate violations for a stage given all stages in the pipeline. */
function getGateViolations(
  stage: DeliveryStage,
  allStages: DeliveryStage[]
): string[] {
  if (stage.status !== "done") return [];

  const warnings: string[] = [];
  const isDone = (role: string, label?: string) =>
    allStages.some(
      (s) =>
        s.role === role &&
        (label ? s.label === label : true) &&
        s.status === "done"
    );
  const allDevDone = allStages
    .filter((s) => s.role === "DEV")
    .every((s) => s.status === "done");

  // Prerequisite checks based on stage dependency order
  if (stage.role === "DEV") {
    // All DEV stages require PM: Assignment
    if (!isDone("PM", "Assignment")) {
      warnings.push("Prerequisite not met: PM Assignment");
    }
  } else if (stage.role === "QA") {
    // QA: Testing requires ALL DEV stages done
    if (!allDevDone) {
      warnings.push("Prerequisite not met: DEV stages incomplete");
    }
    // QA done with no screenshots
    if (stage.screenshots.length === 0) {
      warnings.push("Missing screenshots");
    }
  } else if (stage.role === "PO") {
    // PO: Acceptance requires QA: Testing done
    if (!isDone("QA", "Testing")) {
      warnings.push("Prerequisite not met: QA Testing");
    }
    // PO done with no acceptance notes
    if (!stage.notes) {
      warnings.push("Missing acceptance notes");
    }
  } else if (stage.role === "User") {
    // User: Approval requires PO: Acceptance done
    if (!isDone("PO", "Acceptance")) {
      warnings.push("Prerequisite not met: PO Acceptance");
    }
  }

  return warnings;
}

/** Check whether a stage's prerequisites are met so it can be marked done. */
function canMarkDone(stage: DeliveryStage, allStages: DeliveryStage[]): boolean {
  if (stage.status === "done") return false;
  if (stage.role === "User") return false; // User stage has its own approve/reject UI

  const isDone = (role: string, label?: string) =>
    allStages.some(
      (s) =>
        s.role === role &&
        (label ? s.label === label : true) &&
        s.status === "done"
    );
  const allDevDone = allStages
    .filter((s) => s.role === "DEV")
    .every((s) => s.status === "done");

  if (stage.role === "PM") return true;
  if (stage.role === "DEV") return isDone("PM", "Assignment");
  if (stage.role === "SEC") return allDevDone;
  if (stage.role === "QA") {
    const hasSec = allStages.some((s) => s.role === "SEC");
    return allDevDone && (!hasSec || isDone("SEC"));
  }
  if (stage.role === "PO") return isDone("QA", "Testing");

  return true;
}

interface StageCardProps {
  stage: DeliveryStage;
  taskId: string;
  isLast: boolean;
  isUserStage: boolean;
  warnings: string[];
  canMark: boolean;
  onApprove?: (notes: string) => void;
  onReject?: (notes: string) => void;
  onMarkDone?: (role: string, label: string) => void;
}

function StageCard({
  stage,
  taskId,
  isLast,
  isUserStage,
  warnings,
  canMark,
  onApprove,
  onReject,
  onMarkDone,
}: StageCardProps) {
  const [expanded, setExpanded] = useState(stage.screenshots.length > 0);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const config = STATUS_CONFIG[stage.status] || STATUS_CONFIG.pending;
  const hasDetails =
    stage.notes || stage.commits.length > 0 || stage.screenshots.length > 0 || stage.report;

  return (
    <>
      <div className="flex gap-3">
        {/* Timeline connector */}
        <div className="flex flex-col items-center">
          <StageIcon status={stage.status} />
          {!isLast && (
            <div
              className={`mt-1 w-px flex-1 ${
                stage.status === "done" ? "bg-emerald-500/40" : "bg-border"
              }`}
            />
          )}
        </div>

        {/* Stage content */}
        <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
          <button
            onClick={() => hasDetails && setExpanded(!expanded)}
            className="flex w-full items-center gap-2 text-left"
            disabled={!hasDetails}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {stage.role}
            </span>
            <span className="text-sm font-semibold">{stage.label}</span>
            <Badge
              variant={stage.status === "done" ? "default" : "secondary"}
              className="ml-auto text-[10px]"
            >
              {config.label}
            </Badge>
            {warnings.length > 0 && (
              <span className="flex items-center gap-1">
                {warnings.map((w) => (
                  <Badge
                    key={w}
                    variant="outline"
                    className="border-amber-400/60 bg-amber-50 text-amber-700 text-[10px] dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-500/40"
                  >
                    <AlertTriangle className="mr-0.5 size-3" />
                    {w}
                  </Badge>
                ))}
              </span>
            )}
            {stage.agent && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {stage.agent}
              </span>
            )}
            {stage.date && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {stage.date}
              </span>
            )}
            {hasDetails && (
              <span className="ml-1 text-muted-foreground">
                {expanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </span>
            )}
          </button>

          {expanded && (
            <Card className="mt-2">
              <CardContent className="space-y-3 py-3 px-4 text-sm">
                {stage.agent && (
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">Agent:</span>
                    <span>{stage.agent}</span>
                  </div>
                )}
                {stage.date && (
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">Date:</span>
                    <span>{stage.date}</span>
                  </div>
                )}
                {stage.notes && (
                  <div>
                    <span className="font-medium text-muted-foreground">Notes:</span>
                    <p className="mt-1 text-muted-foreground">{stage.notes}</p>
                  </div>
                )}
                {stage.commits.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">Commits:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {stage.commits.map((commit) => (
                        <Badge key={commit} variant="outline" className="font-mono text-[10px]">
                          {commit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {stage.screenshots.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">Screenshots:</span>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {stage.screenshots.map((filename) => (
                        <button
                          key={filename}
                          onClick={() => setLightboxImage(filename)}
                          className="group relative overflow-hidden rounded-lg border bg-muted transition-colors hover:border-primary/50 cursor-zoom-in"
                        >
                          <img
                            src={`/api/screenshots/${filename}`}
                            alt={filename}
                            className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.parentElement!.innerHTML = `<div class="flex aspect-video items-center justify-center"><span class="text-xs text-muted-foreground">${filename}</span></div>`;
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                            <span className="text-xs text-white line-clamp-1">
                              {filename}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {stage.report && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Report:</span>
                    <a
                      href={`/api/reports/${taskId}/${stage.report}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {stage.report}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* User approval buttons */}
          {isUserStage && stage.status === "pending" && onApprove && onReject && (
            <Card className="mt-2">
              <CardContent className="space-y-3 py-3 px-4">
                <Textarea
                  placeholder="Add notes (optional)..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(approvalNotes)}
                  >
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(approvalNotes)}
                  >
                    <XCircle className="mr-1.5 size-4" />
                    Request Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isUserStage && stage.status === "done" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
              Approved{stage.date ? ` on ${stage.date}` : ""}
              {stage.notes && ` — ${stage.notes}`}
            </div>
          )}

          {isUserStage && stage.status === "blocked" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
              <XCircle className="size-4" />
              Changes requested{stage.date ? ` on ${stage.date}` : ""}
              {stage.notes && ` — ${stage.notes}`}
            </div>
          )}

          {/* Mark Done button for non-User stages */}
          {!isUserStage && stage.status !== "done" && canMark && onMarkDone && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => onMarkDone(stage.role, stage.label)}
            >
              <CheckCircle2 className="mr-1.5 size-4" />
              Mark Done
            </Button>
          )}
        </div>
      </div>

      {/* Screenshot lightbox — near fullscreen */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full p-2">
          <DialogTitle className="sr-only">
            {lightboxImage ?? "Screenshot"}
          </DialogTitle>
          {lightboxImage && (
            <div className="flex flex-col gap-2">
              <img
                src={`/api/screenshots/${lightboxImage}`}
                alt={lightboxImage}
                className="max-h-[88vh] w-full rounded-md object-contain"
              />
              <span className="px-2 text-xs text-muted-foreground">{lightboxImage}</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface DeliveryPipelineProps {
  taskId: string;
  stages: DeliveryStage[];
  onApprove?: (notes: string) => void;
  onReject?: (notes: string) => void;
  onMarkStageDone?: (role: string, label: string) => void;
}

function TopApprovalCard({
  onApprove,
  onReject,
}: {
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 py-4 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Circle className="size-4 text-primary animate-pulse" />
          This task is awaiting your approval
        </div>
        <Textarea
          placeholder="Add notes (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onApprove(notes)}>
            <CheckCircle2 className="mr-1.5 size-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject(notes)}
          >
            <XCircle className="mr-1.5 size-4" />
            Request Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DeliveryPipeline({
  taskId,
  stages,
  onApprove,
  onReject,
  onMarkStageDone,
}: DeliveryPipelineProps) {
  const pendingUserStage = stages.find(
    (s) => s.role === "User" && s.status === "pending"
  );

  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No delivery stages recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {/* Top-level approval card when User stage is pending */}
      {pendingUserStage && onApprove && onReject && (
        <TopApprovalCard onApprove={onApprove} onReject={onReject} />
      )}

      {/* Mini pipeline bar */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {stages.map((stage, i) => (
          <div key={`${stage.role}-${stage.label}`} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <StageDot status={stage.status} />
              <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                {stage.role === "DEV" ? `${stage.role}:${stage.label}` : stage.role}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={`h-px w-4 ${
                  stage.status === "done" ? "bg-emerald-500/40" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stage details */}
      <div>
        {stages.map((stage, i) => (
          <StageCard
            key={`${stage.role}-${stage.label}`}
            stage={stage}
            taskId={taskId}
            isLast={i === stages.length - 1}
            isUserStage={stage.role === "User"}
            warnings={getGateViolations(stage, stages)}
            canMark={canMarkDone(stage, stages)}
            onApprove={onApprove}
            onReject={onReject}
            onMarkDone={onMarkStageDone}
          />
        ))}
      </div>
    </div>
  );
}

/** Mini pipeline dots for dashboard cards */
export function MiniPipeline({ stages }: { stages: DeliveryStage[] }) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage) => (
        <span
          key={`${stage.role}-${stage.label}`}
          title={`${stage.role}: ${stage.label} (${stage.status})`}
          className={`size-2 rounded-full ${
            (STATUS_CONFIG[stage.status] || STATUS_CONFIG.pending).bg
          }`}
        />
      ))}
    </div>
  );
}
