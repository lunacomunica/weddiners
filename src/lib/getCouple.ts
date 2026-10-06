import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCouple() {
  // ── Cerimonialista managing: check cookie FIRST, use service client entirely ──
  const cookieStore = cookies();
  const managingId = cookieStore.get("cerim_managing")?.value;

  if (managingId) {
    const serviceClient = createServiceClient();
    const { data: managedCouple } = await serviceClient
      .from("couples")
      .select("*")
      .eq("id", managingId)
      .single();

    if (managedCouple) {
      // Still verify user is authenticated
      const authClient = createClient();
      const { data: { user: cerimUser } } = await authClient.auth.getUser();
      if (cerimUser) return { supabase: serviceClient, user: cerimUser, couple: managedCouple };
    }
  }

  // ── Normal path: couple owner or member ──
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (couple) return { supabase, user, couple };

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

  redirect("/login");
}
