import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Helper reutilizável: autentica o usuário e busca o casal em uma chamada só.
 * Redireciona para /login se não autenticado ou sem casal.
 */
export async function getCouple() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!couple) redirect("/login");

  return { supabase, user, couple };
}
