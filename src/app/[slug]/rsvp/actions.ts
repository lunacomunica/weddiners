"use server";

import { createClient } from "@supabase/supabase-js";

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function submitRsvp(formData: FormData) {
  const supabase = getPublicClient();

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

export async function submitGroupRsvp(data: {
  groupToken: string;
  confirmados: string[];
  declinados: string[];
  dietaries: Record<string, string>;
  message: string;
}) {
  const supabase = getPublicClient();
  const { groupToken, confirmados, declinados, dietaries, message } = data;

  const { data: group } = await supabase
    .from("guest_groups")
    .select("id, couple_id")
    .eq("token", groupToken)
    .single();

  if (!group) return { error: "Grupo não encontrado" };

  const now = new Date().toISOString();

  if (confirmados.length > 0) {
    await supabase.from("guests")
      .update({ rsvp_status: "confirmed", rsvp_responded_at: now, updated_at: now })
      .in("id", confirmados)
      .eq("group_id", group.id);
  }

  if (declinados.length > 0) {
    await supabase.from("guests")
      .update({ rsvp_status: "declined", rsvp_responded_at: now, updated_at: now })
      .in("id", declinados)
      .eq("group_id", group.id);
  }

  for (const [guestId, dietary] of Object.entries(dietaries)) {
    if (dietary?.trim()) {
      await supabase.from("guests")
        .update({ dietary_restrictions: dietary.trim() })
        .eq("id", guestId)
        .eq("group_id", group.id);
    }
  }

  if (message?.trim()) {
    try {
      await supabase.from("messages").insert({
        couple_id: group.couple_id,
        author_name: "Grupo",
        content: message.trim(),
      });
    } catch { /* silently ignore */ }
  }

  return { success: true };
}
