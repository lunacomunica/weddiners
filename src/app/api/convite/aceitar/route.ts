import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { token, coupleId, userId } = await request.json();

  if (!token || !coupleId || !userId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Usa service role para ter permissão de escrita irrestrita
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verifica o convite
  const { data: invite } = await supabase
    .from("couple_invites")
    .select("id, couple_id, used")
    .eq("token", token)
    .eq("used", false)
    .single();

  if (!invite || invite.couple_id !== coupleId) {
    return NextResponse.json({ error: "Convite inválido" }, { status: 400 });
  }

  // Adiciona como membro (ignora se já existe)
  await supabase
    .from("couple_members")
    .upsert({ couple_id: coupleId, user_id: userId, role: "member" }, { onConflict: "couple_id,user_id" });

  // Marca convite como usado
  await supabase
    .from("couple_invites")
    .update({ used: true })
    .eq("id", invite.id);

  return NextResponse.json({ success: true });
}
