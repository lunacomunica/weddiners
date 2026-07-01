import { CountdownClient } from "../CountdownClient";
import { renderSections } from "./sections";
import type { TemplateProps } from "./types";
import { getPaletteTheme } from "./palettes";
import { TranslationWidget } from "../TranslationWidget";
import { buildGoogleCalendarUrl } from "./googleCalendarUrl";
import { AddToCalendarButton } from "../AddToCalendarButton";

type Messages = { id: string; guest_name: string; message: string; created_at: string }[];

export function Rustico({ config, slug, messages = [] }: TemplateProps & { messages?: Messages }) {
  const p = getPaletteTheme(config.palette);

  return (
    <div style={{ fontFamily: "var(--font-body)", background: p.mainBg, color: p.text }}>
      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{
          background: config.coverPhotoUrl
            ? `url(${config.coverPhotoUrl}) center/cover no-repeat`
            : p.heroBg,
        }}
      >
        <div className="absolute inset-0" style={{ background: p.heroOverlay }} />
        <div className="relative z-10 max-w-2xl">
          <div className="border border-white/20 p-10 md:p-14">
            <p className="text-xs tracking-[0.35em] uppercase mb-4 text-white/60">Com alegria anunciamos</p>
            <h1 className="text-white leading-tight mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 8vw, 5.5rem)" }}>
              {config.heroTitle}
            </h1>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.25)" }} />
              <span className="text-white/40 text-sm">{p.ornament ?? "✦"}</span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.25)" }} />
            </div>
            {config.heroSubtitle && <p className="text-white/75 text-base">{config.heroSubtitle}</p>}
            {config.weddingLocation && <p className="text-white/50 text-sm mt-1">{config.weddingLocation}</p>}
            {config.weddingDate && (
              <AddToCalendarButton
                slug={slug}
                googleCalendarUrl={buildGoogleCalendarUrl({ title: config.heroTitle, date: config.weddingDate, location: config.weddingLocation })}
                variant="pill"
              />
            )}
          </div>
        </div>
      </section>

      {config.weddingDate && (
        <section className="py-16 px-6 text-center" style={{ background: p.countdownBg }}>
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: p.subText }}>Faltam para o grande dia</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-8" style={{ background: p.accent + "80" }} />
            <span style={{ color: p.accent }}>{p.ornament ?? "✦"}</span>
            <div className="h-px w-8" style={{ background: p.accent + "80" }} />
          </div>
          <CountdownClient weddingDate={config.weddingDate} primaryColor={p.accent} />
        </section>
      )}

      {renderSections(config, slug, messages, {
        accent: p.accent,
        altBg: p.altBg,
        mainBg: p.mainBg,
        text: p.text,
        subText: p.subText,
        ornament: p.ornament ?? "✦",
        buttonRadius: p.buttonRadius,
        schedulePhotoBg: p.schedulePhotoBg,
      })}

      <footer className="py-8 px-4 flex items-center justify-center sidebar-texture">
        <a href="https://weddiners.com.br/" target="_blank" rel="noopener noreferrer">
          <img src="/logo.png" alt="Weddiners" className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />
        </a>
      </footer>

      {config.translationsEnabled && config.translationLanguages.length > 0 && (
        <TranslationWidget languages={config.translationLanguages} />
      )}
    </div>
  );
}
