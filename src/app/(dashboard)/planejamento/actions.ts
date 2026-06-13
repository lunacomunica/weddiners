"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_ITEMS } from "./checklistData";

async function getCoupleId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("couples").select("id").eq("user_id", user.id).single();
  return data?.id ?? null;
}

// Seeds default items if the couple has none yet
export async function ensureDefaultItems(coupleId: string) {
  const supabase = createClient();
  const { count } = await supabase
    .from("checklist_items")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId);

  if ((count ?? 0) > 0) return;

  const rows = DEFAULT_ITEMS.map(item => ({
    couple_id: coupleId,
    title: item.title,
    category: item.category,
    months_before: item.monthsBefore,
    done: item.done,
    tip: item.tip ?? null,
    is_default: true,
  }));

  await supabase.from("checklist_items").insert(rows);
}

export async function toggleChecklistItem(id: string, done: boolean) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("checklist_items")
    .update({ done, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/planejamento");
  return { success: true };
}

export async function createChecklistItem(
  title: string,
  category: string,
  monthsBefore: number,
  tip?: string
) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase.from("checklist_items").insert({
    couple_id: coupleId,
    title,
    category,
    months_before: monthsBefore,
    tip: tip ?? null,
    done: false,
    is_default: false,
  });

  if (error) return { error: error.message };
  revalidatePath("/planejamento");
  return { success: true };
}

export async function deleteChecklistItem(id: string) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/planejamento");
  return { success: true };
}
