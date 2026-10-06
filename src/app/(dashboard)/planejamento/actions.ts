"use server";

import { createClient } from "@/lib/supabase/server";
import { getCoupleId } from "@/lib/getCoupleId";
import { logActivity } from "@/lib/logActivity";
import { revalidatePath } from "next/cache";
import { DEFAULT_ITEMS } from "./checklistData";

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
  const { supabase, coupleId, userId } = await getCoupleId();

  // Busca o título para o log
  const { data: item } = await supabase
    .from("checklist_items")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("checklist_items")
    .update({ done, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };

  if (item?.title) {
    await logActivity(
      supabase, coupleId, userId,
      done ? `Marcou "${item.title}" como concluída` : `Desmarcou "${item.title}"`,
      done ? "task_done" : "task_undone"
    );
  }

  revalidatePath("/planejamento");
  return { success: true };
}

export async function createChecklistItem(
  title: string,
  category: string,
  monthsBefore: number,
  tip?: string
) {
  const { supabase, coupleId, userId } = await getCoupleId();

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

  await logActivity(supabase, coupleId, userId, `Adicionou tarefa "${title}"`, "task_added");

  revalidatePath("/planejamento");
  return { success: true };
}

export async function updateChecklistItem(
  id: string,
  fields: { title?: string; category?: string; months_before?: number; notes?: string }
) {
  const { supabase, coupleId, userId } = await getCoupleId();

  const { error } = await supabase
    .from("checklist_items")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };

  const label = fields.title ? `"${fields.title}"` : "uma tarefa";
  await logActivity(supabase, coupleId, userId, `Editou ${label}`, "task_updated");

  revalidatePath("/planejamento");
  return { success: true };
}

export async function deleteChecklistItem(id: string) {
  const { supabase, coupleId, userId } = await getCoupleId();

  const { data: item } = await supabase
    .from("checklist_items")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };

  if (item?.title) {
    await logActivity(supabase, coupleId, userId, `Excluiu tarefa "${item.title}"`, "task_deleted");
  }

  revalidatePath("/planejamento");
  return { success: true };
}
