"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn, resetPassword } from "./actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMsg("");
    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);
    setResetLoading(false);
    if (result?.error) setResetError(result.error);
    else setResetMsg("Link enviado! Verifique seu e-mail 💌");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Foto de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(13,10,11,0.52)" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Weddiners" className="h-24 w-auto mx-auto drop-shadow-lg" />
          <p className="text-white/70 font-body mt-2 text-sm tracking-wide">
            {showReset ? "Recuperar acesso" : "Bem-vinda de volta"}
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">

          {!showReset ? (
            <>
              <h2 className="font-display text-3xl text-white mb-1">Entrar</h2>
              <p className="text-white/70 text-sm font-body mb-6">Acesse seu painel de casamento</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input glass label="E-mail" name="email" type="email" placeholder="ana@email.com" required />
                <div>
                  <Input glass label="Senha" name="password" type="password" placeholder="Sua senha" required />
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs text-white/50 hover:text-white/80 mt-1.5 block transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                {error && (
                  <p className="text-rose text-sm font-body bg-rose/5 border border-rose/20 rounded-md px-4 py-3">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={loading} className="w-full mt-2">
                  Entrar
                </Button>
              </form>

              <p className="text-center text-sm text-white/70 font-body mt-6">
                Não tem conta?{" "}
                <Link href="/cadastro" className="text-gold-light hover:underline font-medium">
                  Criar grátis
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl text-white mb-1">Recuperar senha</h2>
              <p className="text-white/70 text-sm font-body mb-6">
                Digite seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <Input glass label="E-mail" name="email" type="email" placeholder="ana@email.com" required />

                {resetError && (
                  <p className="text-rose text-sm font-body bg-rose/5 border border-rose/20 rounded-md px-4 py-3">
                    {resetError}
                  </p>
                )}
                {resetMsg && (
                  <p className="text-emerald-300 text-sm font-body bg-emerald-500/10 border border-emerald-400/20 rounded-md px-4 py-3">
                    {resetMsg}
                  </p>
                )}

                <Button type="submit" loading={resetLoading} className="w-full mt-2">
                  Enviar link
                </Button>
              </form>

              <button
                onClick={() => { setShowReset(false); setResetMsg(""); setResetError(""); }}
                className="text-center text-sm text-white/60 hover:text-white font-body mt-6 block w-full transition-colors"
              >
                ← Voltar para o login
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-white/50 font-body mt-5 tracking-wide">
          ✦ Taxa zero nos presentes — o Pix vai direto para você ✦
        </p>
      </div>
    </div>
  );
}
