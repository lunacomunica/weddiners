import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { GiftsListWrapper } from "./GiftsListWrapper";
import { PixSection } from "./PixSection";

export default async function PresentesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("id, pix_key, pix_key_type, pix_holder_name")
    .eq("user_id", user.id)
    .single();

  if (!couple) redirect("/login");

  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("couple_id", couple.id)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <Header title="Lista de Presentes" subtitle="Gerencie os presentes do seu casamento" />
      <div className="p-4 md:p-8">
        <GiftsListWrapper gifts={gifts ?? []} />
        <PixSection
          pixKey={couple.pix_key}
          pixKeyType={couple.pix_key_type}
          pixHolderName={couple.pix_holder_name}
        />
      </div>
    </>
  );
}
