import fs from "fs";
import path from "path";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import { FEATURES_DIR } from "./config";
import type {
  BacklogTask,
  Priority,
  SpecFile,
  ProgressFile,
  ProgressSession,
} from "./types";

// --- Backlog Parser ---

const SECTION_PRIORITY_MAP: Record<string, Priority> = {
  "Active / High Priority": "high",
  "Dev-Complete": "dev-complete",
  "Medium Priority": "medium",
  "Low Priority / Future": "low",
  "Quick Fixes (< 15 min each)": "quick-fix",
  "Delegated to Intern": "intern",
  "Completed": "completed",
  "Done": "completed",
};

interface ColumnSchema {
  columns: string[];
  hasType: boolean;
  hasOwner: boolean;
  hasSpec: boolean;
  hasCompleted: boolean;
  hasStatus: boolean;
}

function detectSchema(headerRow: string): ColumnSchema {
  const cols = headerRow
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);
  return {
    columns: cols,
    hasType: cols.some((c) => c.toLowerCase() === "type"),
    hasOwner: cols.some((c) => c.toLowerCase() === "owner"),
    hasSpec: cols.some((c) => c.toLowerCase() === "spec"),
    hasCompleted: cols.some((c) => c.toLowerCase() === "completed"),
    hasStatus: cols.some((c) => c.toLowerCase() === "status"),
  };
}

function parseTableRow(
  row: string,
  schema: ColumnSchema,
  priority: Priority
): BacklogTask | null {
  const cells = row
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);
  if (cells.length < 2) return null;

  const colIndex = (name: string) =>
    schema.columns.findIndex((c) => c.toLowerCase() === name.toLowerCase());

  const idRaw = cells[colIndex("ID")] ?? cells[0];
  const id = idRaw.replace(/\*\*/g, "").trim();
  if (!id || id.startsWith("-")) return null;

  const titleIdx = colIndex("Title");
  const title = (cells[titleIdx] ?? cells[1] ?? "")
    .replace(/\*\*/g, "")
    .trim();

  let type = "";
  if (schema.hasType) {
    const typeIdx = colIndex("Type");
    type = (cells[typeIdx] ?? "")
      .replace(/\*\*/g, "")
      .trim();
  }

  let status = "pending";
  if (schema.hasStatus) {
    const statusIdx = colIndex("Status");
    status = (cells[statusIdx] ?? "pending")
      .replace(/\*\*/g, "")
      .trim();
  }

  let owner = "";
  if (schema.hasOwner) {
    const ownerIdx = colIndex("Owner");
    const raw = (cells[ownerIdx] ?? "").replace(/\*\*/g, "").trim();
    owner = raw === "—" || raw === "-" ? "" : raw;
  }

  let specLink = "";
  if (schema.hasSpec) {
    const specIdx = colIndex("Spec");
    const specCell = cells[specIdx] ?? "";
    const match = specCell.match(/\[.*?\]\((.*?)\)/);
    specLink = match ? match[1] : "";
  }

  let completed = "";
  if (schema.hasCompleted) {
    const compIdx = colIndex("Completed");
    completed = (cells[compIdx] ?? "").trim();
    status = "done";
  }

  return { id, title, type, status, owner, specLink, priority, completed };
}

export function parseBacklog(): BacklogTask[] {
  const filePath = path.join(FEATURES_DIR, "BACKLOG.md");
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const tasks: BacklogTask[] = [];
  let currentPriority: Priority = "high";
  let currentSchema: ColumnSchema | null = null;
  let headerSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers
    if (line.startsWith("## ")) {
      const sectionName = line.replace("## ", "").trim();
      // Try exact match first, then startsWith for headers with parenthetical suffixes
      const matchedKey = SECTION_PRIORITY_MAP[sectionName]
        ? sectionName
        : Object.keys(SECTION_PRIORITY_MAP).find((key) =>
            sectionName.startsWith(key)
          );
      if (matchedKey) {
        currentPriority = SECTION_PRIORITY_MAP[matchedKey];
        currentSchema = null;
        headerSeen = false;
      }
      continue;
    }

    // Detect table header row
    if (line.includes("| ID ") || line.includes("| ID|")) {
      currentSchema = detectSchema(line);
      headerSeen = false;
      continue;
    }

    // Skip separator row
    if (line.match(/^\|[\s-|]+\|$/)) {
      headerSeen = true;
      continue;
    }

    // Parse data rows
    if (headerSeen && currentSchema && line.startsWith("|")) {
      const task = parseTableRow(line, currentSchema, currentPriority);
      if (task) tasks.push(task);
    }
  }

  return tasks;
}

// --- Backlog Updater ---

