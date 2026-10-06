"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptInvite(linkId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("couple_cerimonialistas")
    .update({ status: "active", accepted_at: new Date().toISOString() })
    .eq("id", linkId)
    .eq("cerimonialista_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  revalidatePath("/cerimonialista");
  return { success: true };
}

export async function declineInvite(linkId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("couple_cerimonialistas")
    .delete()
    .eq("id", linkId)
    .eq("cerimonialista_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/cerimonialista");
  return { success: true };
}
