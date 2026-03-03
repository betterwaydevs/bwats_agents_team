"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

function simpleMarkdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/, "").replace(/\n?```$/, "");
    return `<pre><code>${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Checkboxes
  html = html.replace(
    /^- \[x\] (.+)$/gm,
    '<li><input type="checkbox" checked disabled /> $1</li>'
  );
  html = html.replace(
    /^- \[ \] (.+)$/gm,
    '<li><input type="checkbox" disabled /> $1</li>'
  );

  // List items
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  // Line breaks
  html = html.replace(/\n/g, "<br />");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  // Horizontal rules
  html = html.replace(/<br \/>---<br \/>/g, "<hr />");

  return html;
}

interface SpecEditorProps {
  id: string;
  initialContent: string;
}

export function SpecEditor({ id, initialContent }: SpecEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const preview = useMemo(() => simpleMarkdownToHtml(content), [content]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/specs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        toast.success("Spec saved successfully");
      } else {
        toast.error("Failed to save spec");
      }
    } catch {
      toast.error("Failed to save spec");
    } finally {
      setIsSaving(false);
    }
  }, [id, content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Markdown
          </span>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[calc(100vh-20rem)] font-mono text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Preview
          </span>
          <div className="min-h-[calc(100vh-20rem)] overflow-auto rounded-md border p-4">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="edit">
          <TabsList className="w-full">
            <TabsTrigger value="edit" className="flex-1">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[calc(100vh-24rem)] font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-h-[calc(100vh-24rem)] overflow-auto rounded-md border p-4">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
