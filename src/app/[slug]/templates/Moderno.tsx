import Link from "next/link";
import { CountdownClient } from "../CountdownClient";
import { MessagesSection } from "../MessagesSection";
import type { TemplateProps } from "./types";
import { getPaletteTheme } from "./palettes";
import { TranslationWidget } from "../TranslationWidget";

type Messages = { id: string; guest_name: string; message: string; created_at: string }[];

export function Moderno({ config, slug, messages = [] }: TemplateProps & { messages?: Messages }) {
  const p = getPaletteTheme(config.palette);
  // Moderno uses accent as border/line color but keeps near-white/black for main layout
  const border = `${p.accent}30`;
  return (
    <div style={{ fontFamily: "var(--font-body)", background: p.mainBg, color: p.text }}>
      {/* Hero — split */}
      <section className="relative min-h-screen grid md:grid-cols-2">
        <div className="min-h-[50vh] md:min-h-screen" style={{
          background: config.coverPhotoUrl ? `url(${config.coverPhotoUrl}) center/cover no-repeat` : p.heroBg,
        }} />
        <div className="flex flex-col justify-center px-10 py-16 md:py-20" style={{ background: p.mainBg }}>
          <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: p.subText }}>
            {config.weddingDate
              ? new Date(config.weddingDate).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
              : "Celebração de Casamento"}
          </p>
          <h1 className="leading-[0.95] mb-6" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: p.text }}>
            {config.heroTitle}
          </h1>
          {config.weddingLocation && <p className="text-sm mb-8" style={{ color: p.subText }}>{config.weddingLocation}</p>}
          <div className="w-12 h-0.5 mb-8" style={{ background: p.accent }} />
          <div className="flex flex-col sm:flex-row gap-3">
            {config.showRsvp && (
              <Link href={`/${slug}/rsvp`} className="px-7 py-3.5 text-white text-sm font-medium tracking-wide" style={{ background: p.accent }}>
                Confirmar presença
              </Link>
            )}
            {config.showGifts && (
              <Link href={`/${slug}/presentes`} className="px-7 py-3.5 text-sm font-medium tracking-wide border" style={{ borderColor: p.accent, color: p.accent }}>
                Lista de presentes
              </Link>
            )}
          </div>
        </div>
      </section>

      {config.weddingDate && (
        <section className="py-16 px-6 text-center border-t" style={{ borderColor: border }}>
          <CountdownClient weddingDate={config.weddingDate} primaryColor={p.accent} />
        </section>
      )}

      {/* Moderno uses its own minimal layout for sections */}
      {config.sectionOrder.map((id, idx) => {
        if (id === "about" && config.showAbout && config.aboutText) return (
          <section key="about" className="py-20 px-6 border-t" style={{ borderColor: border }}>
            <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: p.subText }}>Nossa história</p>
                <div className="w-8 h-0.5" style={{ background: p.accent }} />
              </div>
              <p className="leading-relaxed text-base whitespace-pre-line" style={{ color: p.subText }}>{config.aboutText}</p>
            </div>
          </section>
        );
        if (id === "dresscode" && config.showDresscode && config.dresscode) return (
          <section key="dresscode" className="py-16 px-6 border-t" style={{ borderColor: border }}>
            <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: p.subText }}>Dress Code</p>
                <div className="w-8 h-0.5" style={{ background: p.accent }} />
              </div>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: p.subText }}>{config.dresscode}</p>
            </div>
          </section>
        );
        if (id === "schedule" && config.showSchedule && config.schedule) return (
          <section key="schedule" className="py-16 px-6 border-t" style={{ borderColor: border }}>
            <div className="max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: p.subText }}>Cronograma</p>
              <div className="space-y-4">
                {config.schedule.split("\n").filter(Boolean).map((line, j) => {
                  const match = line.match(/^(\d{1,2}[:h]\d{0,2})\s+(.+)$/);
                  return (
                    <div key={j} className="flex gap-8 items-baseline border-b pb-4" style={{ borderColor: border }}>
                      <span className="text-sm font-medium w-16 shrink-0" style={{ color: p.subText }}>{match?.[1] ?? ""}</span>
                      <p className="text-sm" style={{ color: p.text }}>{match?.[2] ?? line}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
        if (id === "directions" && config.showDirections && config.directions) return (
          <section key="directions" className="py-16 px-6 border-t" style={{ borderColor: border }}>
            <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: p.subText }}>Como Chegar</p>
                <div className="w-8 h-0.5" style={{ background: p.accent }} />
              </div>
              <div>
                <p className="leading-relaxed whitespace-pre-line mb-4" style={{ color: p.subText }}>{config.directions}</p>
                {config.directionsUrl && (
                  <a href={config.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium underline" style={{ color: p.text }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/></svg>
                    Ver no Google Maps
                  </a>
                )}
              </div>
            </div>
          </section>
        );
        if (id === "messages" && config.showMessages) return (
          <section key="messages" className="py-20 px-6 border-t" style={{ borderColor: border }}>
            <div className="max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: p.subText }}>Mural</p>
              <div className="w-8 h-0.5 mb-10" style={{ background: p.accent }} />
              <MessagesSection slug={slug} initialMessages={messages} accentColor="#0A0A0A" textColor="#0A0A0A" />
            </div>
          </section>
        );
        void idx;
        return null;
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
