export const runtime = "edge";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, userId } = await req.json();

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // Use Web Crypto API instead of Node's native crypto module for compatibility with Edge runtime
    const encoder = new TextEncoder();
    const keyData = encoder.encode(process.env.RAZORPAY_KEY_SECRET!);
    const messageData = encoder.encode(text);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const generated_signature = signatureArray
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (generated_signature === razorpay_signature) {
      // Payment is verified
      // Here you would save the order to Firestore
      
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
