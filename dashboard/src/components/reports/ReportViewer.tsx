"use client";

import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/layout/ThemeProvider";

interface ReportViewerProps {
  path: string;
}

export function ReportViewer({ path }: ReportViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();

  // Sync dashboard theme to iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const applyTheme = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc?.documentElement) {
          doc.documentElement.classList.toggle("dark", theme === "dark");
        }
      } catch {
        // Cross-origin or not loaded yet
      }
    };

    // Apply on theme change
    applyTheme();

    // Also apply when iframe loads
    iframe.addEventListener("load", applyTheme);
    return () => iframe.removeEventListener("load", applyTheme);
  }, [theme, isLoading]);

  return (
    <div className="relative h-[calc(100vh-10rem)] w-full">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`/api/reports/${path}`}
        className="h-full w-full rounded-md border"
        sandbox="allow-same-origin allow-scripts"
        onLoad={() => setIsLoading(false)}
        title={path}
      />
    </div>
  );
}
