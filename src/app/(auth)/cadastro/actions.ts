"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function normalizeSlugPart(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createClient>,
  brideName: string,
  groomName: string
): Promise<string> {
  const names = `${normalizeSlugPart(brideName)}-e-${normalizeSlugPart(groomName)}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = `wed-${randomSuffix()}-${names}`;
    const { data } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
  }

  return `wed-${Date.now().toString(36)}-${names}`;
}

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const brideName = formData.get("bride_name") as string;
  const groomName = formData.get("groom_name") as string;
  const weddingDate = formData.get("wedding_date") as string;

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Erro ao criar conta." };
  }

  const slug = await generateUniqueSlug(supabase, brideName, groomName);

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

export async function signUpCerimonialista(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Erro ao criar conta." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      role: "cerimonialista",
      display_name: displayName.trim(),
      email: email.toLowerCase().trim(),
    });

  if (profileError) {
    return { error: "Erro ao salvar perfil." };
  }

  redirect("/cerimonialista");
}
