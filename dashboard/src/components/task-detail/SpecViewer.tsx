"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface SpecViewerProps {
  htmlContent: string;
}

export function SpecViewer({ htmlContent }: SpecViewerProps) {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div
        className="prose dark:prose-invert max-w-none px-1 py-2 prose-headings:scroll-mt-4 prose-pre:overflow-x-auto prose-img:rounded-md"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </ScrollArea>
  );
}
