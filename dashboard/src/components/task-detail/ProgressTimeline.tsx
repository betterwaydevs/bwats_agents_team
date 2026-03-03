import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ProgressSession } from "@/lib/types";

interface ProgressTimelineProps {
  sessions: ProgressSession[];
}

export function ProgressTimeline({ sessions }: ProgressTimelineProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No progress entries yet.
      </p>
    );
  }

  return (
    <div className="relative ml-3 border-l border-border pl-6">
      {sessions.map((session, index) => (
        <div key={index} className="relative pb-8 last:pb-0">
          {/* Dot on the timeline */}
          <div className="absolute -left-[calc(1.5rem+4.5px)] top-1.5 size-[9px] rounded-full border-2 border-primary bg-background" />

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {session.date}
              </span>
              {session.status && <StatusBadge status={session.status} />}
            </div>
            <h4 className="text-sm font-semibold">{session.title}</h4>
            {session.content && (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: session.content }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
