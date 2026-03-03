import { NextResponse } from "next/server";
import { parseBacklog } from "@/lib/parser";

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
