"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// SQL to run in Supabase:
// ALTER TABLE guests ADD COLUMN IF NOT EXISTS pin VARCHAR(6);
// ALTER TABLE guest_groups ADD COLUMN IF NOT EXISTS pin VARCHAR(6);

async function generateUniquePinForCouple(
  supabase: ReturnType<typeof createClient>,
  coupleId: string,
  table: "guests" | "guest_groups"
): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const { data } = await supabase.from(table).select("id").eq("couple_id", coupleId).eq("pin", pin).maybeSingle();
    if (!data) return pin;
  }
  // fallback: 6 digits
  return String(Math.floor(100000 + Math.random() * 900000));
}

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

  const guestType = formData.get("guest_type") as string || "adulto";
  const pin = await generateUniquePinForCouple(supabase, coupleId, "guests");
  const { error } = await supabase.from("guests").insert({
    couple_id: coupleId,
    pin,
    name: formData.get("name") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    group_name: formData.get("group_name") as string || null,
    table_number: formData.get("table_number") ? Number(formData.get("table_number")) : null,
    adults: guestType === "adulto" ? 1 : 0,
    children: guestType === "crianca" ? 1 : 0,
    guest_type: guestType,
    child_age: guestType === "crianca" && formData.get("child_age") ? Number(formData.get("child_age")) : null,
    dietary_restrictions: formData.get("dietary_restrictions") as string || null,
    notes: formData.get("notes") as string || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/convidados");
}

export async function updateGuest(id: string, formData: FormData) {
  const { supabase, coupleId } = await getCoupleId();

  const guestType = formData.get("guest_type") as string || "adulto";
  const { error } = await supabase
    .from("guests")
    .update({
      name: formData.get("name") as string,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      group_name: formData.get("group_name") as string || null,
      table_number: formData.get("table_number") ? Number(formData.get("table_number")) : null,
      adults: guestType === "adulto" ? 1 : 0,
      children: guestType === "crianca" ? 1 : 0,
      guest_type: guestType,
      child_age: guestType === "crianca" && formData.get("child_age") ? Number(formData.get("child_age")) : null,
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

// ─── Guest Groups ────────────────────────────────────────────────────────────

export async function createGuestGroup(name: string) {
  const { supabase, coupleId } = await getCoupleId();
  const pin = await generateUniquePinForCouple(supabase, coupleId, "guest_groups");
  const { data, error } = await supabase
    .from("guest_groups")
    .insert({ couple_id: coupleId, name, pin })
    .select("id, name, token, pin")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/convidados");
  return { success: true, group: data };
}

export async function renameGuestGroup(id: string, name: string) {
  const { supabase, coupleId } = await getCoupleId();
  const { error } = await supabase.from("guest_groups").update({ name }).eq("id", id).eq("couple_id", coupleId);
  revalidatePath("/convidados");
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteGuestGroup(id: string) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase.from("guest_groups").delete().eq("id", id).eq("couple_id", coupleId);
  revalidatePath("/convidados");
}

export async function assignGuestToGroup(guestId: string, groupId: string | null) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase.from("guests").update({ group_id: groupId }).eq("id", guestId).eq("couple_id", coupleId);
  revalidatePath("/convidados");
}
