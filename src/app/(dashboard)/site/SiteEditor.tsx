"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { SectionsEditor, DEFAULT_ORDER } from "./SectionsEditor";
import { updateSiteConfig, updateCoupleInfo, updateAppearance } from "./actions";

type SectionId = "about" | "rsvp" | "gifts" | "dresscode" | "schedule" | "directions" | "messages";

interface SiteConfig {
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
  cover_photo_url: string | null;
  palette: string | null;
  template: string | null;
  show_gifts: boolean;
  show_rsvp: boolean;
  show_about: boolean;
  dresscode: string | null;
  schedule: string | null;
  directions: string | null;
  directions_url: string | null;
  show_dresscode: boolean;
  show_schedule: boolean;
  show_directions: boolean;
  show_messages: boolean;
  section_order: string | null;
}

interface Couple {
  partner1_name: string | null;
  partner2_name: string | null;
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  wedding_location: string | null;
  slug: string;
}

const TEMPLATES = [
  {
    id: "classico",
    label: "Clássico",
    desc: "Elegante e atemporal",
    preview: { bg: "#3A4A30", text: "#fff", accent: "#7A8C6A" },
  },
  {
    id: "romantico",
    label: "Romântico",
    desc: "Delicado e ornamental",
    preview: { bg: "#E8C4C4", text: "#2D1A20", accent: "#C4707A" },
  },
  {
    id: "moderno",
    label: "Moderno",
    desc: "Minimalista e bold",
    preview: { bg: "#1A1A1A", text: "#fff", accent: "#888" },
  },
  {
    id: "rustico",
    label: "Rústico",
    desc: "Terroso e acolhedor",
    preview: { bg: "#C4704A", text: "#fff", accent: "#EDE0CC" },
  },
];

const PALETTES = [
  { id: "sage", label: "Sage & Champagne", colors: ["#7A8C6A", "#EDE4D0", "#1C2018"] },
  { id: "blush", label: "Blush & Dourado", colors: ["#D4A5A5", "#F5F0E8", "#8B6914"] },
  { id: "navy", label: "Azul Marinho", colors: ["#1B2A4A", "#E8EEF5", "#C9A96E"] },
  { id: "terracotta", label: "Terracota", colors: ["#C4704A", "#F5EDE8", "#4A3728"] },
  { id: "lavender", label: "Lavanda", colors: ["#8B7FB8", "#F0EEF8", "#2D2140"] },
  { id: "custom", label: "Personalizada", colors: [] },
];

function parseCustomPalette(palette: string | null): [string, string, string] {
  if (!palette?.startsWith("custom|")) return ["#7A8C6A", "#EDE4D0", "#1C2018"];
  const parts = palette.split("|");
  return [parts[1] ?? "#7A8C6A", parts[2] ?? "#EDE4D0", parts[3] ?? "#1C2018"];
}

type Tab = "aparencia" | "conteudo" | "secoes";

