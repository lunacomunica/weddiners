import Link from "next/link";
import { MessagesSection } from "../MessagesSection";
import type { TemplateConfig } from "./types";

type Messages = { id: string; guest_name: string; message: string; created_at: string }[];

export interface SectionColors {
  accent: string;
  altBg: string;
  mainBg: string;
  text: string;
  subText: string;
  ornament?: string;
  buttonRadius?: string;
  schedulePhotoBg?: string; // dark bg color for schedule section
}

// ─── About ───────────────────────────────────────────────────────────────────
function AboutSection({ config, colors }: { config: TemplateConfig; colors: SectionColors }) {
  if (!config.showAbout || !config.aboutText) return null;
  const { accent, mainBg, text, subText } = colors;
  return (
    <section data-weddiners-section="about" style={{ background: mainBg }}>
      <div className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Left: section photo, then cover photo, else ornamental block */}
        {(config.aboutPhotoUrl || config.coverPhotoUrl) ? (
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
            <img
              src={config.aboutPhotoUrl || config.coverPhotoUrl!}
              alt="Foto do casal"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden flex items-center justify-center" style={{ background: accent + "15" }}>
            <div className="text-center">
              <div className="w-12 h-px mx-auto mb-4" style={{ background: accent }} />
              <p style={{ fontFamily: "var(--font-display)", fontSize: "4rem", color: accent + "40" }}>
                {config.name1?.[0]}{config.name2?.[0]}
              </p>
              <div className="w-12 h-px mx-auto mt-4" style={{ background: accent }} />
            </div>
          </div>
        )}

        {/* Right: editorial text */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: accent }}>
            {config.aboutTitle || "Nossa história"}
          </p>
          <h2 className="mb-8 leading-tight" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: text,
            fontStyle: "italic",
          }}>
            {config.aboutSubtitle || "Uma história de amor que vale celebrar"}
          </h2>
          <div className="w-10 h-px mb-8" style={{ background: accent }} />
          <p className="leading-relaxed text-base whitespace-pre-line" style={{ color: subText, lineHeight: "1.9" }}>
            {config.aboutText}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Dress Code ──────────────────────────────────────────────────────────────
