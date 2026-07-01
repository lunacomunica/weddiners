import { CountdownClient } from "../CountdownClient";
import { renderSections } from "./sections";
import type { TemplateProps } from "./types";
import { getPaletteTheme } from "./palettes";
import { TranslationWidget } from "../TranslationWidget";
import { buildGoogleCalendarUrl } from "./googleCalendarUrl";
import { AddToCalendarButton } from "../AddToCalendarButton";

type Messages = { id: string; guest_name: string; message: string; created_at: string }[];

export function Classico({ config, slug, messages = [] }: TemplateProps & { messages?: Messages }) {
  const p = getPaletteTheme(config.palette);

  return (
    <div style={{ fontFamily: "var(--font-body)", background: p.mainBg, color: p.text }}>
      {/* Hero */}
      <section
        data-weddiners-section="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{
          background: config.coverPhotoUrl
            ? `url(${config.coverPhotoUrl}) center/cover no-repeat`
            : p.heroBg,
        }}
      >
        <div className="absolute inset-0" style={{ background: p.heroOverlay }} />
        <div className="relative z-10 max-w-2xl">
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-5">Celebração de Casamento</p>
          <h1 className="text-white mb-4 leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 8vw, 5.5rem)" }}>
            {config.heroTitle}
          </h1>
          {config.heroSubtitle && <p className="text-white/75 text-lg">{config.heroSubtitle}</p>}
          {config.weddingLocation && <p className="text-white/50 text-sm mt-2">{config.weddingLocation}</p>}
          {config.weddingDate && (
            <AddToCalendarButton
              slug={slug}
              googleCalendarUrl={buildGoogleCalendarUrl({ title: config.heroTitle, date: config.weddingDate, location: config.weddingLocation })}
              variant="pill"
            />
          )}
          <div className="mt-14 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-px h-10 bg-white/30" />
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Rolar</p>
          </div>
        </div>
      </section>

      {/* Countdown */}
      {config.weddingDate && (
        <section className="py-16 px-6 text-center" style={{ background: p.countdownBg }}>
          <p className="text-xs tracking-[0.25em] uppercase mb-8" style={{ color: p.subText }}>Faltam</p>
          <CountdownClient weddingDate={config.weddingDate} primaryColor={p.accent} />
        </section>
      )}

      {renderSections(config, slug, messages, {
        accent: p.accent,
        altBg: p.altBg,
        mainBg: p.mainBg,
        text: p.text,
        subText: p.subText,
        ornament: p.ornament,
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
