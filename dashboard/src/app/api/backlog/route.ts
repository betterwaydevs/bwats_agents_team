import { NextRequest, NextResponse } from "next/server";
import { parseBacklog, updateBacklogStatus } from "@/lib/parser";

const VALID_STATUSES = ["pending", "in-progress", "dev-complete", "done", "blocked"];

export async function GET() {
  try {
    const tasks = parseBacklog();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to parse backlog:", error);
    return NextResponse.json(
      { error: "Failed to parse backlog" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id, status" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const success = updateBacklogStatus(id, status);

    if (!success) {
      return NextResponse.json(
        { error: `Task ${id} not found or has no Status column` },
        { status: 404 }
      );
    }

    const tasks = parseBacklog();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to update backlog status:", error);
    return NextResponse.json(
      { error: "Failed to update backlog status" },
      { status: 500 }
    );
  }
}
