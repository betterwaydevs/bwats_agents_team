"use client";

import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/assistant/ChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <Header
        title="BW Devs Team"
        subtitle="Product Owner & Project Manager"
      />
      <div className="flex-1 min-h-0 mt-4">
        <Tabs defaultValue="po" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="po">PO</TabsTrigger>
            <TabsTrigger value="pm">PM</TabsTrigger>
          </TabsList>
          <TabsContent value="po" forceMount className={cn("flex-1 min-h-0", "data-[state=inactive]:hidden")}>
            <ChatInterface
              agent="product-owner"
              suggestedPrompts={[
                "Design a new feature",
                "Write acceptance criteria",
                "Review a spec",
                "What should we build next?",
              ]}
              emptyStateMessage="Start a conversation with the Product Owner"
            />
          </TabsContent>
          <TabsContent value="pm" forceMount className={cn("flex-1 min-h-0", "data-[state=inactive]:hidden")}>
            <ChatInterface
              agent="project-manager"
              suggestedPrompts={[
                "What tasks are in progress?",
                "Plan the next sprint",
                "Break this into subtasks",
                "What's blocking delivery?",
              ]}
              emptyStateMessage="Start a conversation with the Project Manager"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
