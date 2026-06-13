import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/dashboard/Header";
import { redirect } from "next/navigation";
import { CountdownWidget } from "@/components/dashboard/widgets/CountdownWidget";
import { GiftsWidget } from "@/components/dashboard/widgets/GiftsWidget";
import { GuestsWidget } from "@/components/dashboard/widgets/GuestsWidget";
import { SiteWidget } from "@/components/dashboard/widgets/SiteWidget";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!couple) redirect("/login");

  const { data: gifts } = await supabase
    .from("gifts")
    .select("amount, received_amount, is_received")
    .eq("couple_id", couple.id);

  const { data: guests } = await supabase
    .from("guests")
    .select("rsvp_status")
    .eq("couple_id", couple.id);

  const totalGifts = gifts?.reduce((sum, g) => sum + (g.is_received ? Number(g.amount) : 0), 0) ?? 0;
  const guestStats = {
    confirmed: guests?.filter(g => g.rsvp_status === "confirmed").length ?? 0,
    pending: guests?.filter(g => g.rsvp_status === "pending").length ?? 0,
    declined: guests?.filter(g => g.rsvp_status === "declined").length ?? 0,
    total: guests?.length ?? 0,
  };

  return (
    <>
      <Header
        title={`Olá, ${couple.bride_name}`}
        subtitle="Aqui está o resumo do seu casamento"
      />
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CountdownWidget weddingDate={couple.wedding_date} />
          <GiftsWidget total={totalGifts} count={gifts?.filter(g => g.is_received).length ?? 0} />
          <GuestsWidget stats={guestStats} />
          <SiteWidget slug={couple.slug} />
        </div>
      </div>
    </>
  );
}
