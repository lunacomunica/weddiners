import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { PlansClient } from "./PlansClient";

export default async function PlanosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("plan, subscription_status, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <Header title="Planos" subtitle="Escolha o plano ideal para o seu casamento" />
      <div className="p-4 md:p-8">
        <PlansClient
          currentPlan={(couple?.plan ?? "free") as "free" | "pro"}
          subscriptionStatus={couple?.subscription_status ?? "inactive"}
          hasCustomer={!!couple?.stripe_customer_id}
        />
      </div>
    </>
  );
}
