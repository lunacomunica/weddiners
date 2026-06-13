import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { ChecklistView } from "./ChecklistView";
import { ensureDefaultItems } from "./actions";

export default async function PlanejamentoPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  // Seed default items on first visit
  await ensureDefaultItems(couple.id);

  const { data: items } = await supabase
    .from("checklist_items")
    .select("id, title, category, months_before, done, tip, is_default")
    .eq("couple_id", couple.id)
    .order("months_before", { ascending: false });

  return (
    <>
      <Header title="Planejamento" subtitle="Seu cronograma completo até o grande dia" />
      <div className="p-4 md:p-8">
        <ChecklistView initialItems={items ?? []} />
      </div>
    </>
  );
}
