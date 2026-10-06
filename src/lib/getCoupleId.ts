import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getCoupleId() {
  // ── Cerimonialista managing: check cookie FIRST ──
  const cookieStore = cookies();
  const managingId = cookieStore.get("cerim_managing")?.value;

  if (managingId) {
    const serviceClient = createServiceClient();
    const { data: managedCouple } = await serviceClient
      .from("couples")
      .select("id, plan")
      .eq("id", managingId)
      .single();

    if (managedCouple) {
      const authClient = createClient();
      const { data: { user: cerimUser } } = await authClient.auth.getUser();
      if (cerimUser) {
        return { supabase: serviceClient, coupleId: managedCouple.id, plan: (managedCouple.plan ?? "free") as string, userId: cerimUser.id };
      }
    }
  }

  // ── Normal path ──
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: owned } = await supabase
    .from("couples")
    .select("id, plan")
    .eq("user_id", user.id)
    .single();

  if (owned) return { supabase, coupleId: owned.id, plan: (owned.plan ?? "free") as string, userId: user.id };

  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id, couples(id, plan)")
    .eq("user_id", user.id)
    .single();

  if (member && member.couples) {
    const couple = member.couples as unknown as { id: string; plan: string | null };
    return { supabase, coupleId: couple.id, plan: (couple.plan ?? "free") as string, userId: user.id };
  }

  throw new Error("Casal não encontrado");
}
