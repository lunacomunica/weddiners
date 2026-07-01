"use client";

interface AddToCalendarButtonProps {
  slug: string;
  googleCalendarUrl: string;
  /** Cor do texto/borda — herda da paleta do template */
  color?: string;
  /** Estilo visual: "pill" para hero (borda arredondada sobre foto), "outline" para seção RSVP */
  variant?: "pill" | "outline";
  borderRadius?: string;
}

export function AddToCalendarButton({
  slug,
  googleCalendarUrl,
  color = "#4A5C3E",
  variant = "outline",
  borderRadius = "0.375rem",
}: AddToCalendarButtonProps) {
  function handleClick() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1; // iPad com iPadOS

    if (isIOS || isMac) {
      // iPhone/iPad: baixa .ics → abre no Calendário nativo
      window.location.href = `/api/calendar/${slug}`;
    } else {
      // Android, desktop: abre Google Calendar
      window.open(googleCalendarUrl, "_blank", "noopener,noreferrer");
    }
  }

  const icon = (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (variant === "pill") {
    return (
      <button
        onClick={handleClick}
        className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:bg-white/20 cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.85)" }}
      >
        {icon}
        Salvar na agenda
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-6 py-4 text-sm font-medium border transition-opacity hover:opacity-70 cursor-pointer"
      style={{ borderColor: color, color, borderRadius }}
    >
      {icon}
      Salvar na agenda
    </button>
  );
}
