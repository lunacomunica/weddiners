import { createClient } from "@/lib/supabase/server";

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

  if (owned) return { supabase, coupleId: owned.id, plan: (owned.plan ?? "free") as string };

  // Tenta como membro convidado
  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id, couples(id, plan)")
    .eq("user_id", user.id)
    .single();

  if (member && member.couples) {
    const couple = member.couples as unknown as { id: string; plan: string | null };
    return { supabase, coupleId: couple.id, plan: (couple.plan ?? "free") as string };
  }

  throw new Error("Casal não encontrado");
}
