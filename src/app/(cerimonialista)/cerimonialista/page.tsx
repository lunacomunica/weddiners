import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { acceptInvite, declineInvite } from "./actions";

interface CoupleData {
  id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  bride_name: string | null;
  groom_name: string | null;
  wedding_date: string | null;
  wedding_location: string | null;
  avatar_url: string | null;
}

interface ChecklistStats {
  total: number;
  done: number;
}

export default async function CerimonialistaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { data: links } = await supabase
    .from("couple_cerimonialistas")
    .select(`
      id, status, invited_at, accepted_at,
      couples(
        id, partner1_name, partner2_name, bride_name, groom_name,
        wedding_date, wedding_location, avatar_url
      )
    `)
    .eq("cerimonialista_id", user.id)
    .order("invited_at", { ascending: false });

  const firstName = (profile?.display_name || user.email?.split("@")[0] || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const activeLinks = links?.filter(l => l.status === "active") ?? [];
  const pendingLinks = links?.filter(l => l.status === "pending") ?? [];

  // Busca stats de checklist para casais ativos
  const statsMap: Record<string, ChecklistStats> = {};
  if (activeLinks.length > 0) {
    const coupleIds = activeLinks.map(l => {
      const c = l.couples as unknown as CoupleData;
      return c?.id;
    }).filter(Boolean);

    const { data: checklistItems } = await supabase
      .from("checklist_items")
      .select("couple_id, done")
      .in("couple_id", coupleIds);

    coupleIds.forEach(id => {
      const items = checklistItems?.filter(i => i.couple_id === id) ?? [];
      statsMap[id] = { total: items.length, done: items.filter(i => i.done).length };
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl text-noir">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-smoke font-body text-sm mt-1">
          {activeLinks.length === 0
            ? "Você ainda não tem casamentos vinculados."
            : `Você está gerenciando ${activeLinks.length} casamento${activeLinks.length > 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Convites pendentes */}
      {pendingLinks.length > 0 && (
        <div className="mb-10">
          <h2 className="font-body font-semibold text-sm text-neutral-500 uppercase tracking-wide mb-4">
            Convites pendentes
          </h2>
          <div className="space-y-3">
            {pendingLinks.map(link => {
              const couple = link.couples as unknown as CoupleData;
              if (!couple) return null;
              const name1 = couple.partner1_name || couple.bride_name || "?";
              const name2 = couple.partner2_name || couple.groom_name || "?";
              const weddingDate = couple.wedding_date
                ? new Date(couple.wedding_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
                : null;

              return (
                <div key={link.id} className="bg-white border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Convite pendente</span>
                    </div>
                    <p className="font-display text-xl text-noir">{name1} & {name2}</p>
                    {weddingDate && <p className="text-sm text-smoke font-body">{weddingDate}</p>}
                    {couple.wedding_location && <p className="text-xs text-smoke/70 font-body">{couple.wedding_location}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={async () => { "use server"; await declineInvite(link.id); }}>
                      <button type="submit" className="border border-neutral-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors">
                        Recusar
                      </button>
                    </form>
                    <form action={async () => { "use server"; await acceptInvite(link.id); }}>
                      <button type="submit" className="btn-primary px-6 py-2 text-sm">
                        Aceitar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Casamentos ativos */}
      {activeLinks.length > 0 && (
        <div>
          <h2 className="font-body font-semibold text-sm text-neutral-500 uppercase tracking-wide mb-4">
            Meus casamentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLinks.map(link => {
              const couple = link.couples as unknown as CoupleData;
              if (!couple) return null;
              const name1 = couple.partner1_name || couple.bride_name || "?";
              const name2 = couple.partner2_name || couple.groom_name || "?";
              const initials = `${name1[0]}${name2[0]}`.toUpperCase();
              const weddingDate = couple.wedding_date
                ? new Date(couple.wedding_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
                : null;
              const daysLeft = couple.wedding_date
                ? Math.ceil((new Date(couple.wedding_date + "T12:00:00").getTime() - Date.now()) / 86400000)
                : null;
              const stats = statsMap[couple.id] ?? { total: 0, done: 0 };
              const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

              return (
                <div key={link.id} className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Topo colorido */}
                  <div className="h-20 bg-gradient-to-br from-sage/20 to-champagne/30 flex items-center justify-between px-6">
                    <div className="w-12 h-12 rounded-full bg-sage/30 flex items-center justify-center">
                      {couple.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={couple.avatar_url} alt={name1} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="font-display text-lg text-sage">{initials}</span>
                      )}
                    </div>
                    {daysLeft !== null && (
                      <div className="text-right">
                        {daysLeft > 0 ? (
                          <>
                            <p className="text-2xl font-display text-noir leading-none">{daysLeft}</p>
                            <p className="text-xs text-smoke font-body">dias</p>
                          </>
                        ) : daysLeft === 0 ? (
                          <p className="text-sm font-medium text-sage">Hoje! 🎊</p>
                        ) : (
                          <p className="text-xs text-smoke/60 font-body">Realizado</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5">
                    <h3 className="font-display text-xl text-noir mb-0.5">{name1} & {name2}</h3>
                    {weddingDate && (
                      <p className="text-sm text-smoke font-body capitalize">{weddingDate}</p>
                    )}
                    {couple.wedding_location && (
                      <p className="text-xs text-smoke/70 font-body mt-0.5">{couple.wedding_location}</p>
                    )}

                    {/* Checklist progress */}
                    {stats.total > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-smoke font-body mb-1">
                          <span>Checklist</span>
                          <span>{stats.done}/{stats.total} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="text-xs text-smoke/60 font-body text-center py-1">
                        Gerenciamento completo — em breve
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeLinks.length === 0 && pendingLinks.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" stroke="#7A8C6A" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="font-display text-xl text-noir mb-2">Nenhum casamento ainda</h3>
          <p className="text-sm text-smoke font-body max-w-sm mx-auto">
            Peça para suas noivas te vincularem pelo e-mail cadastrado aqui no Weddiners, em Configurações → Minha cerimonialista.
          </p>
        </div>
      )}
    </div>
  );
}