export function updateBacklogStatus(taskId: string, newStatus: string): boolean {
  const filePath = path.join(FEATURES_DIR, "BACKLOG.md");
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let currentSchema: ColumnSchema | null = null;
  let headerSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      currentSchema = null;
      headerSeen = false;
      continue;
    }

    if (line.includes("| ID ") || line.includes("| ID|")) {
      currentSchema = detectSchema(line);
      headerSeen = false;
      continue;
    }

    if (line.match(/^\|[\s-|]+\|$/)) {
      headerSeen = true;
      continue;
    }

    if (headerSeen && currentSchema && currentSchema.hasStatus && line.startsWith("|")) {
      const statusIdx = currentSchema.columns.findIndex(
        (c) => c.toLowerCase() === "status"
      );
      if (statusIdx === -1) continue;

      // Check if this row matches the task ID
      const rawCells = line.split("|");
      // rawCells[0] is empty (before first |), actual cells start at index 1
      const idIdx = currentSchema.columns.findIndex(
        (c) => c.toLowerCase() === "id"
      );
      const idCell = (rawCells[idIdx + 1] ?? "").replace(/\*\*/g, "").trim();
      if (idCell !== taskId) continue;

      // Preserve bold formatting if the original cell had it
      const originalCell = rawCells[statusIdx + 1] ?? "";
      const hasBold = originalCell.includes("**");
      rawCells[statusIdx + 1] = hasBold
        ? ` **${newStatus}** `
        : ` ${newStatus} `;
      lines[i] = rawCells.join("|");

      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
      return true;
    }
  }

  return false;
}

// --- Spec Parser ---

async function markdownToHtml(md: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(remarkHtml).process(md);
  return result.toString();
}

function extractCheckboxes(content: string): {
  total: number;
  checked: number;
} {
  const checkboxes = content.match(/- \[[ x]\]/g) || [];
  const checked = content.match(/- \[x\]/gi) || [];
  return { total: checkboxes.length, checked: checked.length };
}

function extractMetadata(content: string) {
  const lines = content.split("\n");
  const title = (lines.find((l) => l.startsWith("# ")) || "").replace("# ", "").trim();

  const getValue = (key: string) => {
    const line = lines.find((l) => l.toLowerCase().startsWith(`**${key.toLowerCase()}**`));
    if (!line) return "";
    return line.replace(/\*\*/g, "").replace(new RegExp(`^${key}:\\s*`, "i"), "").trim();
  };

  return {
    title,
    priority: getValue("Priority"),
    type: getValue("Type"),
    projects: getValue("Projects"),
  };
}

export function findSpecFile(id: string): string | null {
  const specsDir = path.join(FEATURES_DIR, "specs");
  if (!fs.existsSync(specsDir)) return null;

  const files = fs.readdirSync(specsDir);
  const match = files.find((f) => f.startsWith(`${id}-`) && f.endsWith(".md"));
  return match ? path.join(specsDir, match) : null;
}

export async function parseSpec(id: string): Promise<SpecFile | null> {
  const filePath = findSpecFile(id);
  if (!filePath) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const htmlContent = await markdownToHtml(content);

  return {
    id,
    filename: path.basename(filePath),
    content,
    htmlContent,
    metadata: extractMetadata(content),
    checkboxes: extractCheckboxes(content),
  };
}

// --- Progress Parser ---

function parseProgressSessions(content: string): ProgressSession[] {
  const sessions: ProgressSession[] = [];
  const sessionRegex = /^## (\d{4}-\d{2}-\d{2})\s*—\s*(.*)/gm;
  let match;
  const positions: { date: string; title: string; start: number }[] = [];

  while ((match = sessionRegex.exec(content)) !== null) {
    positions.push({
      date: match[1],
      title: match[2].trim(),
      start: match.index,
    });
  }

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const end = i + 1 < positions.length ? positions[i + 1].start : content.length;
    const sectionContent = content.slice(pos.start, end).trim();

    // Extract status from ### Status: line
    const statusMatch = sectionContent.match(/### Status:\s*(.*)/);
    const status = statusMatch ? statusMatch[1].trim() : "";

    sessions.push({
      date: pos.date,
      title: pos.title,
      status,
      content: sectionContent,
    });
  }

  return sessions;
}

export function findProgressFile(id: string): string | null {
  const progressDir = path.join(FEATURES_DIR, "progress");
  if (!fs.existsSync(progressDir)) return null;

  const files = fs.readdirSync(progressDir);
  const match = files.find((f) => f.startsWith(`${id}-`) && f.endsWith(".md"));
  return match ? path.join(progressDir, match) : null;
}

export async function parseProgress(id: string): Promise<ProgressFile | null> {
  const filePath = findProgressFile(id);
  if (!filePath) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const htmlContent = await markdownToHtml(content);

  return {
    id,
    filename: path.basename(filePath),
    content,
    htmlContent,
    sessions: parseProgressSessions(content),
  };
}
