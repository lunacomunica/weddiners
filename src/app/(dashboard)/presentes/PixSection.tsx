"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePixKey } from "./actions";

interface PixSectionProps {
  pixKey: string | null;
  pixKeyType: string | null;
  pixHolderName: string | null;
}

const keyTypes = [
  { value: "cpf", label: "CPF" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "random", label: "Chave aleatória" },
];

export function PixSection({ pixKey, pixKeyType, pixHolderName }: PixSectionProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updatePixKey(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-md border p-6 mt-8" style={{ borderColor: "rgba(13,10,11,0.07)" }}>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-gold">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="font-display text-xl text-noir">Chave Pix</h3>
          <p className="text-smoke text-sm font-body mt-0.5">
            O Pix vai direto para você — a Weddiners nunca toca no seu dinheiro.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-noir/80 font-body">Tipo de chave</label>
            <select
              name="pix_key_type"
              defaultValue={pixKeyType ?? ""}
              required
              className="w-full px-4 py-3 rounded-md border border-noir/15 bg-white text-noir font-body text-base focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
            >
              <option value="">Selecionar...</option>
              {keyTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Input label="Chave Pix" name="pix_key" defaultValue={pixKey ?? ""} required placeholder="Sua chave Pix" />
        </div>
        <Input label="Nome do titular" name="pix_holder_name" defaultValue={pixHolderName ?? ""} required placeholder="Nome completo" />

        {error && <p className="text-rose text-sm font-body">{error}</p>}
        {success && <p className="text-gold text-sm font-body">Chave Pix salva com sucesso!</p>}

        <Button type="submit" loading={loading}>Salvar chave Pix</Button>
      </form>
    </div>
  );
}
