import { createClient } from "@/lib/supabase/server";

export async function getCoupleplan(): Promise<{ plan: "free" | "pro"; guestCount: number; coupleId: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { plan: "free", guestCount: 0, coupleId: "" };

  const { data: couple } = await supabase
    .from("couples")
    .select("id, plan")
    .eq("user_id", user.id)
    .single();

  if (!couple) return { plan: "free", guestCount: 0, coupleId: "" };

  const { count } = await supabase
    .from("guests")
    .select("id", { count: "exact", head: true })
    .eq("couple_id", couple.id);

  return {
    plan: (couple.plan ?? "free") as "free" | "pro",
    guestCount: count ?? 0,
    coupleId: couple.id,
  };
}

export const LIMITS = {
  free: { guests: 50, templates: ["classico"] },
  pro:  { guests: Infinity, templates: ["classico", "romantico", "moderno", "rustico"] },
} as const;