export function SiteEditor({ config, couple, plan = "free" }: { config: SiteConfig; couple: Couple; plan?: "free" | "pro" }) {
  const [tab, setTab] = useState<Tab>("aparencia");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingCouple, setSavingCouple] = useState(false);
  const [error, setError] = useState("");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [previewKey, setPreviewKey] = useState(0);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const appearanceFormRef = useRef<HTMLFormElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstAppearanceRender = useRef(true);

  // Controlled state for palette and template so visual selection updates immediately
  const initialPaletteId = config.palette?.startsWith("custom|") ? "custom" : (config.palette ?? "sage");
  const [selectedPalette, setSelectedPalette] = useState(initialPaletteId);
  const [selectedTemplate, setSelectedTemplate] = useState(config.template ?? "classico");
  const initialCustomColors = parseCustomPalette(config.palette);
  const [customColors, setCustomColors] = useState<[string, string, string]>(initialCustomColors);

  const refreshPreview = useCallback(() => setPreviewKey(k => k + 1), []);

  // Auto-save appearance when palette or template changes (debounced 600ms)
  useEffect(() => {
    if (isFirstAppearanceRender.current) { isFirstAppearanceRender.current = false; return; }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const paletteValue = selectedPalette === "custom"
        ? `custom|${customColors[0]}|${customColors[1]}|${customColors[2]}`
        : selectedPalette;
      const coverUrl = appearanceFormRef.current
        ? (new FormData(appearanceFormRef.current).get("cover_photo_url") as string | null) || null
        : null;
      const result = await updateAppearance(paletteValue, selectedTemplate, coverUrl);
      if (!result?.error) refreshPreview();
    }, 600);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [selectedPalette, selectedTemplate, customColors, refreshPreview]);

  const [publicUrl, setPublicUrl] = useState(`https://weddiners.com.br/${couple.slug}`);
  useEffect(() => {
    setPublicUrl(`${window.location.origin}/${couple.slug}`);
  }, [couple.slug]);

  async function handleSaveConfig(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await updateSiteConfig(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); refreshPreview(); }
    setSaving(false);
  }

  async function handleSaveCouple(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingCouple(true);
    setError("");
    const result = await updateCoupleInfo(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); refreshPreview(); }
    setSavingCouple(false);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "aparencia", label: "Aparência" },
    { id: "conteudo", label: "Conteúdo" },
    { id: "secoes", label: "Seções" },
  ];

  return (
    <>
    {/* Modal de prévia para mobile/tablet */}
    {mobilePreviewOpen && (
      <div className="xl:hidden fixed inset-0 z-50 bg-black/80 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b shrink-0">
          <p className="font-semibold text-sm text-neutral-800">Prévia do site</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
              <button onClick={() => setDevice("mobile")} className={["p-1.5 rounded-md transition-colors", device === "mobile" ? "bg-white shadow-sm text-moss" : "text-neutral-400"].join(" ")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg>
              </button>
              <button onClick={() => setDevice("desktop")} className={["p-1.5 rounded-md transition-colors", device === "desktop" ? "bg-white shadow-sm text-moss" : "text-neutral-400"].join(" ")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></svg>
              </button>
            </div>
            <a href={`/${couple.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-moss font-medium hover:underline">Abrir →</a>
            <button onClick={() => setMobilePreviewOpen(false)} className="text-neutral-500 hover:text-neutral-800 p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 bg-neutral-100 flex items-start justify-center overflow-hidden p-4">
          {device === "mobile" ? (
            <div className="rounded-[2rem] border-4 border-white/30 overflow-hidden shadow-2xl bg-white shrink-0" style={{ width: 260, height: 536 }}>
              <div className="w-full h-full overflow-hidden relative">
                <iframe
                  key={previewKey + "_m"}
                  src={`/${couple.slug}`}
                  className="absolute top-0 left-0"
                  style={{ width: 390, height: 804, transform: "scale(0.667)", transformOrigin: "top left", border: "none" }}
                  title="Prévia mobile"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-rose/60"/><div className="w-2.5 h-2.5 rounded-full bg-gold/60"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60"/>
                <div className="flex-1 bg-neutral-100 rounded px-3 py-1 mx-2"><p className="text-[10px] text-neutral-400 truncate">{couple.slug}.weddiners.com.br</p></div>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <iframe
                  key={previewKey + "_d"}
                  src={`/${couple.slug}`}
                  onLoad={(e) => { try { const doc = e.currentTarget.contentDocument ?? e.currentTarget.contentWindow?.document; doc?.documentElement?.scrollTo?.(0, 820); } catch {} }}
                  className="absolute top-0 left-0"
                  style={{ width: 1280, height: 1600, transform: "scale(0.297)", transformOrigin: "top left", border: "none" }}
                  title="Prévia desktop"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
      {/* Editor Panel */}
      <div>
        {/* Botão ver prévia — só aparece em telas < xl */}
        <div className="xl:hidden mb-4">
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-200 rounded-xl py-3 text-sm font-medium text-moss hover:bg-sage/5 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3"/></svg>
            Ver prévia do site
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 mb-6 w-fit" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-md font-body text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-moss text-white shadow-sm"
                  : "text-smoke hover:text-noir"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-rose text-sm font-body mb-4">{error}</p>
        )}

        {/* Aparência */}
        {tab === "aparencia" && (
          <form ref={appearanceFormRef} onSubmit={handleSaveConfig} className="space-y-6">
            <input type="hidden" name="show_gifts" value={config.show_gifts ? "on" : ""} />
            <input type="hidden" name="show_rsvp" value={config.show_rsvp ? "on" : ""} />
            <input type="hidden" name="show_about" value={config.show_about ? "on" : ""} />
            <input type="hidden" name="show_dresscode" value={config.show_dresscode ? "on" : ""} />
            <input type="hidden" name="show_schedule" value={config.show_schedule ? "on" : ""} />
            <input type="hidden" name="show_directions" value={config.show_directions ? "on" : ""} />
            <input type="hidden" name="show_messages" value={config.show_messages ? "on" : ""} />
            <input type="hidden" name="hero_title" value={config.hero_title ?? ""} />
            <input type="hidden" name="hero_subtitle" value={config.hero_subtitle ?? ""} />
            <input type="hidden" name="about_text" value={config.about_text ?? ""} />
            <input type="hidden" name="dresscode" value={config.dresscode ?? ""} />
            <input type="hidden" name="schedule" value={config.schedule ?? ""} />
            <input type="hidden" name="directions" value={config.directions ?? ""} />
            <input type="hidden" name="directions_url" value={config.directions_url ?? ""} />

            <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-lg text-noir mb-4">Template</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TEMPLATES.map(t => {
                  const locked = plan !== "pro" && t.id !== "classico";
                  const isSelected = selectedTemplate === t.id;
                  return (
                    <label key={t.id} className={locked ? "cursor-not-allowed" : "cursor-pointer"} onClick={() => !locked && setSelectedTemplate(t.id)}>
                      <input type="radio" name="template" value={t.id} checked={isSelected} disabled={locked} onChange={() => !locked && setSelectedTemplate(t.id)} className="sr-only" />
                      <div
                        className={`border-2 rounded-lg overflow-hidden transition-all relative ${isSelected ? "border-moss" : "border-transparent"}`}
                        style={locked ? { opacity: 0.45, filter: "grayscale(0.3)" } : undefined}
                      >
                        <div className="h-20 flex flex-col items-center justify-center gap-1 px-2" style={{ background: t.preview.bg }}>
                          <div className="w-8 h-0.5 rounded" style={{ background: t.preview.accent }} />
                          <p className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)", color: t.preview.text, fontSize: "0.7rem" }}>A & B</p>
                          <div className="w-5 h-0.5 rounded" style={{ background: t.preview.accent }} />
                        </div>
                        <div className="p-2 bg-ivory">
                          <div className="flex items-center justify-center gap-1">
                            <p className="font-body text-xs font-medium text-noir text-center">{t.label}</p>
                            {locked && (
                              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-smoke shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>
                            )}
                          </div>
                          {locked
                            ? <p className="font-body text-[10px] text-moss text-center">Pro</p>
                            : <p className="font-body text-[10px] text-smoke text-center">{t.desc}</p>
                          }
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {plan !== "pro" && (
                <div className="mt-3 flex items-center gap-2 bg-sage/10 rounded-md px-3 py-2.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="text-moss shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>
                  <p className="font-body text-xs text-smoke">3 templates exclusivos desbloqueados no <a href="/planos" className="text-moss font-medium hover:underline">Plano Pro</a></p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-lg text-noir mb-4">Paleta de Cores</h3>
              {/* Hidden input: sends the actual palette value (custom includes the hex codes) */}
              <input type="hidden" name="palette" value={
                selectedPalette === "custom"
                  ? `custom|${customColors[0]}|${customColors[1]}|${customColors[2]}`
                  : selectedPalette
              } />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PALETTES.map(p => {
                  const isSelected = selectedPalette === p.id;
                  return (
                    <label key={p.id} className="cursor-pointer" onClick={() => setSelectedPalette(p.id)}>
                      <div className={`border-2 rounded-lg p-3 transition-all hover:border-moss ${isSelected ? "border-moss" : "border-transparent bg-ivory"}`}>
                        <div className="flex gap-1.5 mb-2">
                          {p.id === "custom" ? (
                            <>
                              {customColors.map((c, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-noir/10" style={{ background: c }} />
                              ))}
                            </>
                          ) : (
                            p.colors.map((c, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border border-noir/10" style={{ background: c }} />
                            ))
                          )}
                        </div>
                        <p className="font-body text-xs text-noir font-medium">{p.label}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Custom palette color pickers */}
              {selectedPalette === "custom" && (
                <div className="mt-4 p-4 rounded-lg border space-y-3" style={{ borderColor: "rgba(13,10,11,0.08)", background: "#FAFAF8" }}>
                  <p className="font-body text-xs text-smoke mb-3">Insira os códigos hexadecimais das suas cores</p>
                  {[
                    { label: "Cor principal (destaque)", index: 0 },
                    { label: "Cor de fundo", index: 1 },
                    { label: "Cor do texto", index: 2 },
                  ].map(({ label, index }) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customColors[index]}
                        onChange={e => {
                          const next = [...customColors] as [string, string, string];
                          next[index] = e.target.value;
                          setCustomColors(next);
                        }}
                        className="w-9 h-9 rounded-md border cursor-pointer p-0.5"
                        style={{ borderColor: "rgba(13,10,11,0.15)" }}
                      />
                      <div className="flex-1">
                        <p className="font-body text-xs text-smoke mb-1">{label}</p>
                        <input
                          type="text"
                          value={customColors[index]}
                          onChange={e => {
                            const val = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                              const next = [...customColors] as [string, string, string];
                              next[index] = val;
                              setCustomColors(next);
                            }
                          }}
                          maxLength={7}
                          placeholder="#000000"
                          className="w-full px-3 py-1.5 rounded-md border font-mono text-xs outline-none focus:border-moss transition-colors"
                          style={{ borderColor: "rgba(13,10,11,0.12)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-lg text-noir mb-4">Foto de Capa</h3>
              <Input
                label="URL da imagem"
                name="cover_photo_url"
                defaultValue={config.cover_photo_url ?? ""}
                placeholder="https://..."
              />
              <p className="text-smoke text-xs font-body mt-2">Cole um link de imagem do Unsplash ou similar (recomendado: 1920×1080)</p>
            </div>

            <Button type="submit" loading={saving}>
              {saved ? "Salvo!" : "Salvar aparência"}
            </Button>
          </form>
        )}

        {/* Conteúdo */}
        {tab === "conteudo" && (
          <div className="space-y-6">
            <form onSubmit={handleSaveCouple} className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-lg text-noir">Informações do Casal</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nome — Noiva/Noivo 1" name="partner1_name" defaultValue={couple.partner1_name ?? couple.bride_name} placeholder="Maria" />
                <Input label="Nome — Noivo/Noiva 2" name="partner2_name" defaultValue={couple.partner2_name ?? couple.groom_name} placeholder="João" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data do casamento" name="wedding_date" type="date" defaultValue={couple.wedding_date ?? ""} />
                <Input label="Local" name="wedding_location" defaultValue={couple.wedding_location ?? ""} placeholder="São Paulo, SP" />
              </div>
              <Button type="submit" loading={savingCouple}>
                {saved ? "Salvo!" : "Salvar informações"}
              </Button>
            </form>

            <form onSubmit={handleSaveConfig} className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-lg text-noir">Textos do Site</h3>
              <input type="hidden" name="palette" value={selectedPalette === "custom" ? `custom|${customColors[0]}|${customColors[1]}|${customColors[2]}` : selectedPalette} />
              <input type="hidden" name="template" value={selectedTemplate} />
              <input type="hidden" name="cover_photo_url" value={config.cover_photo_url ?? ""} />
              <input type="hidden" name="show_gifts" value={config.show_gifts ? "on" : ""} />
              <input type="hidden" name="show_rsvp" value={config.show_rsvp ? "on" : ""} />
              <input type="hidden" name="show_about" value={config.show_about ? "on" : ""} />
              <input type="hidden" name="show_dresscode" value={config.show_dresscode ? "on" : ""} />
              <input type="hidden" name="show_schedule" value={config.show_schedule ? "on" : ""} />
              <input type="hidden" name="show_directions" value={config.show_directions ? "on" : ""} />
              <input type="hidden" name="show_messages" value={config.show_messages ? "on" : ""} />

              <Input
                label="Título do hero"
                name="hero_title"
                defaultValue={config.hero_title ?? `${couple.partner1_name ?? couple.bride_name} & ${couple.partner2_name ?? couple.groom_name}`}
                placeholder="Maria & João"
              />
              <Input
                label="Subtítulo"
                name="hero_subtitle"
                defaultValue={config.hero_subtitle ?? ""}
                placeholder="21 de novembro de 2026 · São Paulo"
              />
              <Textarea
                label="Mensagem do casal (seção Sobre)"
                name="about_text"
                defaultValue={config.about_text ?? ""}
                placeholder="Conte um pouco da história de vocês..."
                rows={4}
              />
              <Button type="submit" loading={saving}>
                {saved ? "Salvo!" : "Salvar textos"}
              </Button>
            </form>

            <form onSubmit={handleSaveConfig} className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-lg text-noir">Seções extras</h3>
              <input type="hidden" name="palette" value={selectedPalette === "custom" ? `custom|${customColors[0]}|${customColors[1]}|${customColors[2]}` : selectedPalette} />
              <input type="hidden" name="template" value={selectedTemplate} />
              <input type="hidden" name="cover_photo_url" value={config.cover_photo_url ?? ""} />
              <input type="hidden" name="hero_title" value={config.hero_title ?? ""} />
              <input type="hidden" name="hero_subtitle" value={config.hero_subtitle ?? ""} />
              <input type="hidden" name="about_text" value={config.about_text ?? ""} />
              <input type="hidden" name="show_gifts" value={config.show_gifts ? "on" : ""} />
              <input type="hidden" name="show_rsvp" value={config.show_rsvp ? "on" : ""} />
              <input type="hidden" name="show_about" value={config.show_about ? "on" : ""} />
              <input type="hidden" name="show_dresscode" value={config.show_dresscode ? "on" : ""} />
              <input type="hidden" name="show_schedule" value={config.show_schedule ? "on" : ""} />
              <input type="hidden" name="show_directions" value={config.show_directions ? "on" : ""} />
              <input type="hidden" name="show_messages" value={config.show_messages ? "on" : ""} />

              <div>
                <label className="font-body text-sm font-medium text-noir block mb-1.5">
                  Dress Code
                </label>
                <Textarea
                  name="dresscode"
                  defaultValue={config.dresscode ?? ""}
                  placeholder="Ex: Traje esporte fino. Preferência por tons terrosos e neutros. Evitar branco e preto."
                  rows={3}
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-noir block mb-1.5">
                  Cronograma
                </label>
                <p className="font-body text-xs text-smoke mb-2">Uma linha por evento: &ldquo;18:00 Cerimônia&rdquo;</p>
                <Textarea
                  name="schedule"
                  defaultValue={config.schedule ?? "17:00 Recepção dos convidados\n18:00 Cerimônia\n19:30 Coquetel\n21:00 Jantar\n23:00 Pista de dança"}
                  placeholder={"17:30 Recepção\n18:00 Cerimônia\n19:30 Coquetel\n21:00 Jantar e festa"}
                  rows={5}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-body text-sm font-medium text-noir block mb-1.5">
                    Como Chegar — Descrição
                  </label>
                  <Textarea
                    name="directions"
                    defaultValue={config.directions ?? ""}
                    placeholder="Ex: O local fica na Av. Paulista, 1000. Há estacionamento próprio e o metrô mais próximo é o Trianon-MASP."
                    rows={3}
                  />
                </div>
                <Input
                  label="Link do Google Maps (opcional)"
                  name="directions_url"
                  defaultValue={config.directions_url ?? ""}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <Button type="submit" loading={saving}>
                {saved ? "Salvo!" : "Salvar seções extras"}
              </Button>
            </form>
          </div>
        )}

        {/* Seções */}
        {tab === "secoes" && (() => {
          const parsedOrder: SectionId[] = (() => {
            try { return JSON.parse(config.section_order ?? "null") ?? DEFAULT_ORDER; }
            catch { return DEFAULT_ORDER; }
          })();
          const initialChecked: Record<SectionId, boolean> = {
            about: config.show_about,
            rsvp: config.show_rsvp,
            gifts: config.show_gifts,
            dresscode: config.show_dresscode,
            schedule: config.show_schedule,
            directions: config.show_directions,
            messages: config.show_messages,
          };
          return (
            <SectionsEditor
              initialOrder={parsedOrder}
              initialChecked={initialChecked}
              onSaved={refreshPreview}
            />
          );
        })()}

        {/* Compartilhar */}
        <div className="mt-8 bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <h3 className="font-display text-lg text-noir mb-4">Compartilhar seu site</h3>
          <div className="flex gap-6 items-start flex-wrap">
            <QRCodeDisplay url={publicUrl} />
            <div className="flex-1 min-w-[200px] space-y-3">
              <div>
                <p className="font-body text-xs text-smoke mb-1.5">Link do site</p>
                <div className="flex items-center gap-2 bg-ivory rounded-md px-3 py-2.5">
                  <p className="font-body text-xs text-moss truncate flex-1">{publicUrl}</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(publicUrl)}
                    className="text-smoke hover:text-moss text-xs font-body shrink-0 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Olá! Confirme sua presença no nosso casamento: ${publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-white text-sm font-body font-medium transition-opacity hover:opacity-90 w-full justify-center"
                style={{ background: "#25D366" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Compartilhar no WhatsApp
              </a>
              <a
                href={`/${couple.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-body font-medium border transition-colors hover:bg-ivory w-full"
                style={{ borderColor: "rgba(13,10,11,0.12)", color: "#3A4A30" }}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Abrir site público
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="hidden xl:block">
        <div className="sticky top-6">
          <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
            {/* Toolbar */}
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  title="Mobile"
                  className={`p-1.5 rounded transition-colors ${device === "mobile" ? "bg-moss/10 text-moss" : "text-smoke hover:text-noir"}`}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  title="Desktop"
                  className={`p-1.5 rounded transition-colors ${device === "desktop" ? "bg-moss/10 text-moss" : "text-smoke hover:text-noir"}`}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={refreshPreview}
                  title="Atualizar"
                  className="p-1.5 rounded text-smoke hover:text-noir transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <a
                href={`/${couple.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs text-moss hover:underline"
              >
                Abrir →
              </a>
            </div>

            {/* iframe container */}
            <div className={`bg-gray-100 flex items-start justify-center overflow-hidden transition-all ${device === "mobile" ? "h-[560px]" : "h-[500px]"}`}>
              {device === "mobile" ? (
                <div className="mt-4 rounded-[2rem] border-4 border-noir/20 overflow-hidden shadow-xl bg-white shrink-0" style={{ width: 260, height: 536 }}>
                  <div className="w-full h-full overflow-hidden relative">
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      src={`/${couple.slug}`}
                      onLoad={(e) => {
                        try { (e.currentTarget.contentDocument?.documentElement ?? e.currentTarget.contentWindow?.document?.documentElement)?.scrollTo?.(0, 0); } catch {}
                      }}
                      className="absolute top-0 left-0"
                      style={{ width: 390, height: 804, transform: "scale(0.667)", transformOrigin: "top left", border: "none" }}
                      title="Prévia mobile"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b shrink-0" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-rose/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gold/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                    <div className="flex-1 bg-ivory rounded px-3 py-1 mx-2">
                      <p className="font-body text-[10px] text-smoke truncate">{couple.slug}.weddiners.com.br</p>
                    </div>
                  </div>
                  {/*
                    Viewport 1280×1600 → hero (min-h-screen=1600px) fills full height.
                    We scroll the iframe to 820px on load, jumping past the hero.
                    scale=0.297 → visible area ≈ 380×461px showing sections.
                  */}
                  <div className="flex-1 overflow-hidden relative">
                    <iframe
                      key={previewKey}
                      src={`/${couple.slug}`}
                      onLoad={(e) => {
                        try {
                          const doc = e.currentTarget.contentDocument ?? e.currentTarget.contentWindow?.document;
                          doc?.documentElement?.scrollTo?.(0, 820);
                        } catch {}
                      }}
                      className="absolute top-0 left-0"
                      style={{ width: 1280, height: 1600, transform: "scale(0.297)", transformOrigin: "top left", border: "none" }}
                      title="Prévia desktop"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Link */}
            <div className="p-3 border-t" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <div className="flex items-center gap-2 bg-ivory rounded-md px-3 py-2">
                <p className="font-body text-xs text-moss truncate flex-1">{couple.slug}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(publicUrl)}
                  className="text-smoke hover:text-moss text-xs font-body shrink-0"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
