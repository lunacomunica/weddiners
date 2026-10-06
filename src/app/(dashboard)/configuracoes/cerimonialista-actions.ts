"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCoupleId } from "@/lib/getCoupleId";
import { revalidatePath } from "next/cache";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function inviteCerimonialista(email: string) {
  const { supabase, coupleId } = await getCoupleId();
  const serviceClient = getServiceClient();

  const normalizedEmail = email.toLowerCase().trim();

  // Busca cerimonialista pelo e-mail na tabela de profiles
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("id, display_name, email")
    .eq("email", normalizedEmail)
    .eq("role", "cerimonialista")
    .single();

  if (!profile) {
    return { error: "Nenhuma cerimonialista encontrada com esse e-mail. Peça pra ela criar uma conta no Weddiners." };
  }

  // Verifica se já existe vínculo
  const { data: existing } = await supabase
    .from("couple_cerimonialistas")
    .select("id, status")
    .eq("couple_id", coupleId)
    .eq("cerimonialista_id", profile.id)
    .single();

  if (existing) {
    if (existing.status === "active") return { error: "Esta cerimonialista já está vinculada ao seu casamento." };
    if (existing.status === "pending") return { error: "Convite já enviado. Aguardando aceite da cerimonialista." };
  }

  const { error } = await serviceClient
    .from("couple_cerimonialistas")
    .insert({
      couple_id: coupleId,
      cerimonialista_id: profile.id,
      status: "pending",
    });

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true, name: profile.display_name };
}

export async function removeCerimonialista(linkId: string) {
  const { supabase, coupleId } = await getCoupleId();

  const { error } = await supabase
    .from("couple_cerimonialistas")
    .delete()
    .eq("id", linkId)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  return { success: true };
}
