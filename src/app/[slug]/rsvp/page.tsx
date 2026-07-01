"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitRsvp } from "./actions";
import { PinRsvpInput } from "../PinRsvpInput";

interface Guest {
  id: string;
  name: string;
  adults: number;
  children: number;
  dietary_restrictions: string | null;
  rsvp_status: string;
}

interface Couple {
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
}

function RsvpForm({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const guestId = searchParams.get("guest");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: coupleData } = await supabase
        .from("couples")
        .select("partner1_name, partner2_name, wedding_date")
        .eq("slug", slug)
        .single();
      if (coupleData) setCouple(coupleData);

      if (guestId) {
        const { data: guestData } = await supabase
          .from("guests")
          .select("id, name, adults, children, dietary_restrictions, rsvp_status")
          .eq("id", guestId)
          .single();
        if (guestData) {
          setGuest(guestData);
          if (guestData.rsvp_status !== "pending") setSubmitted(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [slug, guestId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!attending || !guest) return;
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("guest_id", guest.id);
    formData.set("attending", attending);
    const result = await submitRsvp(formData);
    if (result?.error) { setError(result.error); setSubmitting(false); }
    else { setSubmitted(true); setSubmitting(false); }
  }

  const weddingDate = couple?.wedding_date
    ? new Date(couple.wedding_date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!guest || !guestId) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="font-display text-gold text-lg tracking-wide mb-1">Confirmação de Presença</p>
            {couple && (
              <h1 className="font-display text-4xl text-noir">
                {couple.partner1_name} & {couple.partner2_name}
              </h1>
            )}
            {couple?.wedding_date && (
              <p className="font-body text-smoke text-sm mt-2">
                {new Date(couple.wedding_date + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            <div className="w-12 h-px bg-gold mx-auto mt-4" />
          </div>
          <div className="bg-white rounded-lg border p-8 shadow-sm text-center" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
            <p className="font-display text-xl text-noir mb-1">Qual é o seu nome?</p>
            <p className="font-body text-smoke text-sm mb-8">Digite seu nome completo para confirmar sua presença</p>
            <PinRsvpInput slug={slug} accent="#9C8456" buttonRadius="0.375rem" />
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const wasAttending = guest.rsvp_status === "confirmed" || attending === "yes";
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-display text-5xl mb-4">{wasAttending ? "🥂" : "💔"}</p>
          <h1 className="font-display text-3xl text-noir mb-2">
            {wasAttending ? "Até lá!" : "Obrigado por avisar"}
          </h1>
          <p className="font-body text-smoke text-sm">
            {wasAttending
              ? `Sua presença foi confirmada, ${guest.name.split(" ")[0]}. Mal podemos esperar para celebrar com você!`
              : `Sentiremos sua falta, ${guest.name.split(" ")[0]}. Agradecemos por nos avisar.`}
          </p>
          {couple && (
            <p className="font-display text-gold text-lg mt-6">
              {couple.partner1_name} & {couple.partner2_name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-display text-gold text-lg tracking-wide mb-1">Confirmação de Presença</p>
          {couple && (
            <h1 className="font-display text-4xl text-noir">
              {couple.partner1_name} & {couple.partner2_name}
            </h1>
          )}
          {weddingDate && (
            <p className="font-body text-smoke text-sm mt-2">{weddingDate}</p>
          )}
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <p className="font-body text-smoke text-sm mb-1">Olá,</p>
          <p className="font-display text-2xl text-noir mb-6">{guest.name}</p>

          {/* Attending choice */}
          <p className="font-body text-sm text-noir font-medium mb-3">Você vai comparecer?</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["yes", "no"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAttending(val)}
                className={`py-3 rounded-md border font-body text-sm font-medium transition-all ${
                  attending === val
                    ? val === "yes"
                      ? "bg-gold border-gold text-white"
                      : "bg-rose border-rose text-white"
                    : "border-noir/10 text-smoke hover:border-gold hover:text-noir"
                }`}
              >
                {val === "yes" ? "✓ Sim, estarei lá!" : "✗ Não poderei ir"}
              </button>
            ))}
          </div>

          {attending === "yes" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="guest_id" value={guest.id} />
              <input type="hidden" name="attending" value="yes" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs text-smoke uppercase tracking-wide mb-1">Adultos</label>
                  <input
                    name="adults"
                    type="number"
                    min="1"
                    defaultValue={guest.adults}
                    className="w-full border rounded-md px-3 py-2 font-body text-sm text-noir focus:outline-none focus:border-gold"
                    style={{ borderColor: "rgba(13,10,11,0.15)" }}
                  />
                </div>
                <div>
                  <label className="block font-body text-xs text-smoke uppercase tracking-wide mb-1">Crianças</label>
                  <input
                    name="children"
                    type="number"
                    min="0"
                    defaultValue={guest.children}
                    className="w-full border rounded-md px-3 py-2 font-body text-sm text-noir focus:outline-none focus:border-gold"
                    style={{ borderColor: "rgba(13,10,11,0.15)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs text-smoke uppercase tracking-wide mb-1">Restrições alimentares</label>
                <input
                  name="dietary_restrictions"
                  type="text"
                  defaultValue={guest.dietary_restrictions ?? ""}
                  placeholder="Vegetariano, sem glúten..."
                  className="w-full border rounded-md px-3 py-2 font-body text-sm text-noir focus:outline-none focus:border-gold"
                  style={{ borderColor: "rgba(13,10,11,0.15)" }}
                />
              </div>

              <div>
                <label className="block font-body text-xs text-smoke uppercase tracking-wide mb-1">Mensagem para o casal <span className="normal-case">(opcional)</span></label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Deixe uma mensagem carinhosa..."
                  className="w-full border rounded-md px-3 py-2 font-body text-sm text-noir focus:outline-none focus:border-gold resize-none"
                  style={{ borderColor: "rgba(13,10,11,0.15)" }}
                />
              </div>

              {error && <p className="text-rose text-sm font-body">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gold text-white font-body text-sm font-medium rounded-md hover:bg-gold/90 transition-colors disabled:opacity-60"
              >
                {submitting ? "Confirmando..." : "Confirmar presença"}
              </button>
            </form>
          )}

          {attending === "no" && (
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="guest_id" value={guest.id} />
              <input type="hidden" name="attending" value="no" />
              <input type="hidden" name="adults" value="0" />
              <input type="hidden" name="children" value="0" />
              {error && <p className="text-rose text-sm font-body mb-3">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-noir text-white font-body text-sm font-medium rounded-md hover:bg-noir/90 transition-colors disabled:opacity-60"
              >
                {submitting ? "Enviando..." : "Confirmar ausência"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RsvpPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RsvpForm slug={params.slug} />
    </Suspense>
  );
}
