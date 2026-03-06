import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface DownloadFile {
  name: string;
  filename: string;
  version: string;
  size: string;
  url: string;
}

const FRIENDLY_NAMES: Record<string, string> = {
  "linked-communication": "Linked Communication",
  "bw-cold-recruiting": "BetterWay Recruiter Assistant",
};

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export async function GET() {
  try {
    const downloadsDir = path.join(process.cwd(), "public", "downloads");

    if (!fs.existsSync(downloadsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(downloadsDir);
    const downloads: DownloadFile[] = [];

    for (const filename of files) {
      if (!filename.endsWith(".zip")) continue;

      const filePath = path.join(downloadsDir, filename);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) continue;

      // Parse version from filename pattern: *-v{version}.zip
      const versionMatch = filename.match(/-v([\d.]+)\.zip$/);
      const version = versionMatch ? versionMatch[1] : "unknown";

      // Extract base name (everything before -v{version}.zip)
      const baseName = filename.replace(/-v[\d.]+\.zip$/, "");
      const name = FRIENDLY_NAMES[baseName] || baseName;

      downloads.push({
        name,
        filename,
        version,
        size: formatSize(stat.size),
        url: `/downloads/${filename}`,
      });
    }

    downloads.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(downloads);
  } catch (error) {
    console.error("Failed to list downloads:", error);
    return NextResponse.json(
      { error: "Failed to list downloads" },
      { status: 500 }
    );
  }
}
