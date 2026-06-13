"use client";

import { useState } from "react";
import { assignGuestToTable } from "./actions";
import type { Table, Guest } from "./TablesManager";

type Props = {
  table: Table;
  assignedGuests: Guest[];
  unassignedGuests: Guest[];
  onClose: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  declined: "Recusou",
  pending: "Pendente",
};

export function AssignGuestModal({ table, assignedGuests, unassignedGuests, onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function assign(guestId: string, tableId: string | null) {
    setLoading(guestId);
    setError("");
    const result = await assignGuestToTable(guestId, tableId);
    setLoading(null);
    if (result?.error) setError(result.error);
  }

  const occupied = assignedGuests.length;
  const isFull = occupied >= table.capacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">{table.name}</h2>
            <p className="text-sm text-neutral-400">{occupied} / {table.capacity} lugares</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="overflow-y-auto flex-1 space-y-4">
          {/* Assigned */}
          {assignedGuests.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Nesta mesa</p>
              <ul className="space-y-1">
                {assignedGuests.map(g => (
                  <li key={g.id} className="flex items-center justify-between gap-3 py-2 px-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-neutral-700">{g.name}</p>
                      <p className="text-xs text-neutral-400">{STATUS_LABEL[g.rsvp_status] ?? g.rsvp_status}</p>
                    </div>
                    <button
                      onClick={() => assign(g.id, null)}
                      disabled={loading === g.id}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors disabled:opacity-50"
                    >
                      {loading === g.id ? "..." : "Remover"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unassigned */}
          {unassignedGuests.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Sem mesa</p>
              {isFull ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Esta mesa está na capacidade máxima ({table.capacity} lugares).
                </p>
              ) : (
                <ul className="space-y-1">
                  {unassignedGuests.map(g => (
                    <li key={g.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-neutral-50">
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{g.name}</p>
                        <p className="text-xs text-neutral-400">{STATUS_LABEL[g.rsvp_status] ?? g.rsvp_status}</p>
                      </div>
                      <button
                        onClick={() => assign(g.id, table.id)}
                        disabled={loading === g.id}
                        className="text-xs font-medium text-sage hover:text-moss hover:underline transition-colors disabled:opacity-50"
                      >
                        {loading === g.id ? "..." : "Adicionar"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {assignedGuests.length === 0 && unassignedGuests.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-8">Nenhum convidado cadastrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
