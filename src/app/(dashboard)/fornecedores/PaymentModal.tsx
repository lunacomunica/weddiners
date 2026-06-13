"use client";

import { useState } from "react";
import { FORMA_PAGAMENTO_LABELS, type FormaPagamento, type Fornecedor, type Parcela } from "./fornecedoresData";
import { setPaymentMethod, createInstallment, toggleInstallmentPaid, deleteInstallment } from "./actions";

type Props = {
  fornecedor: Fornecedor;
  onClose: () => void;
  onUpdate: (f: Fornecedor) => void;
};

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function PaymentModal({ fornecedor, onClose, onUpdate }: Props) {
  const [parcelas, setParcelas] = useState<Parcela[]>(fornecedor.parcelas ?? []);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | "">(fornecedor.formaPagamento ?? "");
  const [savingMethod, setSavingMethod] = useState(false);

  // Gerador rápido de parcelas
  const [gerador, setGerador] = useState({ total: fornecedor.valorContratado ?? 0, qtd: 1, primeiroVenc: "" });
  const [gerando, setGerando] = useState(false);

  const totalParcelas = parcelas.reduce((s, p) => s + p.valor, 0);
  const totalPago = parcelas.filter(p => p.pago).reduce((s, p) => s + p.valor, 0);
  const totalPendente = totalParcelas - totalPago;
  const pagas = parcelas.filter(p => p.pago).length;

  // Próximo vencimento pendente
  const proximoVenc = parcelas
    .filter(p => !p.pago)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];

  async function handleSaveMethod() {
    if (!formaPagamento) return;
    setSavingMethod(true);
    await setPaymentMethod(fornecedor.id, formaPagamento);
    setSavingMethod(false);
    onUpdate({ ...fornecedor, formaPagamento: formaPagamento as FormaPagamento, parcelas });
  }

  async function handleTogglePago(id: string, atual: boolean) {
    const next = !atual;
    setParcelas(prev => prev.map(p => p.id === id ? { ...p, pago: next, pagoEm: next ? new Date().toISOString().slice(0, 10) : undefined } : p));
    await toggleInstallmentPaid(id, next);
  }

  async function handleDelete(id: string) {
    setParcelas(prev => prev.filter(p => p.id !== id));
    await deleteInstallment(id);
  }

  async function handleGerarParcelas() {
    if (!gerador.primeiroVenc || gerador.qtd < 1 || gerador.total <= 0) return;
    setGerando(true);
    const valorParcela = parseFloat((gerador.total / gerador.qtd).toFixed(2));
    const novas: Parcela[] = [];

    for (let i = 0; i < gerador.qtd; i++) {
      const venc = addMonths(gerador.primeiroVenc, i);
      const result = await createInstallment(fornecedor.id, {
        numero: parcelas.length + i + 1,
        valor: valorParcela,
        vencimento: venc,
      });
      novas.push({
        id: result?.id ?? Date.now().toString() + i,
        numero: parcelas.length + i + 1,
        valor: valorParcela,
        vencimento: venc,
        pago: false,
      });
    }

    setParcelas(prev => [...prev, ...novas]);
    setGerador(g => ({ ...g, qtd: 1, primeiroVenc: "" }));
    setGerando(false);
  }

  function handleSave() {
    onUpdate({ ...fornecedor, formaPagamento: formaPagamento as FormaPagamento, parcelas });
    onClose();
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR");

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">{fornecedor.nome}</h2>
              <p className="text-sm text-neutral-400">Gestão de pagamentos</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Resumo financeiro */}
          {parcelas.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-neutral-50 rounded-xl px-3 py-2.5 text-center">
                <p className="text-xs text-neutral-400 mb-0.5">Total</p>
                <p className="text-sm font-semibold text-neutral-800">R$ {fmt(totalParcelas)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
                <p className="text-xs text-emerald-500 mb-0.5">Pago ✓</p>
                <p className="text-sm font-semibold text-emerald-700">R$ {fmt(totalPago)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl px-3 py-2.5 text-center">
                <p className="text-xs text-amber-500 mb-0.5">Pendente</p>
                <p className="text-sm font-semibold text-amber-700">R$ {fmt(totalPendente)}</p>
              </div>
            </div>
          )}
          {proximoVenc && (
            <p className="text-xs text-neutral-500 mt-2">
              📅 Próximo vencimento: <strong className={proximoVenc.vencimento < hoje ? "text-red-500" : "text-neutral-700"}>{fmtDate(proximoVenc.vencimento)}</strong>
              {proximoVenc.vencimento < hoje && " — vencido!"}
            </p>
          )}
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Forma de pagamento</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(FORMA_PAGAMENTO_LABELS) as [FormaPagamento, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFormaPagamento(key)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    formaPagamento === key
                      ? "bg-moss text-white border-moss"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
            {formaPagamento && formaPagamento !== fornecedor.formaPagamento && (
              <button
                onClick={handleSaveMethod}
                disabled={savingMethod}
                className="mt-2 text-xs text-sage hover:text-moss font-medium"
              >
                {savingMethod ? "Salvando..." : "Salvar forma de pagamento"}
              </button>
            )}
          </div>

          {/* Gerador de parcelas */}
          <div className="border border-dashed border-sage/40 rounded-xl p-4 bg-sage/5">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">Gerar parcelas automaticamente</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Valor total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={gerador.total || ""}
                  onChange={e => setGerador(g => ({ ...g, total: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Nº de parcelas</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={gerador.qtd}
                  onChange={e => setGerador(g => ({ ...g, qtd: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">1º vencimento</label>
                <input
                  type="date"
                  value={gerador.primeiroVenc}
                  onChange={e => setGerador(g => ({ ...g, primeiroVenc: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
              </div>
            </div>
            {gerador.total > 0 && gerador.qtd > 0 && (
              <p className="text-xs text-neutral-500 mt-2">
                {gerador.qtd}× de <strong>R$ {fmt(parseFloat((gerador.total / gerador.qtd).toFixed(2)))}</strong>
              </p>
            )}
            <button
              onClick={handleGerarParcelas}
              disabled={gerando || !gerador.primeiroVenc || gerador.total <= 0}
              className="btn-primary mt-3 disabled:opacity-50"
            >
              {gerando ? "Gerando..." : "Gerar parcelas"}
            </button>
          </div>

          {/* Lista de parcelas */}
          {parcelas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-neutral-700">
                  Parcelas — {pagas}/{parcelas.length} pagas
                </h4>
              </div>
              <div className="space-y-2">
                {parcelas
                  .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
                  .map(p => {
                    const vencido = !p.pago && p.vencimento < hoje;
                    return (
                      <div
                        key={p.id}
                        className={[
                          "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all",
                          p.pago
                            ? "bg-emerald-50 border-emerald-100"
                            : vencido
                              ? "bg-red-50 border-red-100"
                              : "bg-white border-neutral-200",
                        ].join(" ")}
                      >
                        {/* Checkbox de pago */}
                        <button
                          onClick={() => handleTogglePago(p.id, p.pago)}
                          className={[
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            p.pago ? "bg-emerald-500 border-emerald-500" : "border-neutral-300 hover:border-emerald-400",
                          ].join(" ")}
                        >
                          {p.pago && (
                            <svg width="10" height="10" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">Parcela {p.numero}</span>
                            {vencido && <span className="text-xs text-red-500 font-medium">Vencida</span>}
                            {p.pago && p.pagoEm && (
                              <span className="text-xs text-emerald-500">pago em {fmtDate(p.pagoEm)}</span>
                            )}
                          </div>
                          <p className={["text-sm font-semibold", p.pago ? "text-emerald-700 line-through" : vencido ? "text-red-600" : "text-neutral-800"].join(" ")}>
                            R$ {fmt(p.valor)}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={["text-xs font-medium", vencido ? "text-red-500" : "text-neutral-500"].join(" ")}>
                            {fmtDate(p.vencimento)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-neutral-300 hover:text-red-400 transition-colors shrink-0"
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {parcelas.length === 0 && (
            <p className="text-center py-4 text-neutral-400 text-sm">Nenhuma parcela cadastrada. Use o gerador acima para criar.</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3 border-t border-neutral-100">
          <button onClick={handleSave} className="btn-primary w-full">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
