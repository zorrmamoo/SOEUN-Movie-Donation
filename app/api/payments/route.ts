import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const ALLOWED_AMOUNTS = [10000, 30000, 50000, 100000];
const ALLOWED_PAYMENT_METHODS = ["bank-transfer", "toss", "kakaopay"];
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const amount = Number(formData.get("amount"));
    const nickname = String(formData.get("nickname") ?? "").trim() || "익명";
    const message = String(formData.get("message") ?? "").trim();
    const paymentMethod = String(formData.get("paymentMethod") ?? "");
    const avatarFile = formData.get("avatar");

    if (!ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    let avatarUrl: string | null = null;

    if (avatarFile instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.includes(avatarFile.type)) {
        return NextResponse.json(
          { error: "Invalid avatar file type" },
          { status: 400 }
        );
      }

      if (avatarFile.size > MAX_AVATAR_SIZE) {
        return NextResponse.json(
          { error: "Avatar file is too large" },
          { status: 400 }
        );
      }

      const filePath = `${crypto.randomUUID()}.png`;

      const { error: uploadError } = await supabaseServer.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          contentType: avatarFile.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }

      const { data } = supabaseServer.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatarUrl = data.publicUrl;
    }

    const orderId = crypto.randomUUID();
    const paymentKey = `simulated_${orderId}`;
    const status =
      paymentMethod === "bank-transfer" ? "pending" : "approved";

    const { error } = await supabaseServer.from("donations").insert({
      order_id: orderId,
      payment_key: paymentKey,
      amount,
      nickname,
      message: message || null,
      payment_method: paymentMethod,
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      avatar_url: avatarUrl,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      nickname,
      message,
      paymentMethod,
      status,
      avatarUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}