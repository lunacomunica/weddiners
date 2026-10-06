import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type SupabaseClient = ReturnType<typeof createClient>;

export async function logActivity(
  supabase: SupabaseClient,
  coupleId: string,
  userId: string,
  description: string,
  action: string
) {
  // Busca o nome do ator
  let actorName = "Sistema";

  const cookieStore = cookies();
  const managing = cookieStore.get("cerim_managing")?.value;

  if (managing === coupleId) {
    // É uma cerimonialista agindo
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    actorName = profile?.display_name ? `${profile.display_name} (cerimonialista)` : "Cerimonialista";
  } else {
    // É a noiva/casal agindo
    const { data: couple } = await supabase
      .from("couples")
      .select("partner1_name, bride_name")
      .eq("user_id", userId)
      .single();
    actorName = couple?.partner1_name || couple?.bride_name || "Noiva";
  }

  // Fire-and-forget: não bloqueia a action principal
  supabase.from("couple_activities").insert({
    couple_id: coupleId,
    actor_id: userId,
    actor_name: actorName,
    action,
    description,
  }).then(() => {});
}
