import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Classico } from "./templates/Classico";
import { Romantico } from "./templates/Romantico";
import { Moderno } from "./templates/Moderno";
import { Rustico } from "./templates/Rustico";
import { PasswordGate } from "./PasswordGate";
import { EditModeClient } from "./EditModeClient";
import { FontInjector } from "./FontInjector";
import type { TemplateConfig } from "./templates/types";

// Cache de 5 minutos — o site público não precisa ser tempo real
export const revalidate = 300;

export default async function WeddingPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug, bride_name, groom_name, partner1_name, partner2_name, wedding_date, wedding_location, site_password_enabled, site_password, translations_enabled, translation_languages")
    .eq("slug", params.slug)
    .single();

  if (!couple) notFound();

  // Password gate
  if (couple.site_password_enabled && couple.site_password) {
    const cookieStore = cookies();
    const unlocked = cookieStore.get(`weddiners-unlock-${params.slug}`)?.value === "1";
    if (!unlocked) {
      return <PasswordGate slug={params.slug} couple={{ partner1_name: couple.partner1_name, partner2_name: couple.partner2_name }} />;
    }
  }

  const [{ data: config }, { data: messagesData }, { data: giftsData }] = await Promise.all([
    supabase.from("site_configs").select("*").eq("couple_id", couple.id).single(),
    supabase.from("messages").select("id, guest_name, message, created_at").eq("couple_id", couple.id).eq("approved", true).order("created_at", { ascending: false }),
    supabase.from("gifts").select("id, title, description, amount, image_url, category").eq("couple_id", couple.id).neq("is_received", true).order("created_at", { ascending: true }).limit(6),
  ]);

  const name1 = couple.partner1_name || couple.bride_name;
  const name2 = couple.partner2_name || couple.groom_name;

  const templateConfig: TemplateConfig = {
    name1,
    name2,
    heroTitle: config?.hero_title || `${name1} & ${name2}`,
    heroSubtitle: config?.hero_subtitle || (couple.wedding_date
      ? new Date(couple.wedding_date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
      : null),
    aboutText: config?.about_text || null,
    coverPhotoUrl: config?.cover_photo_url || null,
    weddingDate: couple.wedding_date || null,
    weddingLocation: couple.wedding_location || null,
    showGifts: config?.show_gifts !== false,
    showRsvp: config?.show_rsvp !== false,
    showAbout: config?.show_about !== false,
    dresscode: config?.dresscode || null,
    schedule: config?.schedule || null,
    directions: config?.directions || null,
    directionsUrl: config?.directions_url || null,
    showDresscode: config?.show_dresscode === true,
    showSchedule: config?.show_schedule === true,
    showDirections: config?.show_directions === true,
    showMessages: config?.show_messages === true,
    palette: config?.palette ?? null,
    aboutTitle: config?.about_title ?? "Nossa História",
    rsvpTitle: config?.rsvp_title ?? "Confirme sua Presença",
    giftsTitle: config?.gifts_title ?? "Lista de Presentes",
    dresscodeTitle: config?.dresscode_title ?? "Dress Code",
    scheduleTitle: config?.schedule_title ?? "Cronograma",
    directionsTitle: config?.directions_title ?? "Como Chegar",
    messagesTitle: config?.messages_title ?? "Mural de Recados",
    aboutPhotoUrl: config?.about_photo_url ?? null,
    aboutSubtitle: config?.about_subtitle ?? null,
    rsvpSubtitle: config?.rsvp_subtitle ?? null,
    rsvpText: config?.rsvp_text ?? null,
    giftsText: config?.gifts_text ?? null,
    directionsSubtitle: config?.directions_subtitle ?? null,
    giftsPreview: giftsData ?? [],
    translationsEnabled: !!couple.translations_enabled,
    translationLanguages: (couple.translation_languages as string[]) ?? [],
    typography: config?.typography ?? null,
    sectionOrder: (() => {
      try { return JSON.parse(config?.section_order ?? "null") ?? ["about","rsvp","gifts","dresscode","schedule","directions","messages"]; }
      catch { return ["about","rsvp","gifts","dresscode","schedule","directions","messages"]; }
    })(),
  };

  const messages = messagesData ?? [];
  const coupleRef = { id: couple.id, slug: couple.slug };
  const template = config?.template || "classico";

  const templates: Record<string, React.ReactNode> = {
    classico:  <Classico  couple={coupleRef} config={templateConfig} slug={params.slug} messages={messages} />,
    romantico: <Romantico couple={coupleRef} config={templateConfig} slug={params.slug} messages={messages} />,
    moderno:   <Moderno   couple={coupleRef} config={templateConfig} slug={params.slug} messages={messages} />,
    rustico:   <Rustico   couple={coupleRef} config={templateConfig} slug={params.slug} messages={messages} />,
  };

  return (
    <>
      <FontInjector typography={templateConfig.typography} />
      <EditModeClient />
      {templates[template] ?? templates.classico}
    </>
  );
}
