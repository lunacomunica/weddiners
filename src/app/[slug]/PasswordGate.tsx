"use client";

import { useState } from "react";
import { unlockSite } from "./actions";

export function PasswordGate({ slug, couple }: { slug: string; couple: { partner1_name?: string | null; partner2_name?: string | null } }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await unlockSite(slug, password);
    if (result?.error) {
      setError("Senha incorreta. Tente novamente.");
      setLoading(false);
    } else {
      // Reload to re-render server component with cookie set
      window.location.reload();
    }
  }

  const name1 = couple.partner1_name;
  const name2 = couple.partner2_name;

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" fill="none" stroke="#7A8C6A" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {name1 && name2 && (
          <p className="font-display text-2xl text-noir mb-1">{name1} & {name2}</p>
        )}
        <p className="text-sm text-neutral-500 mb-6">Digite a senha para acessar o site</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              autoFocus
              className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage text-center tracking-widest pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {show
                ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-sage text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40 hover:bg-sage/90 transition-colors"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
