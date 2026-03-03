"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ScreenshotFile } from "@/lib/types";

interface ScreenshotGalleryProps {
  screenshots: ScreenshotFile[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selected, setSelected] = useState<ScreenshotFile | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, ScreenshotFile[]>();
    for (const s of screenshots) {
      const key = s.taskId ?? "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [screenshots]);

  if (screenshots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No screenshots found.</p>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([taskId, items]) => {
          const title = items[0]?.taskTitle;
          return (
            <div key={taskId}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {taskId}
                {title && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    — {title}
                  </span>
                )}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((screenshot) => (
                  <button
                    key={`${screenshot.taskId}-${screenshot.filename}`}
                    onClick={() => setSelected(screenshot)}
                    className="group relative overflow-hidden rounded-lg border bg-muted transition-colors hover:border-primary/50"
                  >
                    <img
                      src={screenshot.url}
                      alt={screenshot.filename}
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                      <span className="text-[10px] text-white line-clamp-1">
                        {screenshot.filename}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">
            {selected?.filename ?? "Screenshot"}
          </DialogTitle>
          {selected && (
            <div className="flex flex-col gap-2">
              <img
                src={selected.url}
                alt={selected.filename}
                className="max-h-[80vh] w-full rounded-md object-contain"
              />
              <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span>
                  {selected.taskId && (
                    <span className="font-medium">{selected.taskId} / </span>
                  )}
                  {selected.filename}
                </span>
                <span>
                  {new Date(selected.modified).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
