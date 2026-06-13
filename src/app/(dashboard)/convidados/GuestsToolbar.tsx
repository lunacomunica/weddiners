"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { GuestModal } from "./GuestModal";
import { importGuestsFromCSV } from "./actions";

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

export function GuestsToolbar({ stats, slug: _slug, guests, plan = "free" }: {
  stats: Stats;
  slug: string;
  plan?: "free" | "pro";
  guests: { name: string; email: string | null; phone: string | null; group_name: string | null; rsvp_status: string; table_number: number | null }[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
      return { name: row["nome"] || row["name"] || "", email: row["email"] || "", phone: row["telefone"] || row["phone"] || "", group_name: row["grupo"] || row["group"] || "" };
    }).filter(r => r.name);
    await importGuestsFromCSV(rows);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function exportCSV() {
    const header = "Nome,Email,Telefone,Grupo,Mesa,Status RSVP";
    const rows = guests.map(g =>
      `"${g.name}","${g.email ?? ""}","${g.phone ?? ""}","${g.group_name ?? ""}","${g.table_number ?? ""}","${g.rsvp_status}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "convidados.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-noir" },
          { label: "Confirmados", value: stats.confirmed, color: "text-emerald-600" },
          { label: "Pendentes", value: stats.pending, color: "text-smoke" },
          { label: "Recusaram", value: stats.declined, color: "text-rose" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-md border p-4" style={{ borderColor: "rgba(13,10,11,0.07)" }}>
            <p className="text-smoke text-xs font-body uppercase tracking-wide">{s.label}</p>
            <p className={`font-display text-3xl mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Banner paywall */}
      {plan === "free" && stats.total >= 40 && (
        <div className={`mb-4 flex items-center gap-3 rounded-md px-4 py-3 ${stats.total >= 50 ? "bg-rose/10 border border-rose/20" : "bg-gold/8 border border-gold/20"}`}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className={stats.total >= 50 ? "text-rose shrink-0" : "text-gold shrink-0"}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/></svg>
          <p className="font-body text-sm flex-1">
            {stats.total >= 50
              ? <><span className="font-medium text-rose">Limite atingido.</span> <span className="text-smoke">Você tem 50/50 convidados no plano Gratuito.</span></>
              : <span className="text-smoke">Você tem {stats.total}/50 convidados no plano Gratuito.</span>
            }
            {" "}<a href="/planos" className="text-moss font-medium hover:underline">Fazer upgrade para Pro →</a>
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 flex-wrap mb-6">
        <Button variant="texture" onClick={() => setModalOpen(true)}>+ Adicionar convidado</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={importing}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/></svg>
          Importar CSV
        </Button>
        {guests.length > 0 && (
          <Button variant="secondary" onClick={exportCSV}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round"/></svg>
            Exportar CSV
          </Button>
        )}
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
      </div>

      <GuestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
