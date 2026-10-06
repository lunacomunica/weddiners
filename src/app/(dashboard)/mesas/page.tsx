import { getCouple } from "@/lib/getCouple";
import { Header } from "@/components/dashboard/Header";
import { TablesManager } from "./TablesManager";

export default async function MesasPage() {
  const { supabase, user, couple } = await getCouple();

  const [{ data: tables }, { data: guests }] = await Promise.all([
    supabase
      .from("tables")
      .select("id, name, capacity, created_at")
      .eq("couple_id", couple.id)
      .order("name", { ascending: true }),
    supabase
      .from("guests")
      .select("id, name, rsvp_status, table_id")
      .eq("couple_id", couple.id)
      .order("name", { ascending: true }),
  ]);

  return (
    <>
      <Header title="Mesas" subtitle="Organize os convidados nas mesas do casamento" />
      <div className="p-4 md:p-8">
        <TablesManager tables={tables ?? []} guests={guests ?? []} />
      </div>
    </>
  );
}
