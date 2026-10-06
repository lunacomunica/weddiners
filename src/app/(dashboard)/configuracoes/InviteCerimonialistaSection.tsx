"use client";

import { useState } from "react";
import { inviteCerimonialista, removeCerimonialista } from "./cerimonialista-actions";

interface CerimonialistaLink {
  id: string;
  status: "pending" | "active";
  cerimonialista_name: string | null;
  cerimonialista_email: string | null;
}

interface Props {
  links: CerimonialistaLink[];
}

export function InviteCerimonialistaSection({ links }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = await inviteCerimonialista(email.trim());
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: `Convite enviado para ${result.name ?? email}! Ela precisa aceitar no painel dela.` });
      setEmail("");
    }
    setLoading(false);
  }

  async function handleRemove(linkId: string) {
    await removeCerimonialista(linkId);
  }

  const activeLink = links.find(l => l.status === "active");
  const pendingLink = links.find(l => l.status === "pending");

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="font-body font-semibold text-noir text-base mb-1">Minha cerimonialista</h3>
      <p className="text-sm text-smoke font-body mb-5">
        Vincule sua cerimonialista para que ela possa gerenciar seu casamento.
      </p>

      {/* Cerimonialista ativa */}
      {activeLink && (
        <div className="flex items-center gap-3 p-4 bg-sage/5 border border-sage/20 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center shrink-0">
            <span className="text-lg">🌸</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-noir font-body">{activeLink.cerimonialista_name ?? activeLink.cerimonialista_email ?? "—"}</p>
            {activeLink.cerimonialista_email && activeLink.cerimonialista_name && (
              <p className="text-xs text-smoke truncate">{activeLink.cerimonialista_email}</p>
            )}
          </div>
          <span className="text-xs font-medium text-sage bg-sage/10 px-2.5 py-1 rounded-full shrink-0">Ativa</span>
          <button
            onClick={() => handleRemove(activeLink.id)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
          >
            Remover
          </button>
        </div>
      )}

      {/* Convite pendente */}
      {pendingLink && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-noir font-body">{pendingLink.cerimonialista_name ?? pendingLink.cerimonialista_email ?? "—"}</p>
            <p className="text-xs text-smoke">Aguardando aceite da cerimonialista</p>
          </div>
          <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full shrink-0">Pendente</span>
          <button
            onClick={() => handleRemove(pendingLink.id)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Formulário de convite */}
      {!activeLink && !pendingLink && (
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail da cerimonialista"
            required
            className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-50"
          >
            {loading ? "..." : "Convidar"}
          </button>
        </form>
      )}

      {message && (
        <p className={["text-sm font-body mt-3", message.type === "error" ? "text-red-500" : "text-sage"].join(" ")}>
          {message.text}
        </p>
      )}
    </div>
  );
}
