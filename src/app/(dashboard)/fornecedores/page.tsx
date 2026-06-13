import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { FornecedoresView } from "./FornecedoresView";
import { BudgetWidget } from "./BudgetWidget";

export default async function FornecedoresPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, total_budget")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  const [{ data: vendors }, { data: quotes }, { data: payments }] = await Promise.all([
    supabase
      .from("vendors")
      .select("id, name, category, status, contact_name, phone, site, notes, contracted_value, contract_url, payment_method")
      .eq("couple_id", couple.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quotes")
      .select("id, vendor_id, title, value, includes, valid_until, chosen")
      .eq("couple_id", couple.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("vendor_payments")
      .select("id, vendor_id, installment_number, amount, due_date, paid, paid_at")
      .eq("couple_id", couple.id)
      .order("due_date", { ascending: true }),
  ]);

  // Total comprometido = soma dos fornecedores contratados
  const committed = (vendors ?? [])
    .filter(v => v.status === "contratado")
    .reduce((sum, v) => sum + Number(v.contracted_value ?? 0), 0);

  const fornecedores = (vendors ?? []).map(v => ({
    id: v.id,
    nome: v.name,
    categoria: v.category,
    status: v.status as "avaliando" | "contratado" | "descartado",
    contato: v.contact_name ?? "",
    telefone: v.phone ?? "",
    site: v.site ?? undefined,
    notas: v.notes ?? undefined,
    valorContratado: v.contracted_value ? Number(v.contracted_value) : undefined,
    contratoUrl: v.contract_url ?? undefined,
    orcamentos: (quotes ?? [])
      .filter(q => q.vendor_id === v.id)
      .map(q => ({
        id: q.id,
        titulo: q.title,
        valor: Number(q.value),
        inclui: q.includes ?? "",
        validade: q.valid_until ?? "",
        escolhido: q.chosen,
      })),
    formaPagamento: v.payment_method ?? undefined,
    parcelas: (payments ?? [])
      .filter(p => p.vendor_id === v.id)
      .map(p => ({
        id: p.id,
        numero: p.installment_number,
        valor: Number(p.amount),
        vencimento: p.due_date,
        pago: p.paid,
        pagoEm: p.paid_at ? p.paid_at.slice(0, 10) : undefined,
      })),
  }));

  return (
    <>
      <Header title="Fornecedores" subtitle="Gerencie os fornecedores do seu casamento" />
      <div className="p-4 md:p-8">
        <BudgetWidget
          totalBudget={couple.total_budget ? Number(couple.total_budget) : null}
          committed={committed}
        />
        <FornecedoresView initialFornecedores={fornecedores} />
      </div>
    </>
  );
}
