"use client";

import { useState } from "react";
import { updateTotalBudget } from "./actions";

type Props = {
  totalBudget: number | null;
  committed: number;
};

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function BudgetWidget({ totalBudget: initialBudget, committed }: Props) {
  const [budget, setBudget] = useState<number | null>(initialBudget);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(initialBudget?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const remaining = budget != null ? budget - committed : null;
  const pct = budget != null && budget > 0 ? Math.min(100, Math.round((committed / budget) * 100)) : 0;
  const isOver = remaining != null && remaining < 0;

  // Cor da barra por percentual
  const barColor = pct >= 90 ? "#E05555" : pct >= 70 ? "#D4A020" : "#7A8C6A";

  async function handleSave() {
    const val = parseFloat(inputVal.replace(/\./g, "").replace(",", "."));
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    await updateTotalBudget(val);
    setBudget(val);
    setEditing(false);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
            Orçamento do casamento
          </h2>
          {editing ? (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-neutral-400 text-sm font-medium">R$</span>
              <input
                autoFocus
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                placeholder="Ex: 80000"
                className="w-40 border border-neutral-200 rounded-lg px-3 py-1.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary py-1.5 px-4"
              >
                {saving ? "..." : "Salvar"}
              </button>
              <button onClick={() => setEditing(false)} className="text-neutral-400 hover:text-neutral-600 text-sm">
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-semibold text-neutral-800 font-display">
                {budget != null ? `R$ ${fmt(budget)}` : "—"}
              </span>
              <button
                onClick={() => { setInputVal(budget?.toString() ?? ""); setEditing(true); }}
                className="text-xs text-neutral-400 hover:text-sage underline underline-offset-2 transition-colors"
              >
                {budget != null ? "alterar" : "definir orçamento"}
              </button>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div className="flex gap-4 flex-wrap">
          <div className="text-right">
            <p className="text-xs text-neutral-400 mb-0.5">Comprometido</p>
            <p className="text-lg font-semibold text-neutral-800 font-display">R$ {fmt(committed)}</p>
          </div>
          {remaining != null && (
            <div className="text-right">
              <p className="text-xs text-neutral-400 mb-0.5">{isOver ? "Excedido" : "Disponível"}</p>
              <p className={["text-lg font-semibold font-display", isOver ? "text-red-500" : "text-green-600"].join(" ")}>
                {isOver ? "- " : ""}R$ {fmt(Math.abs(remaining))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {budget != null && (
        <>
          <div className="h-3 bg-neutral-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>{pct}% utilizado</span>
            {isOver ? (
              <span className="text-red-500 font-medium">⚠️ Orçamento excedido em R$ {fmt(Math.abs(remaining!))}</span>
            ) : (
              <span>R$ {fmt(remaining!)} restantes</span>
            )}
          </div>

          {/* Category breakdown */}
          {committed > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs font-medium text-neutral-500 mb-2">Distribuição por categoria</p>
              <div className="flex flex-wrap gap-1.5">
                {/* Rendered by parent via props — placeholder hint */}
                <span className="text-xs text-neutral-400 italic">Valores dos fornecedores contratados</span>
              </div>
            </div>
          )}
        </>
      )}

      {budget == null && (
        <p className="text-sm text-neutral-400">
          Defina o orçamento total para acompanhar quanto já foi comprometido com fornecedores.
        </p>
      )}
    </div>
  );
}
