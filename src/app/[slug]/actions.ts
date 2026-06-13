"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function unlockSite(slug: string, password: string) {
  const supabase = createClient();
  const { data: couple } = await supabase
    .from("couples")
    .select("site_password, site_password_enabled")
    .eq("slug", slug)
    .single();

  if (!couple || !couple.site_password_enabled) return { error: "Site não protegido" };
  if (couple.site_password !== password.trim()) return { error: "Senha incorreta" };

  // Set a cookie valid for 7 days
  cookies().set(`weddiners-unlock-${slug}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: `/${slug}`,
  });

  return { success: true };
}

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
