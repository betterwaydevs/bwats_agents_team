import path from "path";

export const FEATURES_DIR =
  process.env.FEATURES_DIR ||
  path.join(process.cwd(), "..", "features");

export const REPORTS_DIR =
  process.env.REPORTS_DIR ||
  path.join(process.cwd(), "..", "features", "reports");

export const SCREENSHOTS_DIR =
  process.env.SCREENSHOTS_DIR ||
  path.join(
    process.cwd(),
    "..",
    "..",
    "nearshore-talent-compass",
    "tests",
    "screenshots"
  );

export const PLAYWRIGHT_REPORT_DIR =
  process.env.PLAYWRIGHT_REPORT_DIR ||
  path.join(
    process.cwd(),
    "..",
    "..",
    "nearshore-talent-compass",
    "playwright-report"
  );
