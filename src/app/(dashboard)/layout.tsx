import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let displayName = "";

  if (user) {
    const { data: couple } = await supabase
      .from("couples")
      .select("partner1_name, bride_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    avatarUrl = couple?.avatar_url ?? null;
    displayName = couple?.partner1_name || couple?.bride_name || user.email?.split("@")[0] || "";
  }

  return (
    <div className="min-h-screen bg-ivory flex">
      <Sidebar avatarUrl={avatarUrl} displayName={displayName} />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
