"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateCoupleData, updatePassword, updateEmail, uploadAvatar } from "./actions";

interface Couple {
  bride_name: string;
  groom_name: string;
  partner1_name: string | null;
  partner2_name: string | null;
  wedding_date: string | null;
  wedding_location: string | null;
}

export function ConfigSection({ couple, email, avatarUrl }: { couple: Couple; email: string; avatarUrl: string | null }) {
  return (
    <div className="space-y-6">
      <AvatarForm initialUrl={avatarUrl} name={couple.partner1_name || couple.bride_name} />
      <CoupleForm couple={couple} />
      <EmailForm email={email} />
      <PasswordForm />
    </div>
  );
}

function AvatarForm({ initialUrl, name }: { initialUrl: string | null; name: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  async function handleFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use JPG, PNG ou WebP."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Máximo 5 MB."); return;
    }
    setUploading(true); setError("");
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadAvatar(fd);
    if (result?.error) setError(result.error);
    else if (result?.url) setUrl(result.url);
    setUploading(false);
  }

  return (
    <div className="bg-white rounded-lg border p-6 flex items-center gap-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-full overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-sage/30 hover:ring-sage/60 transition-all"
        >
          {url ? (
            <img src={url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-sage/20 flex items-center justify-center">
              <span className="text-sage font-display text-2xl">{initials}</span>
            </div>
          )}
        </div>
        {/* Ícone de câmera */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-sage rounded-full flex items-center justify-center shadow-md hover:bg-sage/90 transition-colors"
        >
          {uploading
            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <svg width="13" height="13" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      <div>
        <p className="font-semibold text-neutral-800 text-sm">{name}</p>
        <p className="text-xs text-neutral-500 mt-0.5">Clique na foto para alterar</p>
        <p className="text-xs text-neutral-400 mt-0.5">JPG, PNG ou WebP · máx. 5 MB</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
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
