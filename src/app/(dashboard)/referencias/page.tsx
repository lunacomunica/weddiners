import { getCouple } from "@/lib/getCouple";
import { Header } from "@/components/dashboard/Header";
import { MoodboardView } from "./MoodboardView";
import type { Reference } from "./referencesData";

export default async function ReferenciasPage() {
  const { supabase, couple } = await getCouple();

  const { data } = await supabase
    .from("references")
    .select("*")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false });

  const initialReferences: Reference[] = (data ?? []).map(row => ({
    id: row.id,
    category: row.category,
    imageUrl: row.image_url,
    note: row.note ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceType: row.source_type ?? undefined,
    createdAt: row.created_at,
  }));

  return (
    <>
      <Header
        title="Referências Visuais"
        subtitle="Seu moodboard do casamento — salve e organize suas inspirações"
      />
      <div className="p-4 md:p-8">
        <MoodboardView initialReferences={initialReferences} />
      </div>
    </>
  );
}
