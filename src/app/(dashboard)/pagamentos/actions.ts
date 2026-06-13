"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCoupleId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("couples").select("id").eq("user_id", user.id).single();
  return { supabase, coupleId: data?.id ?? null };
}

export async function togglePagamento(id: string, paid: boolean) {
  const result = await getCoupleId();
  if (!result?.coupleId) return { error: "Não autorizado" };
  const { supabase, coupleId } = result;

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
  const result = await getCoupleId();
  if (!result?.coupleId) return { error: "Não autorizado" };
  const { supabase, coupleId } = result;

  const { error } = await supabase
    .from("couples")
    .update({ total_budget: totalBudget, updated_at: new Date().toISOString() })
    .eq("id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/pagamentos");
  return { success: true };
}
