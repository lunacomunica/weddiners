"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleMessageApproval(id: string, approved: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data: couple } = await supabase.from("couples").select("id").eq("user_id", user.id).single();
  if (!couple) return { error: "Não autorizado" };

  await supabase.from("messages").update({ approved }).eq("id", id).eq("couple_id", couple.id);
  revalidatePath("/recados");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data: couple } = await supabase.from("couples").select("id").eq("user_id", user.id).single();
  if (!couple) return { error: "Não autorizado" };

  await supabase.from("messages").delete().eq("id", id).eq("couple_id", couple.id);
  revalidatePath("/recados");
  return { success: true };
}
