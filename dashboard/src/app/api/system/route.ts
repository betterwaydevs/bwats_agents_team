import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const teamDir = path.join(process.cwd(), "..", "team");

    // Read LEARNINGS.md
    let learnings = "";
    const learningsPath = path.join(teamDir, "LEARNINGS.md");
    if (fs.existsSync(learningsPath)) {
      learnings = fs.readFileSync(learningsPath, "utf-8");
    }

    // Read MEMORY.md
    let memory = "";
    const memoryPath = path.join(
      process.env.HOME || "/home/pablo",
      ".claude",
      "projects",
      "-home-pablo-projects-bwats-team",
      "memory",
      "MEMORY.md"
    );
    if (fs.existsSync(memoryPath)) {
      memory = fs.readFileSync(memoryPath, "utf-8");
    }

    // Read CLAUDE.md files from each project
    const projectRules: { project: string; content: string }[] = [];
    const claudeFiles = [
      { project: "Team Orchestrator", path: path.join(teamDir, "CLAUDE.md") },
      {
        project: "Frontend (nearshore-talent-compass)",
        path: path.join(process.cwd(), "..", "nearshore-talent-compass", "claude.md"),
      },
      {
        project: "Backend (bwats_xano)",
        path: path.join(process.cwd(), "..", "bwats_xano", "CLAUDE.md"),
      },
      {
        project: "Chrome Extension (linked_communication)",
        path: path.join(process.cwd(), "..", "linked_communication", "CLAUDE.md"),
      },
      {
        project: "Python (resume_parser)",
        path: path.join(process.cwd(), "..", "resume_parser", "CLAUDE.md"),
      },
    ];

    for (const cf of claudeFiles) {
      if (fs.existsSync(cf.path)) {
        projectRules.push({
          project: cf.project,
          content: fs.readFileSync(cf.path, "utf-8"),
        });
      }
    }

    return NextResponse.json({ learnings, memory, projectRules });
  } catch (error) {
    console.error("Failed to read system files:", error);
    return NextResponse.json(
      { error: "Failed to read system files" },
      { status: 500 }
    );
  }
}
