"use client";

import { useState } from "react";
import {
  CATEGORIAS_FORNECEDOR, STATUS_CONFIG,
  type Fornecedor, type StatusFornecedor,
} from "./fornecedoresData";
import { FornecedorModal } from "./FornecedorModal";
import { OrcamentosModal } from "./OrcamentosModal";
import { createVendor, updateVendor, deleteVendor } from "./actions";

type FilterStatus = "todos" | StatusFornecedor;

export function FornecedoresView({ initialFornecedores }: { initialFornecedores: Fornecedor[] }) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialFornecedores);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todos");
  const [filterCat, setFilterCat] = useState<string>("todos");
  const [modalFornecedor, setModalFornecedor] = useState<{ open: boolean; fornecedor?: Fornecedor }>({ open: false });
  const [modalOrcamentos, setModalOrcamentos] = useState<{ open: boolean; fornecedor?: Fornecedor }>({ open: false });

  const totalContratado = fornecedores
    .filter(f => f.status === "contratado")
    .reduce((sum, f) => sum + (f.valorContratado ?? 0), 0);

  const contratados = fornecedores.filter(f => f.status === "contratado").length;
  const avaliando = fornecedores.filter(f => f.status === "avaliando").length;

  const filtered = fornecedores.filter(f => {
    const byStatus = filterStatus === "todos" || f.status === filterStatus;
    const byCat = filterCat === "todos" || f.categoria === filterCat;
    return byStatus && byCat;
  });

  const catsComFornecedor = Array.from(new Set(fornecedores.map(f => f.categoria)));

  async function handleSave(data: Fornecedor) {
    const payload = {
      name: data.nome, category: data.categoria, status: data.status,
      contactName: data.contato, phone: data.telefone,
      site: data.site, notes: data.notas, contractedValue: data.valorContratado,
    };
    const isNew = !fornecedores.find(f => f.id === data.id);
    if (isNew) {
      await createVendor(payload);
    } else {
      await updateVendor(data.id, payload);
    }
    setFornecedores(prev => {
      const exists = prev.find(f => f.id === data.id);
      return exists ? prev.map(f => f.id === data.id ? data : f) : [data, ...prev];
    });
    setModalFornecedor({ open: false });
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este fornecedor?")) return;
    await deleteVendor(id);
    setFornecedores(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className="max-w-5xl">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
          <p className="text-2xl font-semibold text-neutral-800 font-display">{fornecedores.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Total de fornecedores</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
          <p className="text-2xl font-semibold font-display" style={{ color: "#3A7A4A" }}>{contratados}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Contratados</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
          <p className="text-2xl font-semibold font-display" style={{ color: "#B07A20" }}>{avaliando}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Em avaliação</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
          <p className="text-2xl font-semibold text-neutral-800 font-display">
            {totalContratado > 0 ? `R$ ${(totalContratado / 1000).toFixed(0)}k` : "—"}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">Total contratado</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          {(["todos", "avaliando", "contratado", "descartado"] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={["px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                filterStatus === s
                  ? "bg-moss text-white border-moss"
                  : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
              ].join(" ")}
            >
              {s === "todos" ? "Todos" : STATUS_CONFIG[s as StatusFornecedor].label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModalFornecedor({ open: true })}
          className="btn-texture shrink-0"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Novo fornecedor
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setFilterCat("todos")}
          className={["px-3 py-1 rounded-full text-xs font-medium border transition-all",
            filterCat === "todos" ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
          ].join(" ")}
        >
          Todas categorias
        </button>
        {catsComFornecedor.map(catId => {
          const cat = CATEGORIAS_FORNECEDOR.find(c => c.id === catId);
          if (!cat) return null;
          return (
            <button
              key={catId}
              onClick={() => setFilterCat(catId)}
              className={["px-3 py-1 rounded-full text-xs font-medium border transition-all",
                filterCat === catId ? "border-transparent" : "bg-white border-neutral-200 hover:border-neutral-300"
              ].join(" ")}
              style={filterCat === catId ? { background: cat.color, color: "white", borderColor: cat.color } : { color: cat.color }}
            >
              {cat.icon} {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
          <p className="text-neutral-500 font-medium mb-1">Nenhum fornecedor encontrado</p>
          <p className="text-neutral-400 text-sm">Tente outro filtro ou adicione um novo fornecedor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(f => (
            <FornecedorCard
              key={f.id}
              fornecedor={f}
              onEdit={() => setModalFornecedor({ open: true, fornecedor: f })}
              onDelete={() => handleDelete(f.id)}
              onOrcamentos={() => setModalOrcamentos({ open: true, fornecedor: f })}
            />
          ))}
        </div>
      )}

      {modalFornecedor.open && (
        <FornecedorModal
          fornecedor={modalFornecedor.fornecedor}
          onSave={handleSave}
          onClose={() => setModalFornecedor({ open: false })}
        />
      )}

      {modalOrcamentos.open && modalOrcamentos.fornecedor && (
        <OrcamentosModal
          fornecedor={modalOrcamentos.fornecedor}
          onClose={() => setModalOrcamentos({ open: false })}
          onUpdate={updated => {
            setFornecedores(prev => prev.map(f => f.id === updated.id ? updated : f));
            setModalOrcamentos({ open: false });
          }}
        />
      )}
    </div>
  );
}

