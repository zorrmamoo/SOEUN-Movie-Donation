import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("donations")
    .select("id, nickname, message, created_at")
    .eq("status", "approved")
    .not("message", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((donation) => ({
      id: donation.id,
      nickname: donation.nickname || "익명",
      message: donation.message,
    }))
  );
}