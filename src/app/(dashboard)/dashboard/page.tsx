import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { fmtNum } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!couple) redirect("/login");

  const hoje = new Date().toISOString().slice(0, 10);
  const em30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    { data: gifts },
    { data: guests },
    { data: checklist },
    { data: vendors },
    { data: payments },
  ] = await Promise.all([
    supabase.from("gifts").select("amount, is_received").eq("couple_id", couple.id),
    supabase.from("guests").select("rsvp_status").eq("couple_id", couple.id),
    supabase.from("checklist_items").select("done").eq("couple_id", couple.id),
    supabase.from("vendors").select("contracted_value").eq("couple_id", couple.id).eq("status", "contratado"),
    supabase.from("vendor_payments").select("id, amount, due_date, paid, vendor_id").eq("couple_id", couple.id).order("due_date"),
  ]);

  // Countdown
  let daysLeft: number | null = null;
  if (couple.wedding_date) {
    const today = new Date(); today.setHours(0,0,0,0);
    const wedding = new Date(couple.wedding_date + "T00:00:00");
    daysLeft = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Gifts
  const giftsRecebidos = gifts?.filter(g => g.is_received).length ?? 0;
  const giftsValor = gifts?.filter(g => g.is_received).reduce((s, g) => s + Number(g.amount), 0) ?? 0;

  // Guests
  const totalGuests = guests?.length ?? 0;
  const confirmedGuests = guests?.filter(g => g.rsvp_status === "confirmed").length ?? 0;
  const pendingGuests = guests?.filter(g => g.rsvp_status === "pending").length ?? 0;
  const declinedGuests = guests?.filter(g => g.rsvp_status === "declined").length ?? 0;

  // Checklist
  const totalTasks = checklist?.length ?? 0;
  const doneTasks = checklist?.filter(c => c.done).length ?? 0;
  const checklistPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Budget
  const totalContratado = vendors?.reduce((s, v) => s + Number(v.contracted_value ?? 0), 0) ?? 0;
  const totalBudget = couple.total_budget ? Number(couple.total_budget) : null;
  const totalPago = payments?.filter(p => p.paid).reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const budgetPct = totalBudget && totalBudget > 0 ? Math.min(100, Math.round((totalContratado / totalBudget) * 100)) : 0;

  // Próximos pagamentos (30 dias)
  const proximosPagamentos = (payments ?? [])
    .filter(p => !p.paid && p.due_date >= hoje && p.due_date <= em30dias)
    .slice(0, 4);
  const totalProximos = proximosPagamentos.reduce((s, p) => s + Number(p.amount), 0);
  const vencidos = (payments ?? []).filter(p => !p.paid && p.due_date < hoje);

  const fmt = fmtNum;
  const fmtDate = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const nomeCasal = couple.partner1_name && couple.partner2_name
    ? `${couple.partner1_name} & ${couple.partner2_name}`
    : couple.bride_name ?? "Noiva";

  return (
    <>
      <Header title={`Olá, ${couple.bride_name ?? "Noiva"} 👋`} subtitle="Aqui está o resumo do seu casamento" />
      <div className="p-4 md:p-8 max-w-6xl">

        {/* ── Linha 1: Countdown grande + Site ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

          {/* Countdown */}
          <div className="sm:col-span-2 relative overflow-hidden rounded-2xl sidebar-texture p-8 flex flex-col justify-between min-h-[180px]">
            <div>
              <p className="text-white/50 text-xs font-body uppercase tracking-widest mb-1">Contagem regressiva</p>
              {daysLeft !== null ? (
                <>
                  <div className="flex items-end gap-3">
                    <p className="font-display text-8xl text-white leading-none">{daysLeft}</p>
                    <p className="text-white/70 font-body text-lg mb-2">dias</p>
                  </div>
                  <p className="text-white/60 font-body text-sm mt-2">
                    {couple.wedding_date ? new Date(couple.wedding_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
                    {couple.wedding_location ? ` · ${couple.wedding_location}` : ""}
                  </p>
                </>
              ) : (
                <div className="mt-2">
                  <p className="text-white/70 font-body text-sm mb-3">Configure a data do casamento</p>
                  <Link href="/configuracoes" className="text-xs text-gold-light underline font-body">Ir para configurações →</Link>
                </div>
              )}
            </div>
            {/* decoração */}
            <div className="absolute right-6 top-6 opacity-10 text-white font-display text-[120px] leading-none select-none">♥</div>
          </div>

          {/* Site público */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-body mb-2">Meu site</p>
              <p className="font-display text-lg text-neutral-800 leading-snug break-all">{couple.slug}.weddiners.com.br</p>
              <p className="text-xs text-neutral-400 font-body mt-1">{nomeCasal}</p>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Link href={`/${couple.slug}`} target="_blank" className="btn-primary text-center text-xs py-2">Ver site →</Link>
              <Link href="/site" className="text-center text-xs text-neutral-400 hover:text-neutral-600 font-body transition-colors">Editar aparência</Link>
            </div>
          </div>
        </div>

        {/* ── Linha 2: Convidados + Presentes + Checklist ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

          {/* Convidados */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-body">Convidados</p>
              <Link href="/convidados" className="text-xs text-sage hover:text-moss font-medium">Ver todos →</Link>
            </div>
            <p className="font-display text-5xl text-neutral-800 leading-none mb-4">{totalGuests}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-body">
                <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Confirmados</span>
                <span className="font-semibold">{confirmedGuests}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-body">
                <span className="flex items-center gap-1.5 text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Pendentes</span>
                <span className="font-semibold">{pendingGuests}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-body">
                <span className="flex items-center gap-1.5 text-neutral-400"><span className="w-2 h-2 rounded-full bg-neutral-300 inline-block"/>Recusaram</span>
                <span className="font-semibold">{declinedGuests}</span>
              </div>
            </div>
            {totalGuests > 0 && (
              <div className="mt-4 h-1.5 bg-neutral-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(confirmedGuests/totalGuests)*100}%` }}/>
                <div className="h-full bg-amber-400 transition-all" style={{ width: `${(pendingGuests/totalGuests)*100}%` }}/>
              </div>
            )}
          </div>

          {/* Presentes */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-body">Presentes</p>
              <Link href="/presentes" className="text-xs text-sage hover:text-moss font-medium">Ver lista →</Link>
            </div>
            <p className="font-display text-5xl text-neutral-800 leading-none">{giftsRecebidos}</p>
            <p className="text-xs text-neutral-400 font-body mt-1 mb-4">presentes recebidos</p>
            <div className="bg-sage/10 rounded-xl px-4 py-3">
              <p className="text-xs text-neutral-500 font-body">Total arrecadado</p>
              <p className="font-display text-xl text-moss font-semibold mt-0.5">R$ {fmt(giftsValor)}</p>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-body">Planejamento</p>
              <Link href="/planejamento" className="text-xs text-sage hover:text-moss font-medium">Ver tudo →</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              {/* Círculo de progresso */}
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0F0EC" strokeWidth="3"/>
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#7A8C6A" strokeWidth="3"
                    strokeDasharray={`${checklistPct} ${100 - checklistPct}`}
                    strokeLinecap="round"
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-lg text-neutral-800">{checklistPct}%</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-neutral-800 text-2xl font-display">{doneTasks}<span className="text-neutral-300 font-body text-base">/{totalTasks}</span></p>
                <p className="text-xs text-neutral-400 font-body mt-0.5">tarefas concluídas</p>
                {totalTasks === 0 && <Link href="/planejamento" className="text-xs text-sage hover:underline font-body mt-1 block">Criar checklist →</Link>}
              </div>
            </div>
            {totalTasks > 0 && (
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${checklistPct}%` }}/>
              </div>
            )}
          </div>
        </div>

        {/* ── Linha 3: Orçamento + Próximos pagamentos ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Orçamento */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-body">Orçamento</p>
              <Link href="/pagamentos" className="text-xs text-sage hover:text-moss font-medium">Gestão →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-neutral-400 font-body">Total previsto</p>
                <p className="font-display text-xl text-neutral-800">{totalBudget ? `R$ ${fmt(totalBudget)}` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-body">Comprometido</p>
                <p className="font-display text-xl text-neutral-800">R$ {fmt(totalContratado)}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-500 font-body">Pago</p>
                <p className="font-display text-xl text-emerald-700">R$ {fmt(totalPago)}</p>
              </div>
              <div>
                <p className="text-xs text-amber-500 font-body">Pendente</p>
                <p className="font-display text-xl text-amber-700">R$ {fmt(totalContratado - totalPago)}</p>
              </div>
            </div>
            {totalBudget && totalBudget > 0 && (
              <>
                <div className="flex justify-between text-xs text-neutral-400 font-body mb-1">
                  <span>Comprometido do orçamento</span>
                  <span>{budgetPct}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? "#EF4444" : "#7A8C6A" }}/>
                </div>
              </>
            )}
            {!totalBudget && (
              <Link href="/pagamentos" className="text-xs text-neutral-400 hover:text-sage font-body">Definir orçamento total →</Link>
            )}
          </div>

          {/* Próximos pagamentos */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-body">Próximos pagamentos</p>
              <Link href="/pagamentos" className="text-xs text-sage hover:text-moss font-medium">Ver todos →</Link>
            </div>

            {vencidos.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                <p className="text-xs text-red-600 font-medium">⚠️ {vencidos.length} parcela{vencidos.length > 1 ? "s" : ""} vencida{vencidos.length > 1 ? "s" : ""}</p>
                <p className="text-xs text-red-500 font-semibold">R$ {fmt(vencidos.reduce((s,p) => s + Number(p.amount), 0))}</p>
              </div>
            )}

            {proximosPagamentos.length === 0 && vencidos.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-neutral-300 text-3xl mb-2">✓</p>
                <p className="text-sm text-neutral-400 font-body">Nenhum pagamento nos próximos 30 dias</p>
              </div>
            ) : proximosPagamentos.length === 0 ? null : (
              <>
                <div className="space-y-2 mb-3">
                  {proximosPagamentos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                      <div>
                        <p className="text-xs text-neutral-400 font-body">{fmtDate(p.due_date)}</p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">R$ {fmt(Number(p.amount))}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <p className="text-xs text-amber-600 font-body">Total nos próximos 30 dias</p>
                  <p className="text-sm font-semibold text-amber-700">R$ {fmt(totalProximos)}</p>
                </div>
              </>
            )}

            {payments?.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-400 font-body">Nenhum pagamento cadastrado</p>
                <Link href="/fornecedores" className="text-xs text-sage hover:underline font-body mt-1 block">Ir para fornecedores →</Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
