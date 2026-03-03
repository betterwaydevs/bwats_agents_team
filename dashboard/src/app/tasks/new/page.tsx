"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { Button } from "@/components/ui/button";

export default function NewTaskPage() {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Header title="New Task" />
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface
          agent="product-owner"
          suggestedPrompts={[
            "I want to build a new feature",
            "Help me write a spec",
            "What tasks are pending?",
            "Create a spec from this idea",
          ]}
          systemInstruction="You are the Product Owner helping create a new task. Help the user draft a specification in the standard format. When ready, write the spec to features/specs/<ID>-<slug>.md and add a row to features/BACKLOG.md. Use the next available ID based on existing specs."
          placeholder="Describe the feature you want to build..."
          emptyStateMessage="Tell me about the feature you want to build and I'll help draft a spec"
        />
      </div>
    </div>
  );
}
