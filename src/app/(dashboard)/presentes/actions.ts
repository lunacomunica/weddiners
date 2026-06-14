"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCoupleId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!couple) throw new Error("Casal não encontrado");
  return { supabase, coupleId: couple.id };
}

export async function createGift(formData: FormData) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase.from("gifts").insert({
    couple_id: coupleId,
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    amount: Number(formData.get("amount")),
    category: formData.get("category") as string || null,
    image_url: formData.get("image_url") as string || null,
    is_group_gift: formData.get("is_group_gift") === "true",
    target_amount: formData.get("target_amount") ? Number(formData.get("target_amount")) : null,
  });

  if (error) return { error: error.message };
  revalidatePath("/presentes");
}

export async function updateGift(id: string, formData: FormData) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("gifts")
    .update({
      title: formData.get("title") as string,
      description: formData.get("description") as string || null,
      amount: Number(formData.get("amount")),
      category: formData.get("category") as string || null,
      image_url: formData.get("image_url") as string || null,
      is_group_gift: formData.get("is_group_gift") === "true",
      target_amount: formData.get("target_amount") ? Number(formData.get("target_amount")) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/presentes");
}

export async function deleteGift(id: string) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase.from("gifts").delete().eq("id", id).eq("couple_id", coupleId);
  revalidatePath("/presentes");
}

export async function updateImagePosition(id: string, position: number) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase
    .from("gifts")
    .update({ image_position: position })
    .eq("id", id)
    .eq("couple_id", coupleId);
  revalidatePath("/presentes");
}

export async function toggleGiftReceived(id: string, isReceived: boolean) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase
    .from("gifts")
    .update({ is_received: isReceived, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", coupleId);
  revalidatePath("/presentes");
}

export async function updatePixKey(formData: FormData) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("couples")
    .update({
      pix_key: formData.get("pix_key") as string,
      pix_key_type: formData.get("pix_key_type") as string,
      pix_holder_name: formData.get("pix_holder_name") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/presentes");
}
