"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { GuestModal } from "./GuestModal";
import { deleteGuest, updateSaveTheDateStatus } from "./actions";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  group_name: string | null;
  table_number: number | null;
  adults: number;
  children: number;
  dietary_restrictions: string | null;
  notes: string | null;
  rsvp_status: string;
  save_the_date_status: "nao_enviado" | "enviado" | "visualizado";
  guest_type: "adulto" | "crianca" | null;
  child_age: number | null;
  pin: string | null;
}

const statusMap = {
  pending:   { label: "Pendente",   variant: "pending"   as const },
  confirmed: { label: "Confirmado", variant: "confirmed" as const },
  declined:  { label: "Recusou",    variant: "declined"  as const },
};

const stdCycle: Array<"nao_enviado" | "enviado" | "visualizado"> = ["nao_enviado", "enviado", "visualizado"];
const stdMap = {
  nao_enviado: { label: "Não enviado", color: "bg-neutral-100 text-neutral-500" },
  enviado:     { label: "Enviado",     color: "bg-blue-50 text-blue-600" },
  visualizado: { label: "Visualizado", color: "bg-emerald-50 text-emerald-600" },
};

export function GuestsList({ guests, slug }: { guests: Guest[]; slug: string }) {
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stdStatus, setStdStatus] = useState<Record<string, "nao_enviado" | "enviado" | "visualizado">>(
    Object.fromEntries(guests.map(g => [g.id, g.save_the_date_status ?? "nao_enviado"]))
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const allSelected = guests.length > 0 && selected.size === guests.length;
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(guests.map(g => g.id)));
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function bulkSetStd(status: "nao_enviado" | "enviado" | "visualizado") {
    setBulkLoading(true);
    const ids = Array.from(selected);
    setStdStatus(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = status; });
      return next;
    });
    await Promise.all(ids.map(id => updateSaveTheDateStatus(id, status)));
    setSelected(new Set());
    setBulkLoading(false);
  }

  async function cycleSaveTheDate(guestId: string) {
    const current = stdStatus[guestId] ?? "nao_enviado";
    const next = stdCycle[(stdCycle.indexOf(current) + 1) % stdCycle.length];
    setStdStatus(prev => ({ ...prev, [guestId]: next }));
    await updateSaveTheDateStatus(guestId, next);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteGuest(deleteId);
    setDeleteId(null);
  }

  function copyRsvpLink(guestId: string) {
    const url = `${window.location.origin}/${slug}/rsvp?guest=${guestId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-16 text-smoke font-body">
        <div className="w-12 h-12 rounded-full bg-champagne flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-smoke"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p className="font-display text-2xl text-noir mb-1">Nenhum convidado ainda</p>
        <p className="text-sm">Adicione convidados ou importe via CSV</p>
      </div>
    );
  }

  return (
    <>
      {/* Barra de ações em massa */}
      {someSelected && (
        <div className="flex items-center gap-3 bg-moss text-white px-4 py-3 rounded-xl mb-3 flex-wrap">
          <span className="font-body text-sm font-medium">
            {selected.size} selecionado{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex-1" />
          <span className="font-body text-xs text-white/70">Marcar save the date como:</span>
          {(["nao_enviado", "enviado", "visualizado"] as const).map(s => (
            <button
              key={s}
              onClick={() => bulkSetStd(s)}
              disabled={bulkLoading}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              {stdMap[s].label}
            </button>
          ))}
          <button
            onClick={() => setSelected(new Set())}
            className="ml-1 text-white/60 hover:text-white transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-md border overflow-hidden" style={{ borderColor: "rgba(13,10,11,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir/7 bg-ivory">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-moss w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-smoke uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-smoke uppercase tracking-wide hidden md:table-cell">Grupo</th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-smoke uppercase tracking-wide hidden lg:table-cell">Mesa</th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-smoke uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-smoke uppercase tracking-wide hidden md:table-cell">Save the Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, i) => {
              const status = statusMap[guest.rsvp_status as keyof typeof statusMap] ?? statusMap.pending;
              const isSelected = selected.has(guest.id);
              return (
                <tr
                  key={guest.id}
                  className={`border-b border-noir/5 transition-colors ${i === guests.length - 1 ? "border-0" : ""} ${isSelected ? "bg-moss/5" : "hover:bg-ivory/60"}`}
                >
                  <td className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(guest.id)}
                      className="accent-moss w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-medium text-noir">{guest.name}</p>
                      {guest.pin && (
                        <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">
                          {guest.pin}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-smoke">
                      {guest.guest_type === "crianca"
                        ? `👶 Criança${guest.child_age != null ? ` · ${guest.child_age} anos` : ""}`
                        : guest.email ?? ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-body text-sm text-smoke">{guest.group_name ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="font-body text-sm text-smoke">{guest.table_number ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button
                      onClick={() => cycleSaveTheDate(guest.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:opacity-80 ${stdMap[stdStatus[guest.id] ?? "nao_enviado"].color}`}
                      title="Clique para avançar o status"
                    >
                      {stdMap[stdStatus[guest.id] ?? "nao_enviado"].label}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => copyRsvpLink(guest.id)}
                        className={["px-2 transition-colors", copiedId === guest.id ? "text-emerald-600" : ""].join(" ")}
                        title="Copiar link RSVP"
                      >
                        {copiedId === guest.id ? (
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditGuest(guest)} className="px-2" title="Editar">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(guest.id)} className="px-2" title="Remover">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editGuest && <GuestModal open={!!editGuest} onClose={() => setEditGuest(null)} guest={editGuest} />}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remover convidado" size="sm">
        <p className="text-smoke font-body text-sm mb-6">Tem certeza que deseja remover este convidado?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">Remover</Button>
        </div>
      </Modal>
    </>
  );
}
