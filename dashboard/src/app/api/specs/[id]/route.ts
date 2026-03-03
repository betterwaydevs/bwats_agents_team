import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseSpec, findSpecFile } from "@/lib/parser";
import { FEATURES_DIR } from "@/lib/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spec = await parseSpec(id);

    if (!spec) {
      return NextResponse.json(
        { error: `Spec not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(spec);
  } catch (error) {
    console.error("Failed to parse spec:", error);
    return NextResponse.json(
      { error: "Failed to parse spec" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Request body must include a 'content' string field" },
        { status: 400 }
      );
    }

    let filePath = findSpecFile(id);

    if (!filePath) {
      // Create a new spec file
      const specsDir = path.join(FEATURES_DIR, "specs");
      if (!fs.existsSync(specsDir)) {
        fs.mkdirSync(specsDir, { recursive: true });
      }
      filePath = path.join(specsDir, `${id}-spec.md`);
    }

    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    console.error("Failed to write spec:", error);
    return NextResponse.json(
      { error: "Failed to write spec" },
      { status: 500 }
    );
  }
}
