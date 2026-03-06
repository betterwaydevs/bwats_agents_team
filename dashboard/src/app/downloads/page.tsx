"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

interface DownloadFile {
  name: string;
  filename: string;
  version: string;
  size: string;
  url: string;
}

const DESCRIPTIONS: Record<string, string> = {
  "Linked Communication":
    "Chrome extension for managing LinkedIn communications and candidate interactions.",
  "BetterWay Recruiter Assistant":
    "Chrome extension for cold recruiting and prospect discovery on LinkedIn.",
};

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/downloads")
      .then((r) => r.json())
      .then(setDownloads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header
        title="Downloads"
        subtitle="Chrome extension packages"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : downloads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloads.map((dl) => (
            <Card key={dl.filename}>
              <CardHeader className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{dl.name}</CardTitle>
                  <Badge variant="secondary">v{dl.version}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-0 pb-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {DESCRIPTIONS[dl.name] || "Chrome extension package."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {dl.size}
                  </span>
                  <Button asChild size="sm">
                    <a href={dl.url} download>
                      <Download className="size-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-12">
          No downloads available
        </div>
      )}
    </div>
  );
}
