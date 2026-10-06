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

interface ChecklistStats { total: number; done: number; }

export default async function CerimonialistaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("display_name").eq("id", user.id).single();

  const { data: links } = await supabase
    .from("couple_cerimonialistas")
    .select(`id, status, invited_at, accepted_at,
      couples(id, partner1_name, partner2_name, bride_name, groom_name,
        wedding_date, wedding_location, avatar_url)`)
    .eq("cerimonialista_id", user.id)
    .order("invited_at", { ascending: false });

  const firstName = (profile?.display_name || user.email?.split("@")[0] || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const activeLinks = links?.filter(l => l.status === "active") ?? [];
  const pendingLinks = links?.filter(l => l.status === "pending") ?? [];

  const statsMap: Record<string, ChecklistStats> = {};
  if (activeLinks.length > 0) {
    const coupleIds = activeLinks.map(l => (l.couples as unknown as CoupleData)?.id).filter(Boolean);
    const { data: items } = await supabase
      .from("checklist_items").select("couple_id, done").in("couple_id", coupleIds);
    coupleIds.forEach(id => {
      const ci = items?.filter(i => i.couple_id === id) ?? [];
      statsMap[id] = { total: ci.length, done: ci.filter(i => i.done).length };
    });
  }

  // Stats globais para o header
  const totalCasamentos = activeLinks.length;
  const proximoCasamento = activeLinks
    .map(l => (l.couples as unknown as CoupleData)?.wedding_date)
    .filter(Boolean)
    .map(d => new Date(d! + "T12:00:00"))
    .filter(d => d > new Date())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <div className="min-h-screen bg-ivory">

      {/* Hero header */}
      <div className="sidebar-texture px-6 md:px-10 pt-10 pb-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-xs font-body uppercase tracking-widest mb-1">Painel da cerimonialista</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-6">
            {greeting}, {firstName}! 🌸
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[120px]">
              <p className="text-white/50 text-xs font-body mb-1">Casamentos</p>
              <p className="font-display text-3xl text-white leading-none">{totalCasamentos}</p>
            </div>
            {pendingLinks.length > 0 && (
              <div className="bg-amber-400/20 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[120px]">
                <p className="text-amber-200/80 text-xs font-body mb-1">Convites</p>
                <p className="font-display text-3xl text-amber-200 leading-none">{pendingLinks.length}</p>
              </div>
            )}
            {proximoCasamento && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
                <p className="text-white/50 text-xs font-body mb-1">Próximo casamento</p>
                <p className="text-white font-body text-sm font-medium capitalize">
                  {proximoCasamento.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4 pb-12">

        {/* Convites pendentes */}
        {pendingLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="font-body font-semibold text-xs text-neutral-400 uppercase tracking-widest mb-3 mt-6">
              Convites pendentes
            </h2>
            <div className="space-y-3">
              {pendingLinks.map(link => {
                const couple = link.couples as unknown as CoupleData;
                if (!couple) return null;
                const name1 = couple.partner1_name || couple.bride_name || "?";
                const name2 = couple.partner2_name || couple.groom_name || "?";
                const wDate = couple.wedding_date
                  ? new Date(couple.wedding_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
                  : null;
                return (
                  <div key={link.id} className="bg-white border border-amber-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-lg">💌</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">Convite pendente</span>
                      </div>
                      <p className="font-display text-xl text-noir">{name1} & {name2}</p>
                      {wDate && <p className="text-xs text-smoke font-body capitalize">{wDate}{couple.wedding_location ? ` · ${couple.wedding_location}` : ""}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form action={async () => { "use server"; await declineInvite(link.id); }}>
                        <button type="submit" className="border border-neutral-200 rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors font-body">
                          Recusar
                        </button>
                      </form>
                      <form action={async () => { "use server"; await acceptInvite(link.id); }}>
                        <button type="submit" className="btn-primary px-6 py-2 text-sm rounded-xl">
                          Aceitar ✓
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
            <h2 className="font-body font-semibold text-xs text-neutral-400 uppercase tracking-widest mb-3 mt-6">
              Meus casamentos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLinks.map(link => {
                const couple = link.couples as unknown as CoupleData;
                if (!couple) return null;
                const name1 = couple.partner1_name || couple.bride_name || "?";
                const name2 = couple.partner2_name || couple.groom_name || "?";
                const initials = `${name1[0]}${name2[0]}`.toUpperCase();
                const wDate = couple.wedding_date
                  ? new Date(couple.wedding_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
                  : null;
                const daysLeft = couple.wedding_date
                  ? Math.ceil((new Date(couple.wedding_date + "T12:00:00").getTime() - Date.now()) / 86400000)
                  : null;
                const stats = statsMap[couple.id] ?? { total: 0, done: 0 };
                const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                const circumference = 2 * Math.PI * 20;
                const dashOffset = circumference - (pct / 100) * circumference;

                return (
                  <div key={link.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-neutral-100/80">

                    {/* Topo escuro estilo dashboard */}
                    <div className="sidebar-texture px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full ring-2 ring-white/30 overflow-hidden shrink-0">
                          {couple.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={couple.avatar_url} alt={name1} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-sage/40 flex items-center justify-center">
                              <span className="font-display text-lg text-white">{initials}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-display text-xl text-white leading-tight">{name1} & {name2}</p>
                          {couple.wedding_location && (
                            <p className="text-white/50 text-xs font-body">{couple.wedding_location}</p>
                          )}
                        </div>
                      </div>

                      {/* Contagem regressiva */}
                      {daysLeft !== null && daysLeft > 0 && (
                        <div className="text-right shrink-0">
                          <p className="font-display text-3xl text-white leading-none">{daysLeft}</p>
                          <p className="text-white/50 text-xs font-body">dias</p>
                        </div>
                      )}
                      {daysLeft === 0 && <p className="text-gold text-sm font-medium">Hoje! 🎊</p>}
                      {daysLeft !== null && daysLeft < 0 && <p className="text-white/40 text-xs font-body">Realizado</p>}
                    </div>

                    {/* Corpo */}
                    <div className="p-5">
                      {wDate && (
                        <p className="text-xs text-smoke font-body capitalize mb-4">{wDate}</p>
                      )}

                      {/* Checklist com SVG circular */}
                      {stats.total > 0 ? (
                        <div className="flex items-center gap-4 mb-5">
                          <div className="relative w-14 h-14 shrink-0">
                            <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                              <circle cx="28" cy="28" r="20" fill="none" stroke="#f0f0f0" strokeWidth="4"/>
                              <circle cx="28" cy="28" r="20" fill="none" stroke="#7A8C6A" strokeWidth="4"
                                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                                strokeLinecap="round" className="transition-all"/>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-body text-xs font-semibold text-noir">{pct}%</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-noir font-body">{stats.done} de {stats.total}</p>
                            <p className="text-xs text-smoke font-body">tarefas concluídas</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-5">
                          <p className="text-xs text-smoke/60 font-body">Checklist não iniciado</p>
                        </div>
                      )}

                      <a
                        href={`/gerenciar/${couple.id}`}
                        className="flex items-center justify-center gap-2 w-full btn-primary py-3 text-sm rounded-xl group-hover:opacity-90 transition-opacity"
                      >
                        Gerenciar casamento
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
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
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-3xl">🌸</span>
            </div>
            <h3 className="font-display text-2xl text-noir mb-2">Tudo pronto!</h3>
            <p className="text-sm text-smoke font-body max-w-sm mx-auto leading-relaxed">
              Peça para suas noivas te vincularem pelo e-mail <strong>{user.email}</strong> em Configurações → Minha cerimonialista.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
