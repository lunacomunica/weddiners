import { getCouple } from "@/lib/getCouple";
import { Header } from "@/components/dashboard/Header";
import { ChecklistView } from "./ChecklistView";
import { ensureDefaultItems } from "./actions";

export default async function PlanejamentoPage() {
  const { supabase, user, couple } = await getCouple();

  // Seed default items on first visit
  await ensureDefaultItems(couple.id);

  const { data: items } = await supabase
    .from("checklist_items")
    .select("id, title, category, months_before, done, tip, notes, is_default")
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
