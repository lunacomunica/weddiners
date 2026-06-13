"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function generateSlug(brideName: string, groomName: string): string {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  return `${normalize(brideName)}-e-${normalize(groomName)}`;
}

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const brideName = formData.get("bride_name") as string;
  const groomName = formData.get("groom_name") as string;
  const weddingDate = formData.get("wedding_date") as string;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Erro ao criar conta." };
  }

  const slug = generateSlug(brideName, groomName);

  const { data: couple, error: coupleError } = await supabase
    .from("couples")
    .insert({
      user_id: authData.user.id,
      slug,
      bride_name: brideName,
      groom_name: groomName,
      wedding_date: weddingDate || null,
    })
    .select()
    .single();

  if (coupleError || !couple) {
    return { error: "Erro ao salvar dados do casal." };
  }

  await supabase.from("site_configs").insert({ couple_id: couple.id });

  redirect("/dashboard");
}
