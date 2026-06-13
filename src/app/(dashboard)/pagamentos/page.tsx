import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { PagamentosView } from "./PagamentosView";

export default async function PagamentosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, total_budget")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  const [{ data: vendors }, { data: payments }] = await Promise.all([
    supabase
      .from("vendors")
      .select("id, name, category, contracted_value, payment_method")
      .eq("couple_id", couple.id)
      .eq("status", "contratado"),
    supabase
      .from("vendor_payments")
      .select("id, vendor_id, installment_number, amount, due_date, paid, paid_at")
      .eq("couple_id", couple.id)
      .order("due_date", { ascending: true }),
  ]);

  const totalBudget = couple.total_budget ? Number(couple.total_budget) : null;
  const totalContratado = (vendors ?? []).reduce((s, v) => s + Number(v.contracted_value ?? 0), 0);
  const totalPago = (payments ?? []).filter(p => p.paid).reduce((s, p) => s + Number(p.amount), 0);
  const totalPendente = (payments ?? []).filter(p => !p.paid).reduce((s, p) => s + Number(p.amount), 0);

  const pagamentos = (payments ?? []).map(p => {
    const vendor = (vendors ?? []).find(v => v.id === p.vendor_id);
    return {
      id: p.id,
      vendorId: p.vendor_id,
      vendorName: vendor?.name ?? "—",
      vendorCategory: vendor?.category ?? "",
      numero: p.installment_number,
      valor: Number(p.amount),
      vencimento: p.due_date,
      pago: p.paid,
      pagoEm: p.paid_at ? p.paid_at.slice(0, 10) : undefined,
    };
  });

  return (
    <>
      <Header title="Pagamentos" subtitle="Visão geral das finanças do seu casamento" />
      <div className="p-4 md:p-8">
        <PagamentosView
          pagamentos={pagamentos}
          totalBudget={totalBudget}
          totalContratado={totalContratado}
          totalPago={totalPago}
          totalPendente={totalPendente}
        />
      </div>
    </>
  );
}
