import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { REPORTS_DIR } from "@/lib/config";

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
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const relativePath = segments.join("/");

    // Prevent directory traversal by resolving and checking the path stays within REPORTS_DIR
    const filePath = path.resolve(REPORTS_DIR, relativePath);
    if (!filePath.startsWith(path.resolve(REPORTS_DIR))) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return NextResponse.json(
        { error: `Report not found: ${relativePath}` },
        { status: 404 }
      );
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);

    // Inject dark-mode and mobile-responsive CSS into HTML reports
    if (ext === ".html") {
      let html = content.toString("utf-8");
      const injectCSS = `<style>
/* Dashboard theme override - injected at serve time */
/* Light mode: no overrides needed, reports' original CSS handles it */

/* Dark mode: activated via html.dark class toggled by dashboard */
html.dark :root {
  --bg: #1a1b1e !important;
  --fg: #e4e4e7 !important;
  --card: #27272a !important;
  --border: #3f3f46 !important;
  --muted: #a1a1aa !important;
  --code-bg: #2d2d30 !important;
  --table-stripe: #27272a !important;
  --shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
}
html.dark body {
  background: #1a1b1e !important;
  color: #e4e4e7 !important;
}
html.dark h1, html.dark h2, html.dark h3, html.dark h4, html.dark h5, html.dark h6 {
  color: #f4f4f5 !important;
}
html.dark table, html.dark th, html.dark td {
  border-color: #3f3f46 !important;
}
html.dark th {
  background: #27272a !important;
  color: #e4e4e7 !important;
}
html.dark tr:nth-child(even) {
  background: #27272a !important;
}
html.dark tr:hover {
  background: #3f3f46 !important;
}
html.dark a { color: #60a5fa !important; }
html.dark section, html.dark div.card, html.dark .summary-card, html.dark article {
  background: #27272a !important;
  border-color: #3f3f46 !important;
}
html.dark pre, html.dark code {
  background: #2d2d30 !important;
}
/* Override common inline light styles */
html.dark [style*="background: #fff"],
html.dark [style*="background: #ffffff"],
html.dark [style*="background: white"],
html.dark [style*="background:#fff"],
html.dark [style*="background:#ffffff"] {
  background: #27272a !important;
}
html.dark [style*="background: #f9fafb"],
html.dark [style*="background: #f5f6fa"],
html.dark [style*="background:#f9fafb"],
html.dark [style*="background: #f0f0f0"],
html.dark [style*="background: #f3f4f6"] {
  background: #27272a !important;
}
html.dark [style*="color: #1f2937"],
html.dark [style*="color: #1a1a2e"],
html.dark [style*="color:#1f2937"] {
  color: #e4e4e7 !important;
}
/* Keep pass/fail badge text readable */
html.dark .badge, html.dark [class*="badge"], html.dark [class*="status"] {
  filter: brightness(1.1);
}
/* Colored section overrides for verdict boxes */
html.dark [style*="background: #f0fdf4"] { background: #14532d !important; }
html.dark [style*="background: #fef2f2"] { background: #450a0a !important; }
html.dark [style*="background: #fffbeb"] { background: #451a03 !important; }
html.dark [style*="background: #f0f9ff"] { background: #0c2d48 !important; }
html.dark [style*="border-color: #bbf7d0"] { border-color: #166534 !important; }
html.dark [style*="border-color: #fecaca"] { border-color: #991b1b !important; }

/* Mobile responsive */
@media (max-width: 768px) {
  body {
    padding: 1rem !important;
    font-size: 0.9rem !important;
  }
  h1 { font-size: 1.3rem !important; }
  h2 { font-size: 1.1rem !important; }
  pre, code {
    font-size: 0.75rem !important;
    overflow-x: auto !important;
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }
  table {
    display: block !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .summary-grid, [style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }
}
</style>`;

      // Inject before </head> if present, otherwise after <body>, otherwise prepend
      if (html.includes("</head>")) {
        html = html.replace("</head>", injectCSS + "</head>");
      } else if (html.includes("<body")) {
        html = html.replace(/<body[^>]*>/, (match) => match + injectCSS);
      } else {
        html = injectCSS + html;
      }

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": content.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to serve report:", error);
    return NextResponse.json(
      { error: "Failed to serve report" },
      { status: 500 }
    );
  }
}
