import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FEATURES_DIR } from "@/lib/config";
import { parseDeliveryLog } from "@/lib/delivery-parser";
import type { DeliveryStage } from "@/lib/types";

export async function GET() {
  try {
    const deliveryDir = path.join(FEATURES_DIR, "delivery");
    if (!fs.existsSync(deliveryDir)) {
      return NextResponse.json({});
    }

    const files = fs.readdirSync(deliveryDir).filter((f) => f.endsWith(".md"));
    const deliveries: Record<string, DeliveryStage[]> = {};

    for (const file of files) {
      const id = file.replace(/\.md$/, "").toUpperCase();
      const log = parseDeliveryLog(id);
      if (log) {
        deliveries[id] = log.stages;
      }
    }

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Failed to list delivery logs:", error);
    return NextResponse.json(
      { error: "Failed to list delivery logs" },
      { status: 500 }
    );
  }
}
