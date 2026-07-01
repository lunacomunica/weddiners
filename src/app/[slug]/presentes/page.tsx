import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const revalidate = 300;
import { GiftCard } from "./GiftCard";
import { SortBar } from "./SortBar";

interface Props {
  params: { slug: string };
  searchParams: { sort?: string };
}

const categoryLabels: Record<string, string> = {
  viagem: "🌍 Viagem",
  casa: "🏠 Casa",
  experiencia: "✨ Experiência",
  livre: "🎁 Livre",
};

export default async function PresentesPublicasPage({ params, searchParams }: Props) {
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

  const sort = searchParams?.sort ?? "order";
  const giftsQuery = supabase.from("gifts").select("*").eq("couple_id", couple.id).eq("is_received", false);
  if (sort === "price_asc") giftsQuery.order("amount", { ascending: true });
  else if (sort === "price_desc") giftsQuery.order("amount", { ascending: false });
  else giftsQuery.order("order_index", { ascending: true });

  const [{ data: gifts }, { data: siteConfig }] = await Promise.all([
    giftsQuery,
    supabase.from("site_configs").select("cover_photo_url, gifts_notice").eq("couple_id", couple.id).single(),
  ]);

  const coverPhoto = siteConfig?.cover_photo_url ?? null;
  const giftsNotice = siteConfig?.gifts_notice ?? null;
  const categories = Array.from(new Set(gifts?.map(g => g.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div
        className="relative text-white py-20 px-4 text-center"
        style={{
          background: coverPhoto
            ? `url(${coverPhoto}) center/cover no-repeat`
            : "#4A5C3E",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        {/* Nav topo */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
          <a
            href={`/${params.slug}`}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-body transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar ao site
          </a>
          <a
            href={`/${params.slug}/rsvp`}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-body px-4 py-1.5 rounded-full transition-colors"
          >
            Confirmar presença
          </a>
        </div>

        <div className="relative z-10">
          <p className="font-body text-white/70 text-sm uppercase tracking-widest mb-3">Lista de presentes</p>
          <h1 className="font-display text-4xl md:text-6xl drop-shadow-md">
            {couple.bride_name} & {couple.groom_name}
          </h1>
          {couple.wedding_date && (
            <p className="text-white/80 font-body text-sm mt-3">
              {new Date(couple.wedding_date + "T00:00:00").toLocaleDateString("pt-BR", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          )}
        </div>
      </div>

      {/* Banner aviso personalizado */}
      {giftsNotice && (
        <div className="bg-amber-50 border-y-2 border-amber-200 py-5 px-4">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-xl">🎁</div>
            <p className="text-amber-800 font-body text-sm leading-relaxed">{giftsNotice}</p>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          {categories.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => cat && (
                <span key={cat} className="px-4 py-1.5 bg-white border border-noir/10 rounded-full text-sm font-body text-smoke">
                  {categoryLabels[cat] ?? cat}
                </span>
              ))}
            </div>
          ) : <div />}
          <Suspense>
            <SortBar slug={params.slug} />
          </Suspense>
        </div>

        {!gifts || gifts.length === 0 ? (
          <div className="text-center py-20 text-smoke font-body">
            <p className="text-4xl mb-3">🎁</p>
            <p className="font-display text-2xl text-noir">Nenhum presente disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {gifts.map(gift => (
              <GiftCard
                key={gift.id}
                gift={gift}
                coupleId={couple.id}
                pixKey={couple.pix_key!}
                pixKeyType={couple.pix_key_type ?? "random"}
                pixHolderName={couple.pix_holder_name ?? ""}
                pixCity={couple.wedding_city ?? "Brasil"}
                coupleName={`${couple.bride_name} & ${couple.groom_name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 flex items-center justify-center sidebar-texture">
        <a href="https://weddiners.com.br/" target="_blank" rel="noopener noreferrer">
          <img src="/logo.png" alt="Weddiners" className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />
        </a>
      </footer>
    </div>
  );
}
