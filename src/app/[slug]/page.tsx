import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Classico } from "./templates/Classico";
import { Romantico } from "./templates/Romantico";
import { Moderno } from "./templates/Moderno";
import { Rustico } from "./templates/Rustico";
import type { TemplateConfig } from "./templates/types";

export default async function WeddingPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug, bride_name, groom_name, partner1_name, partner2_name, wedding_date, wedding_location")
    .eq("slug", params.slug)
    .single();

  if (!couple) notFound();

  const [{ data: config }, { data: messagesData }] = await Promise.all([
    supabase.from("site_configs").select("*").eq("couple_id", couple.id).single(),
    supabase.from("messages").select("id, guest_name, message, created_at").eq("couple_id", couple.id).eq("approved", true).order("created_at", { ascending: false }),
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

  return templates[template] ?? templates.classico;
}
