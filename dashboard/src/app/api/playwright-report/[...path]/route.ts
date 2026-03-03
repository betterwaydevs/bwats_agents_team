import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PLAYWRIGHT_REPORT_DIR } from "@/lib/config";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const relativePath = segments.join("/");

    // Prevent directory traversal by resolving and checking the path stays within PLAYWRIGHT_REPORT_DIR
    const filePath = path.resolve(PLAYWRIGHT_REPORT_DIR, relativePath);
    if (!filePath.startsWith(path.resolve(PLAYWRIGHT_REPORT_DIR))) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return NextResponse.json(
        { error: `File not found: ${relativePath}` },
        { status: 404 }
      );
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": content.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to serve playwright report file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
