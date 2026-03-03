"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { ContextSelector } from "@/components/assistant/ContextSelector";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

const DEFAULT_PROMPTS = [
  "Review this spec",
  "Identify edge cases",
  "Suggest test scenarios",
  "Break down into subtasks",
];

interface ChatInterfaceProps {
  fixedContext?: string[];
  suggestedPrompts?: string[];
  placeholder?: string;
  emptyStateMessage?: string;
  systemInstruction?: string;
  heightClass?: string;
  agent?: "product-owner" | "project-manager";
}

export function ChatInterface({
  fixedContext,
  suggestedPrompts,
  placeholder,
  emptyStateMessage,
  systemInstruction,
  heightClass = "h-[calc(100dvh-14rem)] md:h-[calc(100dvh-10rem)]",
  agent,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [availableSpecs, setAvailableSpecs] = useState<
    { id: string; title: string }[]
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const effectiveContext = fixedContext ?? selectedContext;
  const prompts = suggestedPrompts ?? DEFAULT_PROMPTS;

  // Fetch available specs on mount (only when no fixedContext)
  useEffect(() => {
    if (fixedContext) return;
    async function fetchSpecs() {
      try {
        const res = await fetch("/api/backlog");
        if (res.ok) {
          const data = await res.json();
          const tasks = data.tasks ?? data ?? [];
          const pendingTasks = tasks.filter((t: { id: string; title: string; status?: string }) => t.status === "pending");
          const specs = Array.from(
            new Map(
              pendingTasks.map((t: { id: string; title: string }) => [
                t.id,
                { id: t.id, title: t.title },
              ])
            ).values()
          ) as { id: string; title: string }[];
          setAvailableSpecs(specs);
        }
      } catch {
        // silently fail
      }
    }
    fetchSpecs();
  }, [fixedContext]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll input into view on mount (ensures it's visible above mobile BottomNav)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessageType = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            context: effectiveContext,
            ...(systemInstruction && { systemInstruction }),
            ...(agent && { agent }),
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE format
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const token =
                  parsed.text ??
                  parsed.choices?.[0]?.delta?.content ??
                  parsed.content ??
                  parsed.token ??
                  "";
                if (token) {
                  assistantContent += token;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return newMessages;
                  });
                }
              } catch {
                // If not JSON, treat the data as raw text token
                assistantContent += data;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return newMessages;
                });
              }
            }
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.role !== "assistant" || m.content !== ""),
          {
            role: "assistant",
            content: "Sorry, an error occurred. Please try again.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, effectiveContext, systemInstruction, agent]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className={`flex ${heightClass} flex-col gap-3`}>
      {/* Context selector — hidden when fixedContext is provided */}
      {!fixedContext && (
        <ContextSelector
          selectedIds={selectedContext}
          onChange={setSelectedContext}
          availableSpecs={availableSpecs}
        />
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 rounded-md border">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
              <p className="text-sm text-muted-foreground">
                {emptyStateMessage ?? "Start a conversation with BW Devs PO"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {prompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-2 text-xs"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div ref={inputRef} className="relative z-50 flex items-end gap-2 bg-background pb-4 md:pb-0">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask about your specs, tasks, or project..."}
          className="min-h-10 resize-none"
          rows={1}
          disabled={isStreaming}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          size="icon"
        >
          {isStreaming ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </div>
    </div>
  );
}
