import { createClient, createServiceClient } from "@/lib/supabase/server";
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
    // Usa a mesma query que o layout usa (e que funciona): busca o casal pelo id
    // com o supabase normal. Se tiver RLS que permite a leitura, retorna o casal.
    const { data: managedCouple } = await supabase
      .from("couples")
      .select("*")
      .eq("id", managingId)
      .single();

    if (managedCouple) {
      // Usa service client para que todas as queries subsequentes (guests, vendors etc.)
      // não sejam bloqueadas por RLS.
      const serviceClient = createServiceClient();
      return { supabase: serviceClient, user, couple: managedCouple };
    }
  }

  redirect("/login");
}