function FornecedorCard({
  fornecedor: f,
  onEdit, onDelete, onOrcamentos,
}: {
  fornecedor: Fornecedor;
  onEdit: () => void;
  onDelete: () => void;
  onOrcamentos: () => void;
}) {
  const cat = CATEGORIAS_FORNECEDOR.find(c => c.id === f.categoria);
  const status = STATUS_CONFIG[f.status];
  const melhorOrc = f.orcamentos.find(o => o.escolhido) ?? f.orcamentos[0];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 flex flex-col overflow-hidden hover:shadow-sm transition-shadow">
      {/* Top bar with category color */}
      <div className="h-1.5" style={{ background: cat?.color ?? "#ccc" }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{cat?.icon}</span>
              <h3 className="font-semibold text-neutral-800 text-sm truncate">{f.nome}</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cat?.bg, color: cat?.color }}>
              {cat?.label}
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Status badge */}
        <span className="self-start text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>
          {status.label}
        </span>

        {/* Contact */}
        <div className="space-y-1 text-xs text-neutral-500">
          {f.contato && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {f.contato}
            </div>
          )}
          {f.telefone && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 6 6l.96-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16h1.42z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {f.telefone}
            </div>
          )}
        </div>

        {/* Orçamento highlight */}
        {melhorOrc && (
          <div className="bg-neutral-50 rounded-lg px-3 py-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">{melhorOrc.escolhido ? "Valor contratado" : "Melhor orçamento"}</span>
              <span className="font-semibold text-neutral-800">
                R$ {melhorOrc.valor.toLocaleString("pt-BR")}
              </span>
            </div>
            {f.orcamentos.length > 1 && (
              <p className="text-neutral-400 mt-0.5">{f.orcamentos.length} orçamentos</p>
            )}
          </div>
        )}

        {/* Notes */}
        {f.notas && (
          <p className="text-xs text-neutral-400 italic line-clamp-2">{f.notas}</p>
        )}

        {/* Contract badge */}
        {f.contratoUrl && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-2.5 py-1.5 self-start">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
            </svg>
            Contrato anexado
          </div>
        )}
      </div>

      {/* Footer action */}
      <button
        onClick={onOrcamentos}
        className="border-t border-neutral-100 px-5 py-3 text-xs font-medium text-sage hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l6.3-6.3a1 1 0 0 0 0-1.41z" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="7" r="2"/>
        </svg>
        Ver orçamentos ({f.orcamentos.length})
      </button>
    </div>
  );
}
