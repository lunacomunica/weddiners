"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCoupleId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("couples").select("id").eq("user_id", user.id).single();
  return data?.id ?? null;
}

// Mapa de categoria do fornecedor → categoria do checklist + palavra-chave no título
const VENDOR_CHECKLIST_MAP: Record<string, { checklistCategory: string; keyword: string }[]> = {
  local:        [{ checklistCategory: "local",     keyword: "reservar" }],
  buffet:       [{ checklistCategory: "buffet",    keyword: "contratar" }],
  foto:         [{ checklistCategory: "foto",      keyword: "contratar" }],
  musica:       [{ checklistCategory: "musica",    keyword: "contratar" }],
  vestuario:    [{ checklistCategory: "vestuario", keyword: "contratar" }],
  floricultura: [{ checklistCategory: "local",     keyword: "decorador" }],
  beleza:       [{ checklistCategory: "beleza",    keyword: "contratar" }],
  convites:     [{ checklistCategory: "convites",  keyword: "contratar" }],
  transporte:   [{ checklistCategory: "outros",    keyword: "transporte" }],
};

// Marca automaticamente os itens do checklist correspondentes quando um fornecedor é contratado
async function syncChecklistOnContract(
  supabase: ReturnType<typeof createClient>,
  coupleId: string,
  vendorCategory: string
) {
  const rules = VENDOR_CHECKLIST_MAP[vendorCategory];
  if (!rules?.length) return;

  for (const rule of rules) {
    // Busca itens pendentes da categoria correspondente
    const { data: items } = await supabase
      .from("checklist_items")
      .select("id, title")
      .eq("couple_id", coupleId)
      .eq("category", rule.checklistCategory)
      .eq("done", false);

    if (!items?.length) continue;

    // Filtra os que têm a palavra-chave no título (case insensitive)
    const toMark = items
      .filter(i => i.title.toLowerCase().includes(rule.keyword.toLowerCase()))
      .map(i => i.id);

    if (!toMark.length) continue;

    await supabase
      .from("checklist_items")
      .update({ done: true, updated_at: new Date().toISOString() })
      .in("id", toMark);
  }

  revalidatePath("/planejamento");
}

// ─── Vendors ────────────────────────────────────────────────────────────────

export async function createVendor(data: {
  name: string; category: string; status: string;
  contactName: string; phone: string; site?: string;
  notes?: string; contractedValue?: number;
}) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase.from("vendors").insert({
    couple_id: coupleId,
    name: data.name,
    category: data.category,
    status: data.status,
    contact_name: data.contactName,
    phone: data.phone,
    site: data.site ?? null,
    notes: data.notes ?? null,
    contracted_value: data.contractedValue ?? null,
  });

  if (error) return { error: error.message };

  if (data.status === "contratado") {
    await syncChecklistOnContract(supabase, coupleId, data.category);
  }

  revalidatePath("/fornecedores");
  return { success: true };
}

export async function updateVendor(id: string, data: {
  name: string; category: string; status: string;
  contactName: string; phone: string; site?: string;
  notes?: string; contractedValue?: number;
}) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("vendors")
    .update({
      name: data.name,
      category: data.category,
      status: data.status,
      contact_name: data.contactName,
      phone: data.phone,
      site: data.site ?? null,
      notes: data.notes ?? null,
      contracted_value: data.contractedValue ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };

  if (data.status === "contratado") {
    await syncChecklistOnContract(supabase, coupleId, data.category);
  }

  revalidatePath("/fornecedores");
  return { success: true };
}

export async function uploadContract(vendorId: string, formData: FormData) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const file = formData.get("file") as File;
  if (!file) return { error: "Arquivo não encontrado" };

  const ext = file.name.split(".").pop();
  const path = `${coupleId}/${vendorId}/contrato.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("contracts")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("contracts").getPublicUrl(path);

  await supabase.from("vendors").update({ contract_url: publicUrl }).eq("id", vendorId).eq("couple_id", coupleId);

  revalidatePath("/fornecedores");
  return { success: true, url: publicUrl };
}

export async function deleteVendor(id: string) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("vendors")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}

// ─── Quotes ─────────────────────────────────────────────────────────────────

export async function createQuote(vendorId: string, data: {
  title: string; value: number; includes?: string; validUntil?: string;
}) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase.from("quotes").insert({
    vendor_id: vendorId,
    couple_id: coupleId,
    title: data.title,
    value: data.value,
    includes: data.includes ?? null,
    valid_until: data.validUntil ?? null,
    chosen: false,
  });

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}

export async function chooseQuote(quoteId: string, vendorId: string, value: number) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  // Busca a categoria do fornecedor antes de atualizar
  const { data: vendor } = await supabase
    .from("vendors")
    .select("category")
    .eq("id", vendorId)
    .single();

  // Desmarca orçamentos anteriores, marca o escolhido e atualiza o fornecedor
  await Promise.all([
    supabase.from("quotes").update({ chosen: false }).eq("vendor_id", vendorId).eq("couple_id", coupleId),
    supabase.from("quotes").update({ chosen: true }).eq("id", quoteId).eq("couple_id", coupleId),
    supabase.from("vendors").update({
      status: "contratado",
      contracted_value: value,
      updated_at: new Date().toISOString(),
    }).eq("id", vendorId).eq("couple_id", coupleId),
  ]);

  // Sincroniza o checklist automaticamente
  if (vendor?.category) {
    await syncChecklistOnContract(supabase, coupleId, vendor.category);
  }

  revalidatePath("/fornecedores");
  return { success: true };
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export async function updateTotalBudget(totalBudget: number) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("couples")
    .update({ total_budget: totalBudget, updated_at: new Date().toISOString() })
    .eq("id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}

// ─── Payments / Parcelas ────────────────────────────────────────────────────

export async function setPaymentMethod(vendorId: string, formaPagamento: string) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("vendors")
    .update({ payment_method: formaPagamento, updated_at: new Date().toISOString() })
    .eq("id", vendorId)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}

export async function createInstallment(vendorId: string, data: {
  numero: number; valor: number; vencimento: string;
}) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { data: row, error } = await supabase
    .from("vendor_payments")
    .insert({
      vendor_id: vendorId,
      couple_id: coupleId,
      installment_number: data.numero,
      amount: data.valor,
      due_date: data.vencimento,
      paid: false,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true, id: row?.id };
}

export async function updateInstallment(id: string, data: { valor: number; vencimento: string }) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("vendor_payments")
    .update({ amount: data.valor, due_date: data.vencimento })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}

export async function toggleInstallmentPaid(id: string, paid: boolean) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("vendor_payments")
    .update({ paid, paid_at: paid ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}

export async function deleteInstallment(id: string) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  await supabase.from("vendor_payments").delete().eq("id", id).eq("couple_id", coupleId);
  revalidatePath("/fornecedores");
  return { success: true };
}

export async function deleteQuote(id: string) {
  const supabase = createClient();
  const coupleId = await getCoupleId();
  if (!coupleId) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };
  revalidatePath("/fornecedores");
  return { success: true };
}
