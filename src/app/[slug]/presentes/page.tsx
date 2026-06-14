import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GiftCard } from "./GiftCard";

interface Props {
  params: { slug: string };
}

const categoryLabels: Record<string, string> = {
  viagem: "🌍 Viagem",
  casa: "🏠 Casa",
  experiencia: "✨ Experiência",
  livre: "🎁 Livre",
};

export default async function PresentesPublicasPage({ params }: Props) {
  const supabase = createClient();

  const { data: couple } = await supabase
    .from("couples")
    .select("id, bride_name, groom_name, wedding_date, wedding_city, pix_key, pix_key_type, pix_holder_name")
    .eq("slug", params.slug)
    .single();

  if (!couple) notFound();
  if (!couple.pix_key) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-smoke font-body">A lista de presentes ainda não está disponível.</p>
      </div>
    );
  }

  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("couple_id", couple.id)
    .eq("is_received", false)
    .order("order_index", { ascending: true });

  const categories = Array.from(new Set(gifts?.map(g => g.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-moss text-white py-12 px-4 text-center">
        <p className="font-body text-white/60 text-sm uppercase tracking-widest mb-2">Lista de presentes</p>
        <h1 className="font-display text-4xl md:text-5xl">
          {couple.bride_name} & {couple.groom_name}
        </h1>
        {couple.wedding_date && (
          <p className="text-white/70 font-body text-sm mt-2">
            {new Date(couple.wedding_date + "T00:00:00").toLocaleDateString("pt-BR", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        )}
        <div className="mt-4 inline-block bg-white/10 rounded-full px-4 py-1.5 text-xs font-body text-white/80">
          ✦ O Pix vai direto para o casal — sem intermediários
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map(cat => cat && (
              <span key={cat} className="px-4 py-1.5 bg-white border border-noir/10 rounded-full text-sm font-body text-smoke">
                {categoryLabels[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {!gifts || gifts.length === 0 ? (
          <div className="text-center py-20 text-smoke font-body">
            <p className="text-4xl mb-3">🎁</p>
            <p className="font-display text-2xl text-noir">Nenhum presente disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map(gift => (
              <GiftCard
                key={gift.id}
                gift={gift}
                coupleId={couple.id}
                pixKey={couple.pix_key!}
                pixKeyType={couple.pix_key_type ?? "random"}
                pixHolderName={couple.pix_holder_name ?? ""}
                pixCity={couple.wedding_city ?? "Brasil"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
