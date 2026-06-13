import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY não configurada");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" })
  : null as unknown as Stripe;

export const PLANS = {
  free: {
    id: "free",
    name: "Gratuito",
    price: 0,
    priceLabel: "R$ 0",
    period: "para sempre",
    features: [
      "1 template de site",
      "Até 50 convidados",
      "Lista de presentes (Pix direto)",
      "Link de RSVP",
    ],
    limits: { guests: 50, templates: 1 },
    cta: "Plano atual",
    highlighted: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 2990,
    priceLabel: "R$ 29,90",
    period: "por mês",
    features: [
      "4 templates exclusivos",
      "Convidados ilimitados",
      "Lista de presentes (Pix direto)",
      "RSVP personalizado",
      "Foto de capa customizada",
      "Suporte prioritário",
    ],
    limits: { guests: Infinity, templates: 4 },
    cta: "Assinar Pro",
    highlighted: true,
    priceId: process.env.STRIPE_PRICE_PRO,
  },
} as const;

export type PlanId = keyof typeof PLANS;
