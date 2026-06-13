import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/dashboard/Header";
import { MoodboardView } from "./MoodboardView";
import type { Reference } from "./referencesData";

async function getReferences(): Promise<Reference[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!couple) return [];

  const { data } = await supabase
    .from("references")
    .select("*")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map(row => ({
    id: row.id,
    category: row.category,
    imageUrl: row.image_url,
    note: row.note ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceType: row.source_type ?? undefined,
    createdAt: row.created_at,
  }));
}

export default async function ReferenciasPage() {
  const initialReferences = await getReferences();

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
