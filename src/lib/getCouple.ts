import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCouple() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Tenta como dono
  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (couple) return { supabase, user, couple };

  // Tenta como membro convidado
  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .single();

  if (member) {
    const { data: memberCouple } = await supabase
      .from("couples")
      .select("*")
      .eq("id", member.couple_id)
      .single();
    if (memberCouple) return { supabase, user, couple: memberCouple };
  }

  // Tenta como cerimonialista gerenciando um casal
  const cookieStore = cookies();
  const managingId = cookieStore.get("cerim_managing")?.value;

  if (managingId) {
    const { data: link } = await supabase
      .from("couple_cerimonialistas")
      .select("id")
      .eq("cerimonialista_id", user.id)
      .eq("couple_id", managingId)
      .eq("status", "active")
      .single();

    if (link) {
      const { data: managedCouple } = await supabase
        .from("couples")
        .select("*")
        .eq("id", managingId)
        .single();
      if (managedCouple) return { supabase, user, couple: managedCouple };
    }
  }

  redirect("/login");
}
