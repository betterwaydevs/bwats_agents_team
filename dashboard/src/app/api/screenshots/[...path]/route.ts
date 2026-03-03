import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { REPORTS_DIR } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  if (segments.length < 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Prevent path traversal
  for (const seg of segments) {
    if (seg.includes("..") || seg.includes("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
  }

  const filePath = path.join(REPORTS_DIR, ...segments);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
