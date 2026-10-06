import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let displayName = "";
  let cerimBanner: string | null = null; // nome do casal sendo gerenciado

  if (user) {
    // Verifica se é cerimonialista
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single();

    if (profile?.role === "cerimonialista") {
      const cookieStore = cookies();
      const managingId = cookieStore.get("cerim_managing")?.value;
      if (!managingId) redirect("/cerimonialista");

      const { data: couple } = await supabase
        .from("couples")
        .select("partner1_name, partner2_name, bride_name, groom_name, avatar_url")
        .eq("id", managingId)
        .single();

      if (!couple) redirect("/cerimonialista");

      avatarUrl = couple.avatar_url ?? null;
      const n1 = couple.partner1_name || couple.bride_name || "";
      const n2 = couple.partner2_name || couple.groom_name || "";
      displayName = n1;
      cerimBanner = n2 ? `${n1} & ${n2}` : n1;
    } else {
      const { data: couple } = await supabase
        .from("couples")
        .select("partner1_name, bride_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      avatarUrl = couple?.avatar_url ?? null;
      displayName = couple?.partner1_name || couple?.bride_name || user.email?.split("@")[0] || "";
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {cerimBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-sage text-white flex items-center justify-between px-4 md:px-6 py-2 text-xs font-medium shadow-sm">
          <span className="flex items-center gap-2">
            <span>🌸</span>
            <span>Gerenciando: <strong>{cerimBanner}</strong></span>
          </span>
          <Link
            href="/sair-gerenciamento"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair
          </Link>
        </div>
      )}
      <div className={["min-h-screen bg-ivory flex", cerimBanner ? "pt-8" : ""].join(" ")}>
        <Sidebar avatarUrl={avatarUrl} displayName={displayName} />
        <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
