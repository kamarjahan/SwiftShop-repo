import { NextResponse } from "next/server";
import { addSubscriberToGroup, SENDER_GROUPS } from "@/lib/sender";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, firstname, lastname, orderId } = body;

    if (!email || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let groupId = null;

    switch (action) {
      case "ACCOUNT_CREATED":
        groupId = SENDER_GROUPS.ACCOUNT_CREATED;
        break;
      case "ORDER_PLACED":
        groupId = SENDER_GROUPS.ORDER_PLACED;
        break;
      case "ORDER_CANCELLED":
        groupId = SENDER_GROUPS.ORDER_CANCELLED;
        break;
      case "RETURN_REQUESTED":
        groupId = SENDER_GROUPS.RETURN_REQUESTED;
        break;
      case "REFUND_PROCESSED":
        groupId = SENDER_GROUPS.REFUND_PROCESSED;
        break;
      default:
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const success = await addSubscriberToGroup(groupId, {
      email,
      firstname: firstname || "Customer",
      lastname,
      fields: orderId ? { order_id: orderId } : undefined
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Email automation triggered" });
    } else {
      return NextResponse.json({ error: "Failed to trigger automation" }, { status: 500 });
    }

  } catch (error) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
