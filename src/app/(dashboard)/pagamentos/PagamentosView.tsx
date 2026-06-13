"use client";

import { useState } from "react";
import { CATEGORIAS_FORNECEDOR } from "../fornecedores/fornecedoresData";
import { togglePagamento, saveTotalBudget } from "./actions";

type Pagamento = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  numero: number;
  valor: number;
  vencimento: string;
  pago: boolean;
  pagoEm?: string;
};

type Props = {
  pagamentos: Pagamento[];
  totalBudget: number | null;
  totalContratado: number;
  totalPago: number;
  totalPendente: number;
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function PagamentosView({ pagamentos: initial, totalBudget, totalContratado, totalPago: initPago, totalPendente: initPendente }: Props) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(initial);
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "pendente" | "pago" | "vencido">("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget ?? 0);
  const [budget, setBudget] = useState(totalBudget);

  const hoje = new Date().toISOString().slice(0, 10);
  const totalPago = pagamentos.filter(p => p.pago).reduce((s, p) => s + p.valor, 0);
  const totalPendente = pagamentos.filter(p => !p.pago).reduce((s, p) => s + p.valor, 0);
  const totalVencido = pagamentos.filter(p => !p.pago && p.vencimento < hoje).reduce((s, p) => s + p.valor, 0);

  // Meses disponíveis
  const mesesDisponiveis = Array.from(new Set(pagamentos.map(p => p.vencimento.slice(0, 7)))).sort();

  const filtered = pagamentos.filter(p => {
    const byMes = filtroMes === "todos" || p.vencimento.startsWith(filtroMes);
    const vencido = !p.pago && p.vencimento < hoje;
    const byStatus =
      filtroStatus === "todos" ? true :
      filtroStatus === "pago" ? p.pago :
      filtroStatus === "vencido" ? vencido :
      filtroStatus === "pendente" ? (!p.pago && !vencido) : true;
    return byMes && byStatus;
  });

  // Agrupar por mês
  const grouped = filtered.reduce<Record<string, Pagamento[]>>((acc, p) => {
    const mes = p.vencimento.slice(0, 7);
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(p);
    return acc;
  }, {});

  async function handleToggle(id: string, atual: boolean) {
    const next = !atual;
    setPagamentos(prev => prev.map(p => p.id === id
      ? { ...p, pago: next, pagoEm: next ? hoje : undefined }
      : p
    ));
    await togglePagamento(id, next);
  }

  async function handleSaveBudget() {
    await saveTotalBudget(budgetInput);
    setBudget(budgetInput);
    setEditBudget(false);
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR");
  const fmtMes = (ym: string) => {
    const [y, m] = ym.split("-");
    return `${MESES[parseInt(m) - 1]} ${y}`;
  };

  const pct = totalContratado > 0 ? Math.min(100, (totalPago / totalContratado) * 100) : 0;
  const budgetPct = budget && budget > 0 ? Math.min(100, (totalContratado / budget) * 100) : 0;

  return (
    <div className="max-w-4xl space-y-6">

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orçamento total */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 col-span-2 lg:col-span-1">
          <p className="text-xs text-neutral-400 mb-1">Orçamento total</p>
          {editBudget ? (
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                step="0.01"
                value={budgetInput || ""}
                onChange={e => setBudgetInput(parseFloat(e.target.value) || 0)}
                className="border border-neutral-200 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sage/30"
                autoFocus
              />
              <button onClick={handleSaveBudget} className="text-xs text-sage font-medium whitespace-nowrap hover:text-moss">Salvar</button>
              <button onClick={() => setEditBudget(false)} className="text-xs text-neutral-400 hover:text-neutral-600">✕</button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <p className="text-xl font-semibold text-neutral-800 font-display">
                {budget ? `R$ ${fmt(budget)}` : "—"}
              </p>
              <button onClick={() => { setEditBudget(true); setBudgetInput(budget ?? 0); }} className="text-neutral-300 hover:text-neutral-500 mb-0.5">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          {budget && budget > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Comprometido</span>
                <span>{budgetPct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? "#EF4444" : "#7A8C6A" }} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs text-neutral-400 mb-1">Comprometido</p>
          <p className="text-xl font-semibold text-neutral-800 font-display">R$ {fmt(totalContratado)}</p>
          <p className="text-xs text-neutral-400 mt-1">{pagamentos.length} parcelas</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
          <p className="text-xs text-emerald-500 mb-1">Pago ✓</p>
          <p className="text-xl font-semibold text-emerald-700 font-display">R$ {fmt(totalPago)}</p>
          <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className={["rounded-2xl border p-5", totalVencido > 0 ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"].join(" ")}>
          <p className={["text-xs mb-1", totalVencido > 0 ? "text-red-500" : "text-amber-500"].join(" ")}>
            {totalVencido > 0 ? "⚠️ Pendente / Vencido" : "Pendente"}
          </p>
          <p className={["text-xl font-semibold font-display", totalVencido > 0 ? "text-red-700" : "text-amber-700"].join(" ")}>
            R$ {fmt(totalPendente)}
          </p>
          {totalVencido > 0 && (
            <p className="text-xs text-red-400 mt-1">R$ {fmt(totalVencido)} vencido</p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1">
          {(["todos", "pendente", "vencido", "pago"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={["px-3 py-1 rounded-md text-xs font-medium transition-all", filtroStatus === s ? "bg-moss text-white" : "text-neutral-500 hover:text-neutral-700"].join(" ")}
            >
              {s === "todos" ? "Todos" : s === "pendente" ? "Pendentes" : s === "vencido" ? "Vencidos" : "Pagos"}
            </button>
          ))}
        </div>

        <select
          value={filtroMes}
          onChange={e => setFiltroMes(e.target.value)}
          className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-sage/30 bg-white"
        >
          <option value="todos">Todos os meses</option>
          {mesesDisponiveis.map(m => (
            <option key={m} value={m}>{fmtMes(m)}</option>
          ))}
        </select>
      </div>

      {/* Lista agrupada por mês */}
      {pagamentos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
          <p className="text-neutral-400 font-body">Nenhum pagamento cadastrado ainda.</p>
          <p className="text-sm text-neutral-300 mt-1">Adicione fornecedores contratados e configure os pagamentos em <strong>Fornecedores → Pagamentos</strong>.</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
          <p className="text-neutral-400 font-body text-sm">Nenhum pagamento encontrado para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([mes, items]) => {
            const mesTotal = items.reduce((s, p) => s + p.valor, 0);
            const mesPago = items.filter(p => p.pago).reduce((s, p) => s + p.valor, 0);
            const temVencido = items.some(p => !p.pago && p.vencimento < hoje);
            return (
              <div key={mes}>
                {/* Cabeçalho do mês */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-neutral-700 font-display text-lg">{fmtMes(mes)}</h3>
                    {temVencido && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">⚠️ Vencido</span>}
                  </div>
                  <div className="text-right text-xs text-neutral-400">
                    <span className="text-emerald-600 font-medium">R$ {fmt(mesPago)}</span>
                    <span> / R$ {fmt(mesTotal)}</span>
                  </div>
                </div>

                {/* Parcelas do mês */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  {items.sort((a, b) => a.vencimento.localeCompare(b.vencimento)).map((p, i) => {
                    const vencido = !p.pago && p.vencimento < hoje;
                    const cat = CATEGORIAS_FORNECEDOR.find(c => c.id === p.vendorCategory);
                    return (
                      <div
                        key={p.id}
                        className={[
                          "flex items-center gap-4 px-5 py-4 transition-colors",
                          i < items.length - 1 ? "border-b border-neutral-100" : "",
                          p.pago ? "bg-emerald-50/40" : vencido ? "bg-red-50/40" : "hover:bg-neutral-50/60",
                        ].join(" ")}
                      >
                        {/* Toggle pago */}
                        <button
                          onClick={() => handleToggle(p.id, p.pago)}
                          className={[
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            p.pago ? "bg-emerald-500 border-emerald-500" : vencido ? "border-red-300 hover:border-red-400" : "border-neutral-300 hover:border-emerald-400",
                          ].join(" ")}
                        >
                          {p.pago && (
                            <svg width="11" height="11" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>

                        {/* Categoria dot */}
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat?.color ?? "#ccc" }} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={["text-sm font-medium truncate", p.pago ? "text-neutral-400 line-through" : "text-neutral-800"].join(" ")}>
                            {p.vendorName}
                          </p>
                          <p className="text-xs text-neutral-400">
                            Parcela {p.numero}
                            {p.pago && p.pagoEm ? ` · pago em ${fmtDate(p.pagoEm)}` : ""}
                          </p>
                        </div>

                        {/* Valor */}
                        <div className="text-right shrink-0">
                          <p className={["text-sm font-semibold", p.pago ? "text-emerald-600" : vencido ? "text-red-600" : "text-neutral-800"].join(" ")}>
                            R$ {fmt(p.valor)}
                          </p>
                          <p className={["text-xs", vencido ? "text-red-400 font-medium" : "text-neutral-400"].join(" ")}>
                            {vencido ? "Venceu " : ""}{fmtDate(p.vencimento)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
