"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ReportCard } from "@/components/reports/ReportCard";
import { ScreenshotGallery } from "@/components/reports/ScreenshotGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReportFile, ScreenshotFile } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then((r) => r.json()),
      fetch("/api/screenshots").then((r) => r.json()),
    ])
      .then(([reps, shots]) => {
        setReports(reps);
        setScreenshots(shots);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header title="Reports & Screenshots" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="screenshots">
              Screenshots ({screenshots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4">
            {reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <ReportCard key={report.filename} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-12">
                No HTML reports found
              </div>
            )}
          </TabsContent>

          <TabsContent value="screenshots" className="mt-4">
            {screenshots.length > 0 ? (
              <ScreenshotGallery screenshots={screenshots} />
            ) : (
              <div className="text-muted-foreground text-center py-12">
                No screenshots found
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
