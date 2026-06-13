"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerContribution(formData: FormData) {
  const supabase = createClient();

  const giftId = formData.get("gift_id") as string;
  const coupleId = formData.get("couple_id") as string;
  const giverName = formData.get("giver_name") as string;
  const giverEmail = formData.get("giver_email") as string;
  const amount = Number(formData.get("amount"));
  const message = formData.get("message") as string;
  const pixKey = formData.get("pix_key") as string;
  const pixHolderName = formData.get("pix_holder_name") as string;

  const { error } = await supabase.from("gift_contributions").insert({
    gift_id: giftId,
    couple_id: coupleId,
    giver_name: giverName,
    giver_email: giverEmail || null,
    amount,
    message: message || null,
    pix_key: pixKey,
    pix_holder_name: pixHolderName,
    status: "pending",
  });

  if (error) return { error: error.message };
  return { success: true };
}
