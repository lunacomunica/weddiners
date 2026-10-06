import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { ConfigSection } from "./ConfigSection";
import { InvitePartnerSection } from "./InvitePartnerSection";
import { InviteCerimonialistaSection } from "./InviteCerimonialistaSection";

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, bride_name, groom_name, partner1_name, partner2_name, wedding_date, wedding_location, avatar_url")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  // Cerimonialistas vinculadas
  const { data: cerimLinks } = await supabase
    .from("couple_cerimonialistas")
    .select("id, status, profiles(display_name, email)")
    .eq("couple_id", couple.id);

  const links = (cerimLinks ?? []).map(l => ({
    id: l.id,
    status: l.status as "pending" | "active",
    cerimonialista_name: (l.profiles as unknown as { display_name: string | null; email: string | null } | null)?.display_name ?? null,
    cerimonialista_email: (l.profiles as unknown as { display_name: string | null; email: string | null } | null)?.email ?? null,
  }));

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie os dados da sua conta e do casamento" />
      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        <ConfigSection couple={couple} email={user.email ?? ""} avatarUrl={couple?.avatar_url ?? null} />
        <InvitePartnerSection />
        <InviteCerimonialistaSection links={links} />
      </div>
    </>
  );
}
