"use server";

import { getCoupleId } from "@/lib/getCoupleId";
import { revalidatePath } from "next/cache";

export async function generateInviteLink(): Promise<{ url?: string; error?: string }> {
  const { supabase, coupleId } = await getCoupleId();

  // Invalida convites anteriores não usados
  await supabase
    .from("couple_invites")
    .update({ used: true })
    .eq("couple_id", coupleId)
    .eq("used", false);

  const { data, error } = await supabase
    .from("couple_invites")
    .insert({ couple_id: coupleId })
    .select("token")
    .single();

  if (error || !data) return { error: "Erro ao gerar convite." };

  revalidatePath("/configuracoes");
  return { url: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${data.token}` };
}

export async function getMembers() {
  const { supabase, coupleId } = await getCoupleId();
  const { data } = await supabase
    .from("couple_members")
    .select("id, user_id, role, created_at")
    .eq("couple_id", coupleId);
  return data ?? [];
}

export async function removeMember(memberId: string) {
  const { supabase, coupleId } = await getCoupleId();
  await supabase
    .from("couple_members")
    .delete()
    .eq("id", memberId)
    .eq("couple_id", coupleId);
  revalidatePath("/configuracoes");
}
