import { CountdownClient } from "../CountdownClient";
import { renderSections } from "./sections";
import type { TemplateProps } from "./types";
import { getPaletteTheme } from "./palettes";
import { TranslationWidget } from "../TranslationWidget";
import { buildGoogleCalendarUrl } from "./googleCalendarUrl";

type Messages = { id: string; guest_name: string; message: string; created_at: string }[];

export function Romantico({ config, slug, messages = [] }: TemplateProps & { messages?: Messages }) {
  const p = getPaletteTheme(config.palette);
  const hasPhoto = !!config.coverPhotoUrl;

  return (
    <div style={{ fontFamily: "var(--font-body)", background: p.mainBg, color: p.text }}>
      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{
          background: hasPhoto
            ? `url(${config.coverPhotoUrl}) center/cover no-repeat`
            : p.heroBg,
        }}
      >
        {hasPhoto && <div className="absolute inset-0" style={{ background: p.heroOverlay }} />}
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12" style={{ background: hasPhoto ? "rgba(255,255,255,0.5)" : p.accent + "80" }} />
            <span style={{ color: hasPhoto ? "rgba(255,255,255,0.7)" : p.accent, fontSize: "1.2rem" }}>{p.ornament ?? "♡"}</span>
            <div className="h-px w-12" style={{ background: hasPhoto ? "rgba(255,255,255,0.5)" : p.accent + "80" }} />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: hasPhoto ? "rgba(255,255,255,0.6)" : p.accent }}>Casamento de</p>
          <h1 className="leading-tight mb-3" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 9vw, 6rem)", color: hasPhoto ? "#fff" : p.text }}>
            {config.heroTitle}
          </h1>
          {config.heroSubtitle && <p className="text-base mt-2" style={{ color: hasPhoto ? "rgba(255,255,255,0.75)" : p.subText }}>{config.heroSubtitle}</p>}
          {config.weddingLocation && <p className="text-sm mt-1" style={{ color: hasPhoto ? "rgba(255,255,255,0.5)" : p.accent + "99" }}>{config.weddingLocation}</p>}
          {config.weddingDate && (
            <a
              href={buildGoogleCalendarUrl({ title: config.heroTitle, date: config.weddingDate, location: config.weddingLocation })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
              style={{
                border: `1px solid ${hasPhoto ? "rgba(255,255,255,0.35)" : p.accent + "50"}`,
                color: hasPhoto ? "rgba(255,255,255,0.85)" : p.accent,
                backdropFilter: hasPhoto ? "blur(4px)" : undefined,
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Salvar no Google Agenda
            </a>
          )}
        </div>
      </section>

      {config.weddingDate && (
        <section className="py-16 px-6 text-center" style={{ background: p.countdownBg }}>
          <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: p.accent + "99" }}>Contagem regressiva</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-10" style={{ background: p.accent + "60" }} />
            <span style={{ color: p.accent + "60" }}>{p.ornament ?? "♡"}</span>
            <div className="h-px w-10" style={{ background: p.accent + "60" }} />
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
        ornament: p.ornament ?? "♡",
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
