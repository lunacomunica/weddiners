import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/(auth)/login/actions";

export default async function CerimonialistaLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "cerimonialista") redirect("/dashboard");

  const displayName = profile.display_name || user.email?.split("@")[0] || "Cerimonialista";

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-100 h-14 flex items-center px-6 gap-4">
        <Link href="/cerimonialista" className="font-display text-xl text-noir tracking-wide">
          Weddiners
        </Link>
        <span className="text-neutral-300 text-sm">·</span>
        <span className="text-xs font-medium text-sage bg-sage/10 px-2.5 py-1 rounded-full">
          Cerimonialista
        </span>
        <div className="flex-1" />
        <span className="text-sm text-smoke hidden md:block">{displayName}</span>
        <form action={signOut}>
          <button type="submit" className="text-xs text-smoke hover:text-noir transition-colors border border-neutral-200 rounded-lg px-3 py-1.5">
            Sair
          </button>
        </form>
      </nav>

      <main className="pt-14">{children}</main>
    </div>
  );
}
