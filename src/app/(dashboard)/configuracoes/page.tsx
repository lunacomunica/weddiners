import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { ConfigSection } from "./ConfigSection";

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("bride_name, groom_name, partner1_name, partner2_name, wedding_date, wedding_location, avatar_url")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie os dados da sua conta e do casamento" />
      <div className="p-4 md:p-8 max-w-2xl">
        <ConfigSection couple={couple} email={user.email ?? ""} avatarUrl={couple?.avatar_url ?? null} />
      </div>
    </>
  );
}
