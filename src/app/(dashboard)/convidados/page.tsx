import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { GuestsList } from "./GuestsList";
import { GuestsToolbar } from "./GuestsToolbar";

export default async function ConvidadosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug, plan")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("couple_id", couple.id)
    .order("name", { ascending: true });

  const list = guests ?? [];
  const stats = {
    total: list.length,
    confirmed: list.filter(g => g.rsvp_status === "confirmed").length,
    pending: list.filter(g => g.rsvp_status === "pending").length,
    declined: list.filter(g => g.rsvp_status === "declined").length,
  };

  return (
    <>
      <Header title="Convidados" subtitle="Gerencie a lista de convidados do seu casamento" />
      <div className="p-4 md:p-8">
        <GuestsToolbar stats={stats} slug={couple.slug} guests={list} plan={(couple.plan ?? "free") as "free" | "pro"} />
        <GuestsList guests={list} slug={couple.slug} />
      </div>
    </>
  );
}
