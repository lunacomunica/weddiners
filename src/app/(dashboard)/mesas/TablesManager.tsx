"use client";

import { useState } from "react";
import { TableCard } from "./TableCard";
import { TableFormModal } from "./TableFormModal";
import { AssignGuestModal } from "./AssignGuestModal";
import { deleteTable } from "./actions";

export type Table = {
  id: string;
  name: string;
  capacity: number;
  created_at: string;
};

export type Guest = {
  id: string;
  name: string;
  rsvp_status: string;
  table_id: string | null;
};

type Props = {
  tables: Table[];
  guests: Guest[];
};

export function TablesManager({ tables, guests }: Props) {
  const [formModal, setFormModal] = useState<{ open: boolean; table?: Table }>({ open: false });
  const [assignModal, setAssignModal] = useState<{ open: boolean; table?: Table }>({ open: false });
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const assignedCount = guests.filter(g => g.table_id).length;
  const unassignedCount = guests.filter(g => !g.table_id).length;

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta mesa? Os convidados serão desatribuídos.")) return;
    setDeleting(id);
    await deleteTable(id);
    setDeleting(null);
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Mesas", value: tables.length },
          { label: "Lugares totais", value: totalSeats },
          { label: "Convidados alocados", value: assignedCount },
          { label: "Sem mesa", value: unassignedCount },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
            <p className="text-2xl font-semibold text-neutral-800 font-display">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-neutral-700">
          {tables.length === 0 ? "Nenhuma mesa criada ainda" : `${tables.length} mesa${tables.length > 1 ? "s" : ""}`}
        </h2>
        <button
          onClick={() => setFormModal({ open: true })}
          className="btn-texture"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Nova mesa
        </button>
      </div>

      {/* Empty state */}
      {tables.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
          <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-sage">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium mb-1">Organize seus convidados por mesas</p>
          <p className="text-neutral-400 text-sm mb-6">Crie as mesas e depois arraste os convidados para cada uma</p>
          <button
            onClick={() => setFormModal({ open: true })}
            className="bg-moss text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-moss/90 transition-colors"
          >
            Criar primeira mesa
          </button>
        </div>
      )}

      {/* Tables grid */}
      {tables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              guests={guests.filter(g => g.table_id === table.id)}
              isDeleting={deleting === table.id}
              onEdit={() => setFormModal({ open: true, table })}
              onDelete={() => handleDelete(table.id)}
              onAssign={() => setAssignModal({ open: true, table })}
            />
          ))}
        </div>
      )}

      {/* Unassigned guests */}
      {guests.filter(g => !g.table_id).length > 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-amber-600">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium text-amber-700">
              {unassignedCount} convidado{unassignedCount > 1 ? "s" : ""} sem mesa
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {guests.filter(g => !g.table_id).map(g => (
              <span key={g.id} className="bg-white border border-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-full">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {formModal.open && (
        <TableFormModal
          table={formModal.table}
          onClose={() => setFormModal({ open: false })}
        />
      )}
      {assignModal.open && assignModal.table && (
        <AssignGuestModal
          table={assignModal.table}
          assignedGuests={guests.filter(g => g.table_id === assignModal.table!.id)}
          unassignedGuests={guests.filter(g => !g.table_id)}
          onClose={() => setAssignModal({ open: false })}
        />
      )}
    </div>
  );
}
