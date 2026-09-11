"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AcceptInviteForm({ token, coupleId }: { token: string; coupleId: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // Tenta criar conta nova
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    let userId: string | null = null;

    if (signUpError) {
      // Se já tem conta, tenta logar
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("E-mail ou senha incorretos. Se já tem conta, use sua senha atual.");
        setLoading(false);
        return;
      }
      userId = signInData.user?.id ?? null;
    } else {
      userId = signUpData.user?.id ?? null;
    }

    if (!userId) {
      setError("Erro ao criar acesso. Tente novamente.");
      setLoading(false);
      return;
    }

    // Registra como membro do casal
    const res = await fetch("/api/convite/aceitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, coupleId, userId }),
    });

    if (!res.ok) {
      setError("Erro ao vincular ao casal. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-body text-xs text-smoke uppercase tracking-wide mb-1">Seu e-mail</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
          className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
        />
      </div>
      <div>
        <label className="block font-body text-xs text-smoke uppercase tracking-wide mb-1">Criar senha</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
        />
      </div>

      {error && <p className="text-xs text-red-500 font-body">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {loading ? "Criando acesso..." : "Entrar no painel"}
      </button>

      <p className="text-xs text-neutral-400 text-center font-body">
        Se já tem conta no Weddiners, use seu e-mail e senha existentes.
      </p>
    </form>
  );
}
