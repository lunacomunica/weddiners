"use server";

import { createClient } from "@/lib/supabase/server";

export async function lookupPin(
  slug: string,
  pin: string
): Promise<
  | { type: "guest"; guestId: string; name: string }
  | { type: "group"; token: string; name: string }
  | { error: string }
> {
  const supabase = createClient();

  // Get couple by slug
  const { data: couple } = await supabase.from("couples").select("id").eq("slug", slug).single();
  if (!couple) return { error: "not_found" };

  // Try guest pin first
  const { data: guest } = await supabase
    .from("guests")
    .select("id, name")
    .eq("couple_id", couple.id)
    .eq("pin", pin.trim())
    .maybeSingle();
  if (guest) return { type: "guest", guestId: guest.id, name: guest.name };

  // Try group pin
  const { data: group } = await supabase
    .from("guest_groups")
    .select("id, name, token")
    .eq("couple_id", couple.id)
    .eq("pin", pin.trim())
    .maybeSingle();
  if (group) return { type: "group", token: group.token, name: group.name };

  return { error: "not_found" };
}