function DresscodeSection({ config, colors }: { config: TemplateConfig; colors: SectionColors }) {
  if (!config.showDresscode || !config.dresscode) return null;
  const { accent, altBg, text, subText } = colors;
  return (
    <section data-weddiners-section="dresscode" style={{ background: altBg }}>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: accent }}>{config.dresscodeTitle || "Dress Code"}</p>
        <h2 className="mb-10" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: text, fontStyle: "italic" }}>
          Vista-se para o grande dia
        </h2>

        {/* Dress code card */}
        <div className="inline-block rounded-xl px-10 py-8 text-left" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${accent}22` }}>
          <div className="flex items-start gap-4">
            <div className="mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: accent + "15" }}>
              <svg width="18" height="18" fill="none" stroke={accent} strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-base" style={{ color: subText, lineHeight: "1.8" }}>{config.dresscode}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Schedule ────────────────────────────────────────────────────────────────
function ScheduleSection({ config, colors }: { config: TemplateConfig; colors: SectionColors }) {
  if (!config.showSchedule || !config.schedule) return null;
  const { accent, schedulePhotoBg } = colors;

  const events = config.schedule.split("\n").filter(Boolean).map(line => {
    const match = line.match(/^(\d{1,2}[:h]\d{0,2})\s+(.+)$/);
    return { time: match?.[1] ?? "", event: match?.[2] ?? line };
  });

  return (
    <section data-weddiners-section="schedule" className="relative overflow-hidden" style={{
      background: schedulePhotoBg ?? (config.coverPhotoUrl
        ? undefined
        : "#1C2018"),
      ...(config.coverPhotoUrl ? {
        backgroundImage: `url(${config.coverPhotoUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : {}),
    }}>
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.72)" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase mb-3 text-white/50">{config.scheduleTitle || "Cronograma"}</p>
        <h2 className="mb-16" style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          color: "#fff",
          fontStyle: "italic",
        }}>
          {config.scheduleTitle || "Cronograma"}
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: "rgba(255,255,255,0.15)" }} />

          <div className="space-y-10">
            {events.map((e, i) => (
              <div key={i} className={`flex items-center gap-6 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                {/* Text side */}
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <p className="text-white/90 font-medium text-base" style={{ fontFamily: "var(--font-body)" }}>{e.event}</p>
                </div>

                {/* Center dot + time */}
                <div className="flex flex-col items-center gap-1 shrink-0 z-10">
                  <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20" style={{ background: accent }} />
                  <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>{e.time}</p>
                </div>

                {/* Empty side */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Directions ──────────────────────────────────────────────────────────────
function DirectionsSection({ config, colors }: { config: TemplateConfig; colors: SectionColors }) {
  if (!config.showDirections || !config.directions) return null;
  const { accent, altBg, text, subText } = colors;
  return (
    <section data-weddiners-section="directions" style={{ background: altBg }}>
      <div className="max-w-4xl mx-auto px-6 py-24 grid md:grid-cols-[1fr_2fr] gap-16 items-start">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>{config.directionsTitle || "Como Chegar"}</p>
          <h2 className="leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: text, fontStyle: "italic" }}>
            {config.directionsSubtitle || "Nos encontramos aqui"}
          </h2>
          {config.weddingLocation && (
            <p className="mt-4 text-sm" style={{ color: subText }}>{config.weddingLocation}</p>
          )}
        </div>

        <div>
          <p className="leading-relaxed whitespace-pre-line mb-8 text-base" style={{ color: subText, lineHeight: "1.9" }}>
            {config.directions}
          </p>
          {config.directionsUrl && (
            <a href={config.directionsUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90"
              style={{ background: accent }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Abrir no Google Maps
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── CTA (RSVP + Gifts) ──────────────────────────────────────────────────────
function CTASection({ config, slug, colors }: { config: TemplateConfig; slug: string; colors: SectionColors }) {
  if (!config.showRsvp && !config.showGifts) return null;
  const { accent, mainBg, text, subText, buttonRadius = "0.375rem" } = colors;
  return (
    <section data-weddiners-section="rsvp" style={{ background: mainBg }}>
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>{config.rsvpTitle || "Participe"}</p>
        <h2 className="mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3rem)", color: text, fontStyle: "italic" }}>
          {config.rsvpSubtitle || "Sua presença é nosso maior presente"}
        </h2>
        <p className="text-sm mb-12" style={{ color: subText }}>
          {config.rsvpText || "Confirme sua presença e, se quiser, confira nossa lista de presentes"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {config.showRsvp && (
            <Link href={`/${slug}/rsvp`}
              className="px-10 py-4 text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: accent, borderRadius: buttonRadius }}>
              Confirmar presença
            </Link>
          )}
          {config.showGifts && (
            <Link href={`/${slug}/presentes`}
              className="px-10 py-4 text-sm font-medium border transition-colors hover:bg-black/5"
              style={{ borderColor: accent, color: accent, borderRadius: buttonRadius }}>
              Lista de presentes
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Messages ────────────────────────────────────────────────────────────────
function MessagesBlock({ config, slug, messages, colors }: { config: TemplateConfig; slug: string; messages: Messages; colors: SectionColors }) {
  if (!config.showMessages) return null;
  const { accent, altBg, text } = colors;
  return (
    <section data-weddiners-section="messages" style={{ background: altBg }}>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: accent }}>{config.messagesTitle || "Mural"}</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: text, fontStyle: "italic" }}>
            {config.messagesTitle || "Deixe seu recado"}
          </h2>
        </div>
        <MessagesSection slug={slug} initialMessages={messages} accentColor={accent} textColor={text} />
      </div>
    </section>
  );
}

// ─── Main render function ─────────────────────────────────────────────────────
export function renderSections(
  config: TemplateConfig,
  slug: string,
  messages: Messages,
  colors: SectionColors
) {
  const sectionMap: Record<string, React.ReactNode> = {
    about:      <AboutSection      key="about"      config={config} colors={colors} />,
    dresscode:  <DresscodeSection  key="dresscode"  config={config} colors={colors} />,
    schedule:   <ScheduleSection   key="schedule"   config={config} colors={colors} />,
    directions: <DirectionsSection key="directions" config={config} colors={colors} />,
    messages:   <MessagesBlock     key="messages"   config={config} slug={slug} messages={messages} colors={colors} />,
  };

  const ctaSection = <CTASection key="cta" config={config} slug={slug} colors={colors} />;
  const rendered: React.ReactNode[] = [];
  let ctaAdded = false;

  for (const id of config.sectionOrder) {
    if (id === "rsvp" || id === "gifts") {
      if (!ctaAdded) { rendered.push(ctaSection); ctaAdded = true; }
    } else {
      rendered.push(sectionMap[id] ?? null);
    }
  }

  if (!ctaAdded) rendered.push(ctaSection);
  return rendered;
}
