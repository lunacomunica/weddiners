"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lookupByName } from "./rsvp/pin-actions";

export function PinRsvpInput({
  slug,
  accent,
  buttonRadius = "0.375rem",
}: {
  slug: string;
  accent: string;
  buttonRadius?: string;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<{ id: string; name: string; groupToken: string | null }[] | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setLoading(true);
    setError("");
    setMatches(null);

    const result = await lookupByName(slug, name);

    if ("error" in result) {
      setError(
        result.error === "too_short"
          ? "Digite pelo menos 2 caracteres."
          : "Nome não encontrado na lista de convidados. Verifique a grafia ou entre em contato com os noivos."
      );
      setLoading(false);
      return;
    }

    if (result.type === "guest") {
      router.push(`/${slug}/rsvp?guest=${result.guestId}`);
      return;
    }

    if (result.type === "group") {
      router.push(`/${slug}/rsvp/group?token=${result.token}`);
      return;
    }

    // Múltiplos resultados
    setMatches(result.matches);
    setLoading(false);
  }

  function selectMatch(match: { id: string; name: string; groupToken: string | null }) {
    if (match.groupToken) {
      router.push(`/${slug}/rsvp/group?token=${match.groupToken}`);
    } else {
      router.push(`/${slug}/rsvp?guest=${match.id}`);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setMatches(null); setError(""); }}
          placeholder="Seu nome completo"
          autoComplete="name"
          className="w-full text-center border-b-2 bg-transparent py-3 focus:outline-none transition-colors text-lg"
          style={{
            borderColor: `${accent}50`,
            color: "inherit",
            fontFamily: "var(--font-body)",
          }}
          onFocus={e => (e.target.style.borderColor = accent)}
          onBlur={e => (e.target.style.borderColor = `${accent}50`)}
        />

        {error && (
          <p className="text-xs text-center leading-relaxed" style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}>
            {error}
          </p>
        )}

        {/* Lista de resultados múltiplos */}
        {matches && matches.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            <p className="text-xs text-center" style={{ color: `${accent}99`, fontFamily: "var(--font-body)" }}>
              Encontramos mais de um resultado. Selecione seu nome:
            </p>
            {matches.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMatch(m)}
                className="w-full py-2.5 px-4 text-sm font-medium border rounded-lg transition-opacity hover:opacity-70 text-left"
                style={{
                  borderColor: `${accent}30`,
                  color: "inherit",
                  fontFamily: "var(--font-body)",
                  background: `${accent}08`,
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {!matches && (
          <button
            type="submit"
            disabled={name.trim().length < 2 || loading}
            className="w-full py-3.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              background: accent,
              color: "#fff",
              borderRadius: buttonRadius,
              fontFamily: "var(--font-body)",
            }}
          >
            {loading ? "Buscando..." : "Confirmar presença"}
          </button>
        )}
      </form>
    </div>
  );
}
