import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const slug = searchParams.get("slug");

  if (!token || !slug) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const [{ data: coupleData }, { data: groupData }] = await Promise.all([
    supabase
      .from("couples")
      .select("partner1_name, partner2_name, wedding_date, wedding_location")
      .eq("slug", slug)
      .single(),
    supabase
      .from("guest_groups")
      .select("id, name, token")
      .eq("token", token)
      .single(),
  ]);

  if (!groupData) {
    return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
  }

  const { data: guestData } = await supabase
    .from("guests")
    .select("id, name, guest_type, child_age, dietary_restrictions, rsvp_status")
    .eq("group_id", groupData.id)
    .order("name");

  return NextResponse.json({
    couple: coupleData ?? null,
    group: groupData,
    guests: guestData ?? [],
  });
}
