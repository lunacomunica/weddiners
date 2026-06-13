"use client";

import { useState } from "react";
import { type Fornecedor, type Orcamento } from "./fornecedoresData";
import { createQuote, chooseQuote, deleteQuote } from "./actions";

type Props = {
  fornecedor: Fornecedor;
  onClose: () => void;
  onUpdate: (f: Fornecedor) => void;
};

export function OrcamentosModal({ fornecedor, onClose, onUpdate }: Props) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(fornecedor.orcamentos);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Orcamento>>({});

  async function handleEscolher(id: string, valor: number) {
    await chooseQuote(id, fornecedor.id, valor);
    setOrcamentos(prev => prev.map(o => ({ ...o, escolhido: o.id === id })));
  }

  async function handleRemove(id: string) {
    await deleteQuote(id);
    setOrcamentos(prev => prev.filter(o => o.id !== id));
  }

  async function handleAddOrcamento() {
    if (!form.titulo?.trim() || !form.valor) return;
    await createQuote(fornecedor.id, {
      title: form.titulo!,
      value: Number(form.valor),
      includes: form.inclui,
      validUntil: form.validade,
    });
    const novo: Orcamento = {
      id: Date.now().toString(),
      titulo: form.titulo!,
      valor: Number(form.valor),
      inclui: form.inclui ?? "",
      validade: form.validade ?? "",
      escolhido: false,
    };
    setOrcamentos(prev => [...prev, novo]);
    setForm({});
    setAdding(false);
  }

  function handleSave() {
    const escolhido = orcamentos.find(o => o.escolhido);
    onUpdate({
      ...fornecedor,
      orcamentos,
      status: escolhido ? "contratado" : fornecedor.status,
      valorContratado: escolhido ? escolhido.valor : fornecedor.valorContratado,
    });
  }

  const totalMin = orcamentos.length > 0 ? Math.min(...orcamentos.map(o => o.valor)) : 0;
  const totalMax = orcamentos.length > 0 ? Math.max(...orcamentos.map(o => o.valor)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">{fornecedor.nome}</h2>
              <p className="text-sm text-neutral-400">Comparar orçamentos</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {orcamentos.length > 1 && (
            <div className="flex gap-4 mt-3 text-xs text-neutral-500">
              <span>Menor valor: <strong className="text-green-600">R$ {totalMin.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              <span>Maior valor: <strong className="text-red-500">R$ {totalMax.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              <span>Diferença: <strong>R$ {(totalMax - totalMin).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Orçamentos */}
          {orcamentos.length === 0 && !adding && (
            <p className="text-center py-8 text-neutral-400 text-sm">Nenhum orçamento cadastrado ainda.</p>
          )}

          {orcamentos.map((o, _idx) => {
            const isCheapest = orcamentos.length > 1 && o.valor === totalMin;
            const isMostExpensive = orcamentos.length > 1 && o.valor === totalMax;

            return (
              <div
                key={o.id}
                className={["rounded-xl border p-4 transition-all", o.escolhido ? "border-sage bg-sage/5 ring-2 ring-sage/20" : "border-neutral-200"].join(" ")}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-neutral-800 text-sm">{o.titulo}</h4>
                      {o.escolhido && (
                        <span className="bg-sage text-white text-xs px-2 py-0.5 rounded-full font-medium">✓ Escolhido</span>
                      )}
                      {isCheapest && !o.escolhido && (
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">Menor preço</span>
                      )}
                      {isMostExpensive && orcamentos.length > 2 && (
                        <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full">Maior preço</span>
                      )}
                    </div>
                    <p className="text-2xl font-semibold text-neutral-800 font-display mt-1">
                      R$ {o.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!o.escolhido && (
                      <button
                        onClick={() => handleEscolher(o.id, o.valor)}
                        className="text-xs px-3 py-1.5 bg-sage text-white rounded-lg font-medium hover:bg-moss transition-colors"
                      >
                        Escolher
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(o.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {o.inclui && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-neutral-500 mb-1">Inclui:</p>
                    <p className="text-xs text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2">{o.inclui}</p>
                  </div>
                )}

                {o.validade && (
                  <p className="text-xs text-neutral-400 mt-2">
                    Válido até {new Date(o.validade + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}

                {/* Percentage bar relative to max */}
                {orcamentos.length > 1 && (
                  <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((o.valor / totalMax) * 100)}%`,
                        background: isCheapest ? "#3A7A4A" : "#7A8C6A",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Add orçamento form */}
          {adding ? (
            <div className="border border-dashed border-sage/40 rounded-xl p-4 space-y-3 bg-sage/5">
              <h4 className="text-sm font-semibold text-neutral-700">Novo orçamento</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Título / Pacote</label>
                  <input
                    value={form.titulo ?? ""}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                    placeholder="Ex: Pacote Completo"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={form.valor ?? ""}
                    onChange={e => setForm(f => ({ ...f, valor: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Validade do orçamento</label>
                  <input
                    type="date"
                    value={form.validade ?? ""}
                    onChange={e => setForm(f => ({ ...f, validade: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">O que inclui</label>
                  <textarea
                    rows={2}
                    value={form.inclui ?? ""}
                    onChange={e => setForm(f => ({ ...f, inclui: e.target.value }))}
                    placeholder="Descreva o que está incluído no orçamento..."
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddOrcamento} className="btn-primary">
                  Adicionar
                </button>
                <button onClick={() => { setAdding(false); setForm({}); }} className="text-neutral-500 hover:text-neutral-700 px-3 py-2 text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full border border-dashed border-neutral-300 rounded-xl py-3 text-sm text-neutral-400 hover:border-sage hover:text-sage transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Adicionar orçamento
            </button>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3 border-t border-neutral-100">
          <button onClick={handleSave} className="btn-primary w-full">
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
