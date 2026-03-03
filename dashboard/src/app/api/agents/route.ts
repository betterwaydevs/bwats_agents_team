import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const agentsDir = path.join(process.cwd(), "..", "team", ".claude", "agents");

    if (!fs.existsSync(agentsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    const agents = files.map((filename) => {
      const content = fs.readFileSync(path.join(agentsDir, filename), "utf-8");
      const name = filename
        .replace(/\.md$/, "")
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return { name, filename, content };
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to read agents:", error);
    return NextResponse.json(
      { error: "Failed to read agents" },
      { status: 500 }
    );
  }
}
