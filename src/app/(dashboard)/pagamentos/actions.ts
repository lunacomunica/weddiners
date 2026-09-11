"use server";

import { getCoupleId } from "@/lib/getCoupleId";
import { revalidatePath } from "next/cache";

export async function togglePagamento(id: string, paid: boolean) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("vendor_payments")
    .update({ paid, paid_at: paid ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/pagamentos");
  return { success: true };
}

export async function saveTotalBudget(totalBudget: number) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("couples")
    .update({ total_budget: totalBudget, updated_at: new Date().toISOString() })
    .eq("id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/pagamentos");
  return { success: true };
}
