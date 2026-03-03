import fs from "fs";
import path from "path";
import { FEATURES_DIR } from "./config";
import type { DeliveryStage, DeliveryLog } from "./types";

function parseField(lines: string[], key: string): string {
  const line = lines.find((l) =>
    l.trim().startsWith(`- **${key}**:`)
  );
  if (!line) return "";
  return line.replace(new RegExp(`^-\\s*\\*\\*${key}\\*\\*:\\s*`), "").trim();
}

function parseListField(lines: string[], key: string): string[] {
  const raw = parseField(lines, key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseStageSection(header: string, body: string): DeliveryStage {
  const headerMatch = header.match(/^##\s+(\w+):\s+(.+)/);
  const role = headerMatch ? headerMatch[1] : "";
  const label = headerMatch ? headerMatch[2].trim() : "";

  const lines = body.split("\n");

  return {
    role,
    label,
    status: parseField(lines, "Status") || "pending",
    agent: parseField(lines, "Agent"),
    date: parseField(lines, "Date"),
    notes: parseField(lines, "Notes"),
    commits: parseListField(lines, "Commits"),
    screenshots: parseListField(lines, "Screenshots"),
    report: parseField(lines, "Report"),
  };
}

export function findDeliveryFile(id: string): string | null {
  const deliveryDir = path.join(FEATURES_DIR, "delivery");
  if (!fs.existsSync(deliveryDir)) return null;

  const files = fs.readdirSync(deliveryDir);
  // Exact match first (e.g., M9.md), then prefix match (e.g., M9-something.md)
  const exact = files.find(
    (f) => f.toLowerCase() === `${id.toLowerCase()}.md`
  );
  if (exact) return path.join(deliveryDir, exact);

  const prefix = files.find(
    (f) => f.toLowerCase().startsWith(`${id.toLowerCase()}-`) && f.endsWith(".md")
  );
  return prefix ? path.join(deliveryDir, prefix) : null;
}

export function parseDeliveryLog(id: string): DeliveryLog | null {
  const filePath = findDeliveryFile(id);
  if (!filePath) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const stages: DeliveryStage[] = [];

  // Split by ## headers (stage sections)
  const sections = content.split(/^(?=## )/m);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed.startsWith("## ")) continue;

    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline === -1) {
      // Header only, no body
      const headerMatch = trimmed.match(/^##\s+(\w+):\s+(.+)/);
      if (headerMatch) {
        stages.push({
          role: headerMatch[1],
          label: headerMatch[2].trim(),
          status: "pending",
          agent: "",
          date: "",
          notes: "",
          commits: [],
          screenshots: [],
          report: "",
        });
      }
      continue;
    }

    const header = trimmed.slice(0, firstNewline).trim();
    const body = trimmed.slice(firstNewline + 1);
    stages.push(parseStageSection(header, body));
  }

  return {
    id,
    filename: path.basename(filePath),
    stages,
    content,
  };
}

export function updateDeliveryField(
  id: string,
  stageRole: string,
  stageLabel: string,
  field: string,
  value: string
): boolean {
  const filePath = findDeliveryFile(id);
  if (!filePath) return false;

  const content = fs.readFileSync(filePath, "utf-8");
  const targetHeader = `## ${stageRole}: ${stageLabel}`;

  const headerIdx = content.indexOf(targetHeader);
  if (headerIdx === -1) return false;

  // Find the end of this section (next ## or EOF)
  const nextSectionIdx = content.indexOf("\n## ", headerIdx + targetHeader.length);
  const sectionEnd = nextSectionIdx === -1 ? content.length : nextSectionIdx;

  const sectionContent = content.slice(headerIdx, sectionEnd);
  const fieldPattern = new RegExp(`(- \\*\\*${field}\\*\\*:).*`);

  let updatedSection: string;
  if (fieldPattern.test(sectionContent)) {
    updatedSection = sectionContent.replace(fieldPattern, `$1 ${value}`);
  } else {
    // Add the field before the end of the section
    const lines = sectionContent.split("\n");
    const lastContentLine = lines.findLastIndex((l) => l.trim().startsWith("- **"));
    if (lastContentLine !== -1) {
      lines.splice(lastContentLine + 1, 0, `- **${field}**: ${value}`);
    } else {
      lines.push(`- **${field}**: ${value}`);
    }
    updatedSection = lines.join("\n");
  }

  const updatedContent =
    content.slice(0, headerIdx) + updatedSection + content.slice(sectionEnd);

  fs.writeFileSync(filePath, updatedContent, "utf-8");
  return true;
}
