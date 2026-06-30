import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SiteEditor } from "./SiteEditor";

export default async function SitePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug, bride_name, groom_name, partner1_name, partner2_name, wedding_date, wedding_location, plan, site_password_enabled, site_password, translations_enabled, translation_languages")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  const { data: config } = await supabase
    .from("site_configs")
    .select("*")
    .eq("couple_id", couple.id)
    .single();

  const siteConfig = config ?? {
    hero_title: null,
    hero_subtitle: null,
    about_text: null,
    cover_photo_url: null,
    palette: "sage",
    show_gifts: true,
    show_rsvp: true,
    show_about: true,
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <SiteEditor config={siteConfig} couple={couple} plan={(couple.plan ?? "free") as "free" | "pro"} />
    </div>
  );
}
