"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn } from "./actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Foto de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?w=1800&q=80')",
        }}
      />
      {/* Overlay escuro suave */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(13,10,11,0.52)" }} />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white tracking-wide drop-shadow-lg">Weddiners</h1>
          <p className="text-white/70 font-body mt-2 text-sm tracking-wide">
            Bem-vinda de volta
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
          <h2 className="font-display text-3xl text-white mb-1">Entrar</h2>
          <p className="text-white/70 text-sm font-body mb-6">
            Acesse seu painel de casamento
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input glass label="E-mail" name="email" type="email" placeholder="ana@email.com" required />
            <Input glass label="Senha" name="password" type="password" placeholder="Sua senha" required />

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
        </div>

        {/* Badge */}
        <p className="text-center text-xs text-white/50 font-body mt-5 tracking-wide">
          ✦ Taxa zero nos presentes — o Pix vai direto para você ✦
        </p>
      </div>
    </div>
  );
}
