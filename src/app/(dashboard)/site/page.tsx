import { getCouple } from "@/lib/getCouple";
import { SiteEditor } from "./SiteEditor";

export default async function SitePage() {
  const { supabase, couple } = await getCouple();

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
