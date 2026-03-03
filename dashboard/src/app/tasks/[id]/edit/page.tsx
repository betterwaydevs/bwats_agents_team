"use client";

import { use } from "react";
import { useSpec } from "@/hooks/useSpec";
import { Header } from "@/components/layout/Header";
import { SpecEditor } from "@/components/task-detail/SpecEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditSpecPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { spec, loading } = useSpec(id);

  return (
    <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
      <Header
        title={`Edit: ${id}`}
        actions={
          <Link href={`/tasks/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Skeleton className="flex-1" />
      ) : spec ? (
        <div className="flex-1 min-h-0">
          <SpecEditor id={id} initialContent={spec.content} />
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-12">
          No spec file found for {id}
        </div>
      )}
    </div>
  );
}
