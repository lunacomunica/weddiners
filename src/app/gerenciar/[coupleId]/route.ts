import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: { coupleId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cerimonialista") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Verifica que a cerimonialista tem acesso ativo a esse casal
  const { data: link } = await supabase
    .from("couple_cerimonialistas")
    .select("id")
    .eq("couple_id", params.coupleId)
    .eq("cerimonialista_id", user.id)
    .eq("status", "active")
    .single();

  if (!link) return NextResponse.redirect(new URL("/cerimonialista", req.url));

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set("cerim_managing", params.coupleId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return response;
}
