import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { REPORTS_DIR } from "@/lib/config";
import { parseBacklog } from "@/lib/parser";

export async function GET() {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return NextResponse.json([]);
    }

    // Build task title map for display
    let taskTitleMap: Record<string, string> = {};
    try {
      const backlogTasks = parseBacklog();
      for (const t of backlogTasks) {
        taskTitleMap[t.id] = t.title;
      }
    } catch {}

    const screenshots = [];
    const entries = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const taskId = entry.name;
      const taskDir = path.join(REPORTS_DIR, taskId);
      const files = fs.readdirSync(taskDir);

      for (const filename of files) {
        if (!filename.endsWith(".png")) continue;
        const filePath = path.join(taskDir, filename);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) continue;

        screenshots.push({
          filename,
          taskId,
          taskTitle: taskTitleMap[taskId],
          url: `/api/screenshots/${taskId}/${encodeURIComponent(filename)}`,
          modified: stat.mtime.toISOString(),
        });
      }
    }

    screenshots.sort(
      (a, b) =>
        new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );
    return NextResponse.json(screenshots);
  } catch (error) {
    console.error("Failed to list screenshots:", error);
    return NextResponse.json(
      { error: "Failed to list screenshots" },
      { status: 500 }
    );
  }
}
