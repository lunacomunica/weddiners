"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSiteConfig(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();
  if (!couple) return { error: "Casal não encontrado" };

  const [{ data: coupleCheck }, { data: currentConfig }] = await Promise.all([
    supabase.from("couples").select("plan").eq("user_id", user.id).single(),
    supabase.from("site_configs").select("show_about,show_rsvp,show_gifts,show_dresscode,show_schedule,show_directions,show_messages,section_order").eq("couple_id", couple.id).single(),
  ]);

  const plan = coupleCheck?.plan ?? "free";
  const template = formData.get("template") as string || "classico";
  const allowedTemplates = plan === "pro" ? ["classico", "romantico", "moderno", "rustico"] : ["classico"];
  const safeTemplate = allowedTemplates.includes(template) ? template : "classico";

  // Never override section visibility from Aparência/Conteúdo forms — that belongs to SectionsEditor only
  const updates = {
    hero_title: formData.get("hero_title") as string,
    hero_subtitle: formData.get("hero_subtitle") as string,
    about_text: formData.get("about_text") as string,
    cover_photo_url: formData.get("cover_photo_url") as string || null,
    palette: formData.get("palette") as string || "sage",
    template: safeTemplate,
    dresscode: formData.get("dresscode") as string || null,
    gifts_notice: formData.get("gifts_notice") as string || null,
    schedule: formData.get("schedule") as string || null,
    directions: formData.get("directions") as string || null,
    directions_url: formData.get("directions_url") as string || null,
    about_photo_url: formData.get("about_photo_url") as string || null,
    about_subtitle: formData.get("about_subtitle") as string || null,
    rsvp_subtitle: formData.get("rsvp_subtitle") as string || null,
    rsvp_text: formData.get("rsvp_text") as string || null,
    gifts_text: formData.get("gifts_text") as string || null,
    directions_subtitle: formData.get("directions_subtitle") as string || null,
    about_title: formData.get("about_title") as string || null,
    rsvp_title: formData.get("rsvp_title") as string || null,
    gifts_title: formData.get("gifts_title") as string || null,
    dresscode_title: formData.get("dresscode_title") as string || null,
    schedule_title: formData.get("schedule_title") as string || null,
    directions_title: formData.get("directions_title") as string || null,
    messages_title: formData.get("messages_title") as string || null,
    // Preserve existing section visibility
    show_about:      currentConfig?.show_about      ?? true,
    show_rsvp:       currentConfig?.show_rsvp       ?? true,
    show_gifts:      currentConfig?.show_gifts       ?? true,
    show_dresscode:  currentConfig?.show_dresscode   ?? false,
    show_schedule:   currentConfig?.show_schedule    ?? false,
    show_directions: currentConfig?.show_directions  ?? false,
    show_messages:   currentConfig?.show_messages    ?? false,
    section_order:   currentConfig?.section_order    ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("site_configs")
    .update(updates)
    .eq("couple_id", couple.id);

  if (error) return { error: error.message };

  revalidatePath("/site");
  revalidatePath(`/${couple.slug}`);
  return { success: true };
}

// Saves only palette + template + cover_photo — never touches content fields
export async function updateAppearance(palette: string, template: string, coverPhotoUrl: string | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();
  if (!couple) return { error: "Casal não encontrado" };

  const { data: coupleCheck } = await supabase.from("couples").select("plan").eq("user_id", user.id).single();
  const plan = coupleCheck?.plan ?? "free";
  const allowedTemplates = plan === "pro" ? ["classico", "romantico", "moderno", "rustico"] : ["classico"];
  const safeTemplate = allowedTemplates.includes(template) ? template : "classico";

  const { error } = await supabase
    .from("site_configs")
    .update({ palette, template: safeTemplate, cover_photo_url: coverPhotoUrl, updated_at: new Date().toISOString() })
    .eq("couple_id", couple.id);

  if (error) return { error: error.message };

  revalidatePath("/site");
  revalidatePath(`/${couple.slug}`);
  return { success: true };
}

export async function updateSections(
  order: string[],
  checked: Record<string, boolean>
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();
  if (!couple) return { error: "Casal não encontrado" };

  const { error } = await supabase
    .from("site_configs")
    .update({
      section_order: JSON.stringify(order),
      show_about: checked["about"] ?? true,
      show_rsvp: checked["rsvp"] ?? true,
      show_gifts: checked["gifts"] ?? true,
      show_dresscode: checked["dresscode"] ?? false,
      show_schedule: checked["schedule"] ?? false,
      show_directions: checked["directions"] ?? false,
      show_messages: checked["messages"] ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("couple_id", couple.id);

  if (error) return { error: error.message };

  revalidatePath("/site");
  revalidatePath(`/${couple.slug}`);
  return { success: true };
}

export async function updateSiteSettings(data: {
  passwordEnabled: boolean;
  password: string;
  translationsEnabled: boolean;
  translationLanguages: string[];
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("couples")
    .update({
      site_password_enabled: data.passwordEnabled,
      site_password: data.passwordEnabled && data.password.trim() ? data.password.trim() : null,
      translations_enabled: data.translationsEnabled,
      translation_languages: data.translationLanguages,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/site");
  return { success: true };
}

export async function updateCoupleInfo(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("couples")
    .update({
      partner1_name: formData.get("partner1_name") as string,
      partner2_name: formData.get("partner2_name") as string,
      wedding_date: formData.get("wedding_date") as string || null,
      wedding_location: formData.get("wedding_location") as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/site");
  return { success: true };
}
