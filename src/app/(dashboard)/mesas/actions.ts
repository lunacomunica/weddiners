"use server";

import { getCoupleId } from "@/lib/getCoupleId";
import { revalidatePath } from "next/cache";

export async function createTable(name: string, capacity: number) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase.from("tables").insert({ couple_id: coupleId, name, capacity });
  if (error) return { error: error.message };
  revalidatePath("/mesas");
  return { success: true };
}

export async function updateTable(id: string, name: string, capacity: number) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("tables")
    .update({ name, capacity })
    .eq("id", id)
    .eq("couple_id", coupleId);
  if (error) return { error: error.message };
  revalidatePath("/mesas");
  return { success: true };
}

export async function deleteTable(id: string) {
  const { supabase, coupleId } = await getCoupleId();

  // Guests are automatically unassigned (ON DELETE SET NULL via FK)
  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);
  if (error) return { error: error.message };
  revalidatePath("/mesas");
  revalidatePath("/convidados");
  return { success: true };
}

export async function assignGuestToTable(guestId: string, tableId: string | null) {
  const { supabase, coupleId } = await getCoupleId();

  // Check capacity if assigning (not removing)
  if (tableId) {
    const [{ data: table }, { count }] = await Promise.all([
      supabase.from("tables").select("capacity").eq("id", tableId).single(),
      supabase.from("guests").select("*", { count: "exact", head: true }).eq("table_id", tableId),
    ]);
    if (table && (count ?? 0) >= table.capacity) {
      return { error: "Mesa já está na capacidade máxima" };
    }
  }

  const { error } = await supabase
    .from("guests")
    .update({ table_id: tableId })
    .eq("id", guestId)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/mesas");
  revalidatePath("/convidados");
  return { success: true };
}
