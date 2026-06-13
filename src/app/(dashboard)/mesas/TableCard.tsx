"use client";

import type { Table, Guest } from "./TablesManager";

type Props = {
  table: Table;
  guests: Guest[];
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-400",
  declined: "bg-red-400",
  pending: "bg-amber-400",
};

export function TableCard({ table, guests, isDeleting, onEdit, onDelete, onAssign }: Props) {
  const occupancy = guests.length;
  const pct = Math.min(100, Math.round((occupancy / table.capacity) * 100));
  const isFull = occupancy >= table.capacity;

  return (
    <div className={["bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-opacity", isDeleting ? "opacity-50 pointer-events-none" : "border-neutral-200"].join(" ")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-neutral-800 text-base">{table.name}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {occupancy} / {table.capacity} lugares
            {isFull && <span className="ml-2 text-red-500 font-medium">· Completa</span>}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            title="Editar mesa"
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            title="Excluir mesa"
            className="p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={["h-full rounded-full transition-all", isFull ? "bg-red-400" : "bg-sage"].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Guest list */}
      {guests.length > 0 ? (
        <ul className="space-y-1.5">
          {guests.map(g => (
            <li key={g.id} className="flex items-center gap-2 text-sm text-neutral-600">
              <span className={["w-2 h-2 rounded-full shrink-0", STATUS_COLORS[g.rsvp_status] ?? "bg-neutral-300"].join(" ")} />
              {g.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-neutral-400 italic">Nenhum convidado alocado</p>
      )}

      {/* Assign button */}
      {!isFull && (
        <button
          onClick={onAssign}
          className="mt-auto flex items-center justify-center gap-1.5 w-full border border-dashed border-neutral-300 rounded-lg py-2 text-xs text-neutral-500 hover:border-sage hover:text-sage transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Adicionar convidado
        </button>
      )}
    </div>
  );
}
