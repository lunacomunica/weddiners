import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: couple } = await supabase
    .from("couples")
    .select("id, stripe_customer_id, bride_name, groom_name")
    .eq("user_id", user.id)
    .single();
  if (!couple) return NextResponse.json({ error: "Casal não encontrado" }, { status: 404 });

  const { priceId } = await req.json();
  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  let customerId = couple.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${couple.bride_name} & ${couple.groom_name}`,
      metadata: { couple_id: couple.id },
    });
    customerId = customer.id;
    await supabase.from("couples").update({ stripe_customer_id: customerId }).eq("id", couple.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/planos?success=1`,
    cancel_url: `${origin}/planos?canceled=1`,
    metadata: { couple_id: couple.id },
    locale: "pt-BR",
  });

  return NextResponse.json({ url: session.url });
}
