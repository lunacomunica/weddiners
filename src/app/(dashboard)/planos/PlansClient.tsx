"use client";

import { useState } from "react";
import { PLANS } from "@/lib/stripe";

interface Props {
  currentPlan: "free" | "pro";
  subscriptionStatus: string;
  hasCustomer: boolean;
}

export function PlansClient({ currentPlan, subscriptionStatus, hasCustomer: _hasCustomer }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setLoading("checkout");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(null);
  }

  async function handlePortal() {
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(null);
  }

  const isPro = currentPlan === "pro" && subscriptionStatus === "active";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Status banner */}
      {isPro && (
        <div className="mb-8 flex items-center justify-between bg-moss/10 border border-moss/20 rounded-lg px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="font-body text-sm font-medium text-moss">Plano Pro ativo</p>
          </div>
          <button
            onClick={handlePortal}
            disabled={loading === "portal"}
            className="font-body text-xs text-smoke hover:text-noir underline"
          >
            {loading === "portal" ? "Abrindo..." : "Gerenciar assinatura"}
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.values(PLANS).map((plan) => {
          const isCurrentPlan = plan.id === currentPlan && (plan.id === "free" || isPro);

          return (
            <div
              key={plan.id}
              className={[
                "rounded-xl border p-7 flex flex-col",
                plan.highlighted
                  ? "border-moss bg-moss text-white shadow-lg shadow-moss/20"
                  : "border-noir/8 bg-white",
              ].join(" ")}
            >
              {plan.highlighted && (
                <span className="self-start text-[10px] font-body font-semibold tracking-widest uppercase bg-white/20 text-white px-2.5 py-1 rounded-full mb-4">
                  Mais popular
                </span>
              )}

              <p className={["font-display text-2xl font-bold mb-1", plan.highlighted ? "text-white" : "text-noir"].join(" ")}>
                {plan.name}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className={["font-display text-4xl font-bold", plan.highlighted ? "text-white" : "text-noir"].join(" ")}>
                  {plan.priceLabel}
                </span>
                <span className={["font-body text-sm", plan.highlighted ? "text-white/60" : "text-smoke"].join(" ")}>
                  /{plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={["mt-0.5 shrink-0", plan.highlighted ? "text-white/80" : "text-moss"].join(" ")}
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={["font-body text-sm", plan.highlighted ? "text-white/85" : "text-smoke"].join(" ")}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <button
                  disabled
                  className="w-full py-3 rounded-md font-body text-sm font-medium border border-noir/15 text-smoke cursor-default"
                >
                  {isCurrentPlan ? "Plano atual" : "Gratuito"}
                </button>
              ) : isCurrentPlan ? (
                <button
                  onClick={handlePortal}
                  disabled={loading === "portal"}
                  className="w-full py-3 rounded-md font-body text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  {loading === "portal" ? "Abrindo..." : "Gerenciar assinatura"}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "")}
                  disabled={loading === "checkout"}
                  className="w-full py-3 rounded-md font-body text-sm font-medium bg-white text-moss hover:bg-ivory transition-colors"
                >
                  {loading === "checkout" ? "Redirecionando..." : plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ mínimo */}
      <div className="mt-12 border-t pt-8" style={{ borderColor: "rgba(13,10,11,0.07)" }}>
        <h3 className="font-display text-lg text-noir mb-4">Perguntas frequentes</h3>
        <div className="space-y-4">
          {[
            {
              q: "O Pix vai direto para minha conta?",
              a: "Sim! A Weddiners nunca toca no seu dinheiro. O pagamento vai diretamente da pessoa para sua chave Pix.",
            },
            {
              q: "Posso cancelar quando quiser?",
              a: "Sim. Acesse 'Gerenciar assinatura' e cancele com um clique. Você mantém o acesso Pro até o fim do período pago.",
            },
            {
              q: "Preciso de cartão de crédito para o plano gratuito?",
              a: "Não! O plano gratuito não exige nenhum dado de pagamento.",
            },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-lg border p-4" style={{ borderColor: "rgba(13,10,11,0.07)" }}>
              <p className="font-body text-sm font-medium text-noir mb-1">{item.q}</p>
              <p className="font-body text-sm text-smoke">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
