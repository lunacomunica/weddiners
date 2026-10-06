import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getCoupleId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Tenta como dono
  const { data: owned } = await supabase
    .from("couples")
    .select("id, plan")
    .eq("user_id", user.id)
    .single();

  if (owned) return { supabase, coupleId: owned.id, plan: (owned.plan ?? "free") as string, userId: user.id };

  // Tenta como membro convidado
  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id, couples(id, plan)")
    .eq("user_id", user.id)
    .single();

  if (member && member.couples) {
    const couple = member.couples as unknown as { id: string; plan: string | null };
    return { supabase, coupleId: couple.id, plan: (couple.plan ?? "free") as string, userId: user.id };
  }

  // Tenta como cerimonialista gerenciando um casal
  const cookieStore = cookies();
  const managingId = cookieStore.get("cerim_managing")?.value;

  if (managingId) {
    const { data: link } = await supabase
      .from("couple_cerimonialistas")
      .select("couple_id, couples(id, plan)")
      .eq("cerimonialista_id", user.id)
      .eq("couple_id", managingId)
      .eq("status", "active")
      .single();

    if (link && link.couples) {
      const couple = link.couples as unknown as { id: string; plan: string | null };
      return { supabase, coupleId: couple.id, plan: (couple.plan ?? "free") as string, userId: user.id };
    }
  }

  throw new Error("Casal não encontrado");
}
