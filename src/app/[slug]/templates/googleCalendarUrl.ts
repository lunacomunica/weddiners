/**
 * Gera a URL para adicionar evento no Google Calendar.
 * O evento dura o dia todo (allday).
 */
export function buildGoogleCalendarUrl({
  title,
  date,
  location,
}: {
  title: string;
  date: string; // YYYY-MM-DD
  location?: string | null;
}): string {
  const [year, month, day] = date.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");

  // Google Calendar allday format: YYYYMMDD
  const dateStr = `${year}${pad(month)}${pad(day)}`;
  // End date = day after (exclusive end)
  const endDate = new Date(year, month - 1, day + 1);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dateStr}/${endStr}`,
    ...(location ? { location } : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
