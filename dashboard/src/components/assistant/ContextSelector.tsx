"use client";

import { useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContextSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  availableSpecs: { id: string; title: string }[];
}

export function ContextSelector({
  selectedIds,
  onChange,
  availableSpecs,
}: ContextSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleSpec = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeSpec = (id: string) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="justify-between"
          >
            <span className="text-xs text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} spec(s) selected`
                : "Select spec context..."}
            </span>
            <ChevronsUpDown className="ml-2 size-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <ScrollArea className="max-h-60">
            <div className="flex flex-col p-1">
              {availableSpecs.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => toggleSpec(spec.id)}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedIds.includes(spec.id)}
                    onCheckedChange={() => toggleSpec(spec.id)}
                    className="pointer-events-none"
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {spec.id}
                  </span>
                  <span className="truncate text-xs">{spec.title}</span>
                </button>
              ))}
              {availableSpecs.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                  No specs available
                </p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const spec = availableSpecs.find((s) => s.id === id);
            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-1 text-xs"
              >
                {spec?.id ?? id}
                <button
                  onClick={() => removeSpec(id)}
                  className="rounded-full p-0.5 hover:bg-background/50"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
