"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lookupPin } from "./rsvp/pin-actions";

export function PinRsvpInput({
  slug,
  accent,
  buttonRadius = "0.375rem",
}: {
  slug: string;
  accent: string;
  buttonRadius?: string;
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) return;
    setLoading(true);
    setError("");
    const result = await lookupPin(slug, pin);
    if ("error" in result) {
      setError("PIN não encontrado. Verifique o código no seu convite.");
      setLoading(false);
      return;
    }
    if (result.type === "guest") router.push(`/${slug}/rsvp?guest=${result.guestId}`);
    else router.push(`/${slug}/rsvp/group?token=${result.token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="0000"
        className="w-full text-center text-2xl tracking-[0.5em] border-b-2 bg-transparent py-3 focus:outline-none transition-colors placeholder:text-current/20"
        style={{ borderColor: `${accent}60`, color: "inherit", fontFamily: "var(--font-display)" }}
        onFocus={e => (e.target.style.borderColor = accent)}
        onBlur={e => (e.target.style.borderColor = `${accent}60`)}
      />
      {error && (
        <p className="text-xs text-center" style={{ color: "#e05252", fontFamily: "var(--font-body)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pin.length < 4 || loading}
        className="w-full py-3 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ background: accent, color: "#fff", borderRadius: buttonRadius, fontFamily: "var(--font-body)" }}
      >
        {loading ? "Buscando..." : "Confirmar presença"}
      </button>
    </form>
  );
}
