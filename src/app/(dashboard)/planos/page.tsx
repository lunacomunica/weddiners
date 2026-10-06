import { requireNotCerim } from "@/lib/requireNotCerim";
import { getCouple } from "@/lib/getCouple";
import { Header } from "@/components/dashboard/Header";
import { PlansClient } from "./PlansClient";

export default async function PlanosPage() {
  requireNotCerim();
  const { couple } = await getCouple();


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
