import { getCouple } from "@/lib/getCouple";
import { Header } from "@/components/dashboard/Header";
import { MessagesList } from "./MessagesList";

export default async function RecadosPage() {
  const { supabase, couple } = await getCouple();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, guest_name, message, approved, created_at")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header
        title="Mural de Recados"
        subtitle="Mensagens deixadas pelos seus convidados"
      />
      <div className="p-4 md:p-8">
        <MessagesList messages={messages ?? []} coupleId={couple.id} />
      </div>
    </>
  );
}
