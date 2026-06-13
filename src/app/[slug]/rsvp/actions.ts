"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitRsvp(formData: FormData) {
  const supabase = createClient();

  const guestId = formData.get("guest_id") as string;
  const attending = formData.get("attending") as string;
  const adults = Number(formData.get("adults") ?? 1);
  const children = Number(formData.get("children") ?? 0);
  const dietary = formData.get("dietary_restrictions") as string;
  const _message = formData.get("message") as string;

  const { error } = await supabase
    .from("guests")
    .update({
      rsvp_status: attending === "yes" ? "confirmed" : "declined",
      adults,
      children,
      dietary_restrictions: dietary || null,
      rsvp_responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestId);

  if (error) return { error: error.message };
  return { success: true, attending: attending === "yes" };
}
