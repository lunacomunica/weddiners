import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: couple } = await supabase
    .from("couples")
    .select("partner1_name, partner2_name, bride_name, groom_name, wedding_date, wedding_location, slug")
    .eq("slug", params.slug)
    .single();

  if (!couple || !couple.wedding_date) {
    return new NextResponse("Not found", { status: 404 });
  }

  const name1 = couple.partner1_name || couple.bride_name;
  const name2 = couple.partner2_name || couple.groom_name;
  const title = `Casamento ${name1} & ${name2}`;

  // Format date as YYYYMMDD
  const [year, month, day] = couple.wedding_date.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${year}${pad(month)}${pad(day)}`;

  // End = next day (all-day event)
  const end = new Date(year, month - 1, day + 1);
  const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`;

  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const location = couple.wedding_location ?? "";
  const url = `https://app.weddiners.com.br/${couple.slug}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Weddiners//Wedding//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${couple.slug}-wedding@weddiners.com.br`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:${title}`,
    ...(location ? [`LOCATION:${location}`] : []),
    `URL:${url}`,
    `DESCRIPTION:Site do casamento: ${url}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="casamento-${couple.slug}.ics"`,
      "Cache-Control": "no-cache",
    },
  });
}
