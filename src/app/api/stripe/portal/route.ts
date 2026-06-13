import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: couple } = await supabase
    .from("couples")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!couple?.stripe_customer_id) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: couple.stripe_customer_id,
    return_url: `${origin}/planos`,
  });

  return NextResponse.json({ url: session.url });
}
