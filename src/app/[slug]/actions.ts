"use server";

import { createClient } from "@/lib/supabase/server";

export async function postMessage(slug: string, guestName: string, message: string) {
  const supabase = createClient();

  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!couple) return { error: "Casal não encontrado" };

  const { data, error } = await supabase
    .from("messages")
    .insert({ couple_id: couple.id, guest_name: guestName, message, approved: true })
    .select("id, guest_name, message, created_at")
    .single();

  if (error) return { error: error.message };

  return { success: true, message: data };
}
