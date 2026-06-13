"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitGroupRsvp } from "../actions";

interface GuestItem {
  id: string;
  name: string;
  guest_type: "adulto" | "crianca" | null;
  child_age: number | null;
  dietary_restrictions: string | null;
  rsvp_status: string;
}

interface Group {
  id: string;
  name: string;
  token: string;
}

interface Couple {
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  wedding_location: string | null;
}

function GroupRsvpForm({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [group, setGroup] = useState<Group | null>(null);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dietaries, setDietaries] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    async function load() {
      const supabase = createClient();

      const [{ data: coupleData }, { data: groupData }] = await Promise.all([
        supabase.from("couples").select("partner1_name, partner2_name, wedding_date, wedding_location").eq("slug", slug).single(),
        supabase.from("guest_groups").select("id, name, token").eq("token", token).single(),
      ]);

      if (coupleData) setCouple(coupleData);
      if (groupData) {
        setGroup(groupData);
        const { data: guestData } = await supabase
          .from("guests")
          .select("id, name, guest_type, child_age, dietary_restrictions, rsvp_status")
          .eq("group_id", groupData.id)
          .order("name");

        if (guestData) {
          setGuests(guestData);
          // Pre-check já confirmados
          const initChecked: Record<string, boolean> = {};
          const initDietaries: Record<string, string> = {};
          guestData.forEach(g => {
            initChecked[g.id] = g.rsvp_status === "confirmed";
            initDietaries[g.id] = g.dietary_restrictions ?? "";
          });
          setChecked(initChecked);
          setDietaries(initDietaries);
        }
      }
      setLoading(false);
    }
    load();
  }, [slug, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    setSubmitting(true);
    setError("");

    const confirmados = Object.entries(checked).filter(([, v]) => v).map(([id]) => id);
    const declinados = guests.map(g => g.id).filter(id => !checked[id]);

    const result = await submitGroupRsvp({
      groupToken: group.token,
      confirmados,
      declinados,
      dietaries,
      message,
    });

    if (result?.error) { setError(result.error); setSubmitting(false); }
    else setSubmitted(true);
  }

  const weddingDate = couple?.wedding_date
    ? new Date(couple.wedding_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!token || !group) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="text-center">
        <p className="text-2xl mb-2">😕</p>
        <p className="text-noir font-display text-xl">Link inválido</p>
        <p className="text-smoke font-body text-sm mt-1">Este link de confirmação não é válido.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" fill="none" stroke="#7A8C6A" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="font-display text-3xl text-noir mb-2">Confirmado! 🎉</h2>
        <p className="text-smoke font-body text-sm">
          Recebemos a confirmação de <strong>{group.name}</strong>. Mal podemos esperar para celebrar com vocês!
        </p>
        {couple && (
          <p className="text-xs text-smoke/60 font-body mt-4">
            {couple.partner1_name} & {couple.partner2_name}
            {weddingDate ? ` · ${weddingDate}` : ""}
          </p>
        )}
      </div>
    </div>
  );

  const confirmedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 w-full max-w-md">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-neutral-100">
          <p className="text-smoke font-body text-sm mb-1">Confirmação de presença</p>
          <h1 className="font-display text-3xl text-noir">{group.name}</h1>
          {couple && (
            <p className="text-smoke font-body text-sm mt-2">
              Casamento de <strong>{couple.partner1_name} & {couple.partner2_name}</strong>
              {weddingDate ? <><br/><span className="text-xs capitalize">{weddingDate}</span></> : ""}
              {couple.wedding_location ? <><br/><span className="text-xs">{couple.wedding_location}</span></> : ""}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

          {/* Lista de convidados com checkbox */}
          <div>
            <p className="text-sm font-semibold text-noir font-body mb-1">Quem vai comparecer?</p>
            <p className="text-xs text-smoke font-body mb-4">Marque as pessoas que vão estar presentes.</p>

            <div className="space-y-3">
              {guests.map(g => (
                <div
                  key={g.id}
                  onClick={() => setChecked(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                  className={["rounded-xl border p-4 transition-all cursor-pointer select-none", checked[g.id] ? "border-emerald-400 bg-emerald-50/60" : "border-neutral-200 hover:border-neutral-300"].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className={["w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all", checked[g.id] ? "bg-emerald-500" : "border-2 border-neutral-300"].join(" ")}>
                      {checked[g.id] && (
                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={["font-body font-medium text-sm transition-colors", checked[g.id] ? "text-emerald-800" : "text-noir"].join(" ")}>{g.name}</p>
                      <p className="text-xs text-smoke font-body">
                        {g.guest_type === "crianca" ? `👶 Criança${g.child_age != null ? ` · ${g.child_age} anos` : ""}` : "🧑 Adulto"}
                      </p>
                    </div>
                    {checked[g.id] && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Vai! 🎉</span>
                    )}
                  </div>

                  {/* Campo de restrição alimentar por pessoa, visível quando confirmado */}
                  {checked[g.id] && (
                    <div className="mt-3 pl-10" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Restrição alimentar (opcional)"
                        value={dietaries[g.id] ?? ""}
                        onChange={e => setDietaries(prev => ({ ...prev, [g.id]: e.target.value }))}
                        className="w-full text-xs border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 font-body bg-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {confirmedCount > 0 && (
              <p className="text-xs text-sage font-medium font-body mt-3">
                {confirmedCount} de {guests.length} {confirmedCount === 1 ? "pessoa confirmada" : "pessoas confirmadas"}
              </p>
            )}
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-semibold text-noir font-body mb-2">Mensagem para o casal <span className="text-smoke font-normal">(opcional)</span></label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Deixe um recado carinhoso..."
              className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-body">{error}</p>}

          <button
            type="submit"
            disabled={submitting || guests.length === 0}
            className="btn-primary w-full py-4 text-base disabled:opacity-50"
          >
            {submitting ? "Confirmando..." : confirmedCount === 0 ? "Confirmar que não vamos ir" : `Confirmar ${confirmedCount} presença${confirmedCount > 1 ? "s" : ""}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GroupRsvpPage() {
  const params = useParams();
  const slug = params.slug as string;
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center"><div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin"/></div>}>
      <GroupRsvpForm slug={slug} />
    </Suspense>
  );
}
