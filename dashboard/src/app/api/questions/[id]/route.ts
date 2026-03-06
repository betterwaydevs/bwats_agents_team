import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FEATURES_DIR } from "@/lib/config";

function getQuestionPath(id: string) {
  return path.join(FEATURES_DIR, "questions", `${id}.md`);
}

interface QuestionData {
  status: "pending" | "answered" | "none";
  question: string;
  answer: string;
  date: string;
  agent: string;
}

function parseQuestionFile(content: string): QuestionData {
  const statusMatch = content.match(/^Status:\s*(.+)$/m);
  const dateMatch = content.match(/^Date:\s*(.+)$/m);
  const agentMatch = content.match(/^Agent:\s*(.+)$/m);

  const questionMatch = content.match(/## Question\n([\s\S]*?)(?=\n## Answer|$)/);
  const answerMatch = content.match(/## Answer\n([\s\S]*?)$/);

  return {
    status: (statusMatch?.[1]?.trim() as "pending" | "answered") || "pending",
    question: questionMatch?.[1]?.trim() || "",
    answer: answerMatch?.[1]?.trim() || "",
    date: dateMatch?.[1]?.trim() || "",
    agent: agentMatch?.[1]?.trim() || "",
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = getQuestionPath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ status: "none" });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const data = parseQuestionFile(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read question file:", error);
    return NextResponse.json(
      { error: "Failed to read question file" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = getQuestionPath(id);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "No question file found" },
        { status: 404 }
      );
    }

    const { answer } = await request.json();
    if (!answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Missing required field: answer" },
        { status: 400 }
      );
    }

    let content = fs.readFileSync(filePath, "utf-8");

    // Update status to answered
    content = content.replace(/^Status:\s*.+$/m, "Status: answered");

    // Replace answer section
    content = content.replace(
      /## Answer\n[\s\S]*$/,
      `## Answer\n${answer}\n`
    );

    fs.writeFileSync(filePath, content, "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update question file:", error);
    return NextResponse.json(
      { error: "Failed to update question file" },
      { status: 500 }
    );
  }
}
