import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature inválida" }, { status: 400 });
  }

  const supabase = createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const coupleId = session.metadata?.couple_id;
      if (coupleId && session.subscription) {
        await supabase.from("couples").update({
          plan: "pro",
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
        }).eq("id", coupleId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      if (!customer.deleted) {
        const coupleId = (customer as Stripe.Customer).metadata?.couple_id;
        if (coupleId) {
          await supabase.from("couples").update({
            subscription_status: sub.status,
            plan: sub.status === "active" ? "pro" : "free",
          }).eq("id", coupleId);
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      if (!customer.deleted) {
        const coupleId = (customer as Stripe.Customer).metadata?.couple_id;
        if (coupleId) {
          await supabase.from("couples").update({
            plan: "free",
            stripe_subscription_id: null,
            subscription_status: "canceled",
          }).eq("id", coupleId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
