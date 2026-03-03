import { NextRequest, NextResponse } from "next/server";
import { parseProgress } from "@/lib/parser";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progress = await parseProgress(id);

    if (!progress) {
      return NextResponse.json(
        { error: `Progress not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to parse progress:", error);
    return NextResponse.json(
      { error: "Failed to parse progress" },
      { status: 500 }
    );
  }
}
