import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { MessagesList } from "./MessagesList";

export default async function RecadosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();
  if (!couple) redirect("/login");

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
