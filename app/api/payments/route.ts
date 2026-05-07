import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const ALLOWED_AMOUNTS = [10000, 30000, 50000, 100000];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      amount,
      nickname,
      message,
      paymentMethod,
    }: {
      amount: number;
      nickname?: string;
      message?: string;
      paymentMethod?: string;
    } = body;

    if (!ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    const orderId = crypto.randomUUID();
    const paymentKey = `simulated_${orderId}`;

    const { error } = await supabaseServer.from("donations").insert({
      order_id: orderId,
      payment_key: paymentKey,
      amount,
      message: message?.trim() || null,
      approved_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      nickname: nickname?.trim() || "익명",
      message: message?.trim() || "",
      paymentMethod,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}