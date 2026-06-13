"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCoupleId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: couple } = await supabase
    .from("couples")
    .select("id, plan")
    .eq("user_id", user.id)
    .single();
  if (!couple) throw new Error("Casal não encontrado");
  return { supabase, coupleId: couple.id, plan: (couple.plan ?? "free") as string };
}

export async function createGuest(formData: FormData) {
  const { supabase, coupleId, plan } = await getCoupleId();

  if (plan === "free") {
    const { count } = await supabase
      .from("guests")
      .select("id", { count: "exact", head: true })
      .eq("couple_id", coupleId);
    if ((count ?? 0) >= 50) {
      return { error: "Limite de 50 convidados atingido no plano Gratuito. Faça upgrade para o Pro e tenha convidados ilimitados." };
    }
  }

  const { error } = await supabase.from("guests").insert({
    couple_id: coupleId,
    name: formData.get("name") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    group_name: formData.get("group_name") as string || null,
    table_number: formData.get("table_number") ? Number(formData.get("table_number")) : null,
    adults: Number(formData.get("adults") ?? 1),
    children: Number(formData.get("children") ?? 0),
    dietary_restrictions: formData.get("dietary_restrictions") as string || null,
    notes: formData.get("notes") as string || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/convidados");
}

export async function updateGuest(id: string, formData: FormData) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("guests")
    .update({
      name: formData.get("name") as string,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      group_name: formData.get("group_name") as string || null,
      table_number: formData.get("table_number") ? Number(formData.get("table_number")) : null,
      adults: Number(formData.get("adults") ?? 1),
      children: Number(formData.get("children") ?? 0),
      dietary_restrictions: formData.get("dietary_restrictions") as string || null,
      notes: formData.get("notes") as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/convidados");
}

export async function deleteGuest(id: string) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase.from("guests").delete().eq("id", id).eq("couple_id", coupleId);
  revalidatePath("/convidados");
}

export async function updateSaveTheDateStatus(id: string, status: "nao_enviado" | "enviado" | "visualizado") {
  const { supabase, coupleId } = await getCoupleId();
  await supabase
    .from("guests")
    .update({ save_the_date_status: status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", coupleId);
  revalidatePath("/convidados");
}

export async function importGuestsFromCSV(rows: { name: string; email?: string; phone?: string; group_name?: string }[]) {
  const { supabase, coupleId } = await getCoupleId();

  const inserts = rows.map(row => ({
    couple_id: coupleId,
    name: row.name,
    email: row.email || null,
    phone: row.phone || null,
    group_name: row.group_name || null,
  }));

  const { error } = await supabase.from("guests").insert(inserts);
  if (error) return { error: error.message };
  revalidatePath("/convidados");
  return { count: inserts.length };
}
