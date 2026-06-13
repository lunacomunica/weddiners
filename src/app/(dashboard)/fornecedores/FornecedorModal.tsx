"use client";

import { useState } from "react";
import { CATEGORIAS_FORNECEDOR, STATUS_CONFIG, type Fornecedor, type StatusFornecedor } from "./fornecedoresData";

type Props = {
  fornecedor?: Fornecedor;
  onSave: (f: Fornecedor) => void;
  onClose: () => void;
};

export function FornecedorModal({ fornecedor, onSave, onClose }: Props) {
  const isEditing = !!fornecedor;
  const [form, setForm] = useState<Partial<Fornecedor>>(fornecedor ?? { orcamentos: [], status: "avaliando" });

  function set(field: keyof Fornecedor, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome?.trim() || !form.categoria) return;
    onSave({
      id: fornecedor?.id ?? Date.now().toString(),
      nome: form.nome!,
      categoria: form.categoria!,
      status: (form.status as StatusFornecedor) ?? "avaliando",
      contato: form.contato ?? "",
      telefone: form.telefone ?? "",
      site: form.site,
      notas: form.notas,
      valorContratado: form.valorContratado,
      contratoUrl: form.contratoUrl,
      orcamentos: fornecedor?.orcamentos ?? [],
      formaPagamento: fornecedor?.formaPagamento,
      parcelas: fornecedor?.parcelas ?? [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">{isEditing ? "Editar fornecedor" : "Novo fornecedor"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nome do fornecedor *</label>
              <input
                required
                value={form.nome ?? ""}
                onChange={e => set("nome", e.target.value)}
                placeholder="Ex: Buffet Sabor & Arte"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Categoria *</label>
              <select
                required
                value={form.categoria ?? ""}
                onChange={e => set("categoria", e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              >
                <option value="">Selecionar...</option>
                {CATEGORIAS_FORNECEDOR.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
              <select
                value={form.status ?? "avaliando"}
                onChange={e => set("status", e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nome do contato</label>
              <input
                value={form.contato ?? ""}
                onChange={e => set("contato", e.target.value)}
                placeholder="Ex: Ana Lima"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Telefone / WhatsApp</label>
              <input
                value={form.telefone ?? ""}
                onChange={e => set("telefone", e.target.value)}
                placeholder="(41) 99999-9999"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Site / Instagram</label>
              <input
                value={form.site ?? ""}
                onChange={e => set("site", e.target.value)}
                placeholder="www.exemplo.com.br ou @perfil"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            {(form.status === "contratado") && (
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Valor contratado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorContratado ?? ""}
                  onChange={e => set("valorContratado", parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                  placeholder="0,00"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Observações</label>
              <textarea
                rows={3}
                value={form.notas ?? ""}
                onChange={e => set("notas", e.target.value)}
                placeholder="Anotações importantes, detalhes do contrato..."
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage resize-none"
              />
            </div>

            {/* Contract upload placeholder */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Contrato</label>
              <div className="border-2 border-dashed border-neutral-200 rounded-lg px-4 py-6 text-center hover:border-sage/40 transition-colors cursor-pointer">
                <svg className="mx-auto mb-2 text-neutral-300" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-neutral-400">Clique para fazer upload do PDF</p>
                <p className="text-xs text-neutral-300 mt-0.5">Em breve disponível</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-neutral-200 rounded-lg py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {isEditing ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
