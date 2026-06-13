"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateCoupleData, updatePassword, updateEmail } from "./actions";

interface Couple {
  bride_name: string;
  groom_name: string;
  partner1_name: string | null;
  partner2_name: string | null;
  wedding_date: string | null;
  wedding_location: string | null;
}

export function ConfigSection({ couple, email }: { couple: Couple; email: string }) {
  return (
    <div className="space-y-6">
      <CoupleForm couple={couple} />
      <EmailForm email={email} />
      <PasswordForm />
    </div>
  );
}

function CoupleForm({ couple }: { couple: Couple }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await updateCoupleData(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
      <h2 className="font-display text-lg text-noir mb-1">Dados do casamento</h2>
      <p className="font-body text-sm text-smoke mb-5">Informações exibidas no seu site público</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome da noiva" name="bride_name" defaultValue={couple.bride_name} required />
          <Input label="Nome do noivo" name="groom_name" defaultValue={couple.groom_name} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Exibido no site — Noiva" name="partner1_name" defaultValue={couple.partner1_name ?? ""} placeholder={couple.bride_name} />
          <Input label="Exibido no site — Noivo" name="partner2_name" defaultValue={couple.partner2_name ?? ""} placeholder={couple.groom_name} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Data do casamento" name="wedding_date" type="date" defaultValue={couple.wedding_date ?? ""} />
          <Input label="Local" name="wedding_location" defaultValue={couple.wedding_location ?? ""} placeholder="São Paulo, SP" />
        </div>
        {error && <p className="text-rose text-sm font-body">{error}</p>}
        <Button variant="texture" type="submit" loading={loading}>
          {saved ? "✓ Salvo!" : "Salvar dados"}
        </Button>
      </form>
    </div>
  );
}

function EmailForm({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(""); setMessage("");
    const result = await updateEmail(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else if (result?.message) setMessage(result.message);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
      <h2 className="font-display text-lg text-noir mb-1">E-mail de acesso</h2>
      <p className="font-body text-sm text-smoke mb-5">Atual: <span className="text-noir">{email}</span></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Novo e-mail" name="email" type="email" placeholder="novo@email.com" required />
        {error && <p className="text-rose text-sm font-body">{error}</p>}
        {message && <p className="text-emerald-600 text-sm font-body">{message}</p>}
        <Button variant="texture" type="submit" loading={loading}>Alterar e-mail</Button>
      </form>
    </div>
  );
}

function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await updatePassword(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
      <h2 className="font-display text-lg text-noir mb-1">Senha</h2>
      <p className="font-body text-sm text-smoke mb-5">Escolha uma senha com pelo menos 8 caracteres</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Nova senha"
            name="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-8 text-smoke hover:text-noir transition-colors"
          >
            {show ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </div>
        <Input
          label="Confirmar nova senha"
          name="confirm"
          type={show ? "text" : "password"}
          placeholder="••••••••"
          required
        />
        {error && <p className="text-rose text-sm font-body">{error}</p>}
        <Button variant="texture" type="submit" loading={loading}>
          {saved ? "✓ Senha alterada!" : "Alterar senha"}
        </Button>
      </form>
    </div>
  );
}
