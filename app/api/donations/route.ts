import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data: total, error: totalError } = await supabaseServer.rpc("get_total_donations");

  if (totalError) {
    return NextResponse.json({ error: totalError.message }, { status: 500 });
  }

  const { data: settings, error: settingsError } = await supabaseServer
    .from("site_settings")
    .select("goal_amount")
    .eq("id", 1)
    .single();

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  return NextResponse.json({
    totalAmount: total ?? 0,
    goalAmount: settings.goal_amount,
  });
}

export async function POST(req: Request) {
  const { amount, message } = await req.json();

  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { error } = await supabaseServer.from("donations").insert({
    amount,
    message: message ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}