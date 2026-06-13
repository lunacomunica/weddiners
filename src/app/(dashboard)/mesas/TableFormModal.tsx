"use client";

import { useState } from "react";
import { createTable, updateTable } from "./actions";
import type { Table } from "./TablesManager";

type Props = {
  table?: Table;
  onClose: () => void;
};

export function TableFormModal({ table, onClose }: Props) {
  const [name, setName] = useState(table?.name ?? "");
  const [capacity, setCapacity] = useState(table?.capacity ?? 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Nome é obrigatório");
    if (capacity < 1 || capacity > 100) return setError("Capacidade deve ser entre 1 e 100");
    setLoading(true);
    setError("");
    const result = table
      ? await updateTable(table.id, name.trim(), capacity)
      : await createTable(name.trim(), capacity);
    setLoading(false);
    if (result?.error) return setError(result.error);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-neutral-800 mb-5">
          {table ? "Editar mesa" : "Nova mesa"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nome da mesa</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Mesa 1, Mesa dos Pais..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Capacidade (lugares)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-neutral-200 rounded-lg py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Salvando..." : table ? "Salvar" : "Criar mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
