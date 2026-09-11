"use client";

import { useState } from "react";
import { generateInviteLink } from "./invite-actions";

export function InvitePartnerSection() {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await generateInviteLink();
    if (result.url) setLink(result.url);
    setLoading(false);
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
          <svg width="18" height="18" fill="none" stroke="#7A8C6A" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round"/>
            <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-800 text-sm mb-1">Convidar o noivo</h3>
          <p className="text-xs text-neutral-500 font-body mb-4">
            Gere um link único e envie para o noivo pelo WhatsApp. Ele vai criar o acesso dele e entrar direto no painel de vocês.
          </p>

          {!link ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Gerar link de convite"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
                <span className="flex-1 text-xs font-mono text-neutral-600 truncate min-w-0">{link}</span>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-white border border-neutral-200 text-neutral-600 hover:border-sage hover:text-sage"}`}
                >
                  {copied ? "✓ Copiado!" : "Copiar"}
                </button>
              </div>
              <p className="text-xs text-neutral-400 font-body">
                O link expira quando o noivo usar. Você pode gerar um novo a qualquer momento.
              </p>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-xs text-neutral-400 hover:text-sage transition-colors underline"
              >
                Gerar novo link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
