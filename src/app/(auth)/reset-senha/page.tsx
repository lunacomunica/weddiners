"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function ResetSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Não foi possível atualizar a senha. Tente novamente.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(13,10,11,0.52)" }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white tracking-wide drop-shadow-lg">Weddiners</h1>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
          <h2 className="font-display text-3xl text-white mb-1">Nova senha</h2>
          <p className="text-white/70 text-sm font-body mb-6">Escolha uma senha segura com pelo menos 8 caracteres.</p>

          {success ? (
            <p className="text-emerald-300 text-sm font-body bg-emerald-500/10 border border-emerald-400/20 rounded-md px-4 py-3 text-center">
              ✓ Senha atualizada! Redirecionando...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input glass label="Nova senha" name="password" type="password" placeholder="••••••••" required />
              <Input glass label="Confirmar senha" name="confirm" type="password" placeholder="••••••••" required />

              {error && (
                <p className="text-rose text-sm font-body bg-rose/5 border border-rose/20 rounded-md px-4 py-3">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2">
                Salvar nova senha
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
