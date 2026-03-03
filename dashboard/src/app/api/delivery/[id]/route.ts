import { NextRequest, NextResponse } from "next/server";
import { parseDeliveryLog, updateDeliveryField } from "@/lib/delivery-parser";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const delivery = parseDeliveryLog(id);

    if (!delivery) {
      return NextResponse.json(
        { error: `Delivery log not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Failed to parse delivery log:", error);
    return NextResponse.json(
      { error: "Failed to parse delivery log" },
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
    const body = await request.json();
    const { role, label, field, value } = body;

    if (!role || !label || !field || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: role, label, field, value" },
        { status: 400 }
      );
    }

    const success = updateDeliveryField(id, role, label, field, value);

    if (!success) {
      return NextResponse.json(
        { error: `Stage ${role}: ${label} not found in delivery log ${id}` },
        { status: 404 }
      );
    }

    // Return updated delivery log
    const updated = parseDeliveryLog(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update delivery log:", error);
    return NextResponse.json(
      { error: "Failed to update delivery log" },
      { status: 500 }
    );
  }
}
