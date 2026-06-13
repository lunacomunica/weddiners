"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCoupleData(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("couples")
    .update({
      bride_name: formData.get("bride_name") as string,
      groom_name: formData.get("groom_name") as string,
      partner1_name: formData.get("partner1_name") as string || null,
      partner2_name: formData.get("partner2_name") as string || null,
      wedding_date: formData.get("wedding_date") as string || null,
      wedding_location: formData.get("wedding_location") as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não coincidem." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateEmail(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const email = formData.get("email") as string;
  if (!email) return { error: "E-mail inválido." };

  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: error.message };
  return { success: true, message: "Confirmação enviada para o novo e-mail." };
}
