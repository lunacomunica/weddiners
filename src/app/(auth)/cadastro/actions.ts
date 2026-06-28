"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function normalizeSlugPart(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createClient>,
  brideName: string,
  groomName: string
): Promise<string> {
  const base = `${normalizeSlugPart(brideName)}-e-${normalizeSlugPart(groomName)}`;

  // Busca todos os slugs que começam com o base
  const { data: existing } = await supabase
    .from("couples")
    .select("slug")
    .or(`slug.eq.${base},slug.like.${base}-%`);

  const taken = new Set(existing?.map((r) => r.slug) ?? []);

  if (!taken.has(base)) return base;

  // Adiciona sufixo numérico até encontrar um livre
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
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
