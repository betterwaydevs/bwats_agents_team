import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { FEATURES_DIR } from "@/lib/config";
import { parseBacklog, findSpecFile } from "@/lib/parser";
import path from "path";

// --- Cached backlog summary (60s TTL) ---

interface CachedContext {
  content: string;
  timestamp: number;
}

let cachedBacklogSummary: CachedContext | null = null;
const CACHE_TTL_MS = 60_000;

function getCachedBacklogSummary(): string {
  const now = Date.now();
  if (
    cachedBacklogSummary &&
    now - cachedBacklogSummary.timestamp < CACHE_TTL_MS
  ) {
    return cachedBacklogSummary.content;
  }

  const content = buildBacklogSummary();
  cachedBacklogSummary = { content, timestamp: now };
  return content;
}

function buildBacklogSummary(): string {
  try {
    const tasks = parseBacklog();
    const activeTasks = tasks.filter((t) => t.status !== "done");
    const doneTasks = tasks.filter((t) => t.status === "done");

    let summary = "Current Backlog:\n";
    summary += "| ID | Title | Status | Owner |\n";
    summary += "|---|---|---|---|\n";
    for (const t of activeTasks) {
      summary += `| ${t.id} | ${t.title} | ${t.status} | ${t.owner || "unassigned"} |\n`;
    }
    if (doneTasks.length > 0) {
      summary += `\n${doneTasks.length} completed tasks: ${doneTasks.map((t) => t.id).join(", ")}`;
    }
    return summary;
  } catch {
    return "Backlog not available.";
  }
}

// --- Build the user prompt from messages and context ---

function buildPrompt(
  messages: { role: string; content: string }[],
  context: string[],
  systemInstruction?: string
): string {
  const parts: string[] = [];

  if (systemInstruction) {
    parts.push(systemInstruction);
  }

  // Include spec file references if context has spec IDs
  if (context.length > 0) {
    const specPaths: string[] = [];
    for (const specId of context) {
      // Find spec file path relative to team dir
      const specPath = findSpecFile(specId);
      if (specPath) {
        // Convert absolute path to relative from team dir
        const teamDir = path.join(FEATURES_DIR, "..");
        const relPath = path.relative(teamDir, specPath);
        specPaths.push(relPath);
      }
      // Also reference delivery log
      const deliveryRel = `features/delivery/${specId}.md`;
      specPaths.push(deliveryRel);
    }
    parts.push(
      `Read and review the following specs: ${specPaths.join(", ")}`
    );
  }

  // Include recent conversation history (last 6 messages before the latest)
  const history = messages.slice(0, -1).slice(-6);
  if (history.length > 0) {
    parts.push("Recent conversation history:");
    for (const msg of history) {
      const role = msg.role === "user" ? "User" : "Assistant";
      // Truncate long messages in history
      const content =
        msg.content.length > 500
          ? msg.content.slice(0, 500) + "..."
          : msg.content;
      parts.push(`${role}: ${content}`);
    }
  }

  // The latest user message
  const latestMessage = messages[messages.length - 1];
  if (latestMessage) {
    parts.push(latestMessage.content);
  }

  return parts.join("\n\n");
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  try {
    const { messages, context, systemInstruction, agent } = await request.json();
    const agentName = agent === "project-manager" ? "project-manager" : "product-owner";

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "messages array is required and must not be empty",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const teamDir = path.join(FEATURES_DIR, "..");
    const prompt = buildPrompt(
      messages,
      Array.isArray(context) ? context : [],
      typeof systemInstruction === "string" ? systemInstruction : undefined
    );
    const backlogSummary = getCachedBacklogSummary();

    // Build agent-specific system prompt
    const agentSystemPrompt = agentName === "project-manager"
      ? `You are the Project Manager of BW Devs Agentic Team. You parse requests, break them into tasks, assign to specialists, and track progress.\n\n${backlogSummary}`
      : `You are the Product Owner of BW Devs Agentic Team. You design features, write acceptance criteria, and verify delivered functionality.\n\n${backlogSummary}`;

    // Build claude CLI arguments
    const args = [
      "-p",
      "--verbose",
      "--agent",
      agentName,
      "--output-format",
      "stream-json",
      "--include-partial-messages",
      "--model",
      "sonnet",
      "--permission-mode",
      "bypassPermissions",
      "--allowedTools",
      "Read,Glob,Grep,Edit,Write",
      "--no-session-persistence",
      "--append-system-prompt",
      agentSystemPrompt,
    ];

    // Create a ReadableStream that emits SSE events
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        // Unset CLAUDECODE env var to allow nested invocation
        const env = { ...process.env };
        delete env.CLAUDECODE;

        const child = spawn("claude", args, {
          cwd: teamDir,
          env,
          stdio: ["pipe", "pipe", "pipe"],
        });

        // Send prompt via stdin
        child.stdin.write(prompt);
        child.stdin.end();

        let buffer = "";

        child.stdout.on("data", (data: Buffer) => {
          buffer += data.toString();
          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const event = JSON.parse(trimmed);

              // Handle stream_event with content_block_delta (partial streaming)
              if (
                event.type === "stream_event" &&
                event.event?.type === "content_block_delta" &&
                event.event?.delta?.type === "text_delta" &&
                event.event?.delta?.text
              ) {
                const sseData = JSON.stringify({
                  text: event.event.delta.text,
                });
                controller.enqueue(
                  encoder.encode(`data: ${sseData}\n\n`)
                );
              }
            } catch {
              // Ignore non-JSON lines
            }
          }
        });

        child.stderr.on("data", (data: Buffer) => {
          // Log stderr for debugging but don't send to client
          console.error("claude stderr:", data.toString());
        });

        child.on("close", (code) => {
          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const event = JSON.parse(buffer.trim());
              if (
                event.type === "stream_event" &&
                event.event?.type === "content_block_delta" &&
                event.event?.delta?.type === "text_delta" &&
                event.event?.delta?.text
              ) {
                const sseData = JSON.stringify({
                  text: event.event.delta.text,
                });
                controller.enqueue(
                  encoder.encode(`data: ${sseData}\n\n`)
                );
              }
            } catch {
              // Ignore
            }
          }

          if (code !== 0 && code !== null) {
            const errorData = JSON.stringify({
              error: `Claude process exited with code ${code}`,
            });
            controller.enqueue(
              encoder.encode(`data: ${errorData}\n\n`)
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        });

        child.on("error", (err) => {
          console.error("Failed to spawn claude:", err);
          const errorData = JSON.stringify({
            error: "Failed to start Claude CLI",
          });
          controller.enqueue(
            encoder.encode(`data: ${errorData}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
