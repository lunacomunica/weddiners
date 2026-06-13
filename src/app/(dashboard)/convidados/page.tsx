import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { GuestsList } from "./GuestsList";
import { GuestsToolbar } from "./GuestsToolbar";
import { GroupsPanel } from "./GroupsPanel";

export default async function ConvidadosPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug, plan")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

  const [{ data: guests }, { data: groups }] = await Promise.all([
    supabase
      .from("guests")
      .select("*")
      .eq("couple_id", couple.id)
      .order("name", { ascending: true }),
    supabase
      .from("guest_groups")
      .select("id, name, token")
      .eq("couple_id", couple.id)
      .order("name"),
  ]);

  const list = guests ?? [];
  const stats = {
    total: list.length,
    confirmed: list.filter(g => g.rsvp_status === "confirmed").length,
    pending: list.filter(g => g.rsvp_status === "pending").length,
    declined: list.filter(g => g.rsvp_status === "declined").length,
  };

  const tab = searchParams.tab === "grupos" ? "grupos" : "lista";

  return (
    <>
      <Header title="Convidados" subtitle="Gerencie a lista de convidados do seu casamento" />
      <div className="p-4 md:p-8">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-6 w-fit" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <a
            href="?tab=lista"
            className={["px-5 py-2 rounded-lg font-body text-sm font-medium transition-all", tab === "lista" ? "bg-moss text-white" : "text-smoke hover:text-noir"].join(" ")}
          >
            Lista
          </a>
          <a
            href="?tab=grupos"
            className={["px-5 py-2 rounded-lg font-body text-sm font-medium transition-all", tab === "grupos" ? "bg-moss text-white" : "text-smoke hover:text-noir"].join(" ")}
          >
            Grupos & Links
          </a>
        </div>

        {tab === "lista" ? (
          <>
            <GuestsToolbar stats={stats} slug={couple.slug} guests={list} plan={(couple.plan ?? "free") as "free" | "pro"} />
            <GuestsList guests={list} slug={couple.slug} />
          </>
        ) : (
          <GroupsPanel
            groups={groups ?? []}
            guests={list.map(g => ({
              id: g.id,
              name: g.name,
              guest_type: g.guest_type ?? "adulto",
              child_age: g.child_age ?? null,
              group_id: g.group_id ?? null,
            }))}
            slug={couple.slug}
          />
        )}
      </div>
    </>
  );
}
