"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateSiteConfig, updateCoupleInfo, updateAppearance, updateSiteSettings, updateSections } from "./actions";

type SectionId = "about" | "rsvp" | "gifts" | "dresscode" | "schedule" | "directions" | "messages";

const DEFAULT_ORDER: SectionId[] = ["about", "rsvp", "gifts", "dresscode", "schedule", "directions", "messages"];

const SECTION_META: Record<SectionId, { label: string; defaultTitle: string }> = {
  about:      { label: "Sobre o casal",          defaultTitle: "Nossa História" },
  rsvp:       { label: "Confirmação de presença", defaultTitle: "Confirme sua Presença" },
  gifts:      { label: "Lista de presentes",      defaultTitle: "Lista de Presentes" },
  dresscode:  { label: "Dress Code",              defaultTitle: "Dress Code" },
  schedule:   { label: "Cronograma",              defaultTitle: "Cronograma" },
  directions: { label: "Como Chegar",             defaultTitle: "Como Chegar" },
  messages:   { label: "Mural de Recados",        defaultTitle: "Mural de Recados" },
};

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
  gifts_notice: string | null;
  schedule: string | null;
  directions: string | null;
  directions_url: string | null;
  show_dresscode: boolean;
  show_schedule: boolean;
  show_directions: boolean;
  show_messages: boolean;
  section_order: string | null;
  about_title: string | null;
  rsvp_title: string | null;
  gifts_title: string | null;
  dresscode_title: string | null;
  schedule_title: string | null;
  directions_title: string | null;
  messages_title: string | null;
}

interface Couple {
  partner1_name: string | null;
  partner2_name: string | null;
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  wedding_location: string | null;
  slug: string;
  site_password_enabled?: boolean | null;
  site_password?: string | null;
  translations_enabled?: boolean | null;
  translation_languages?: string[] | null;
}

const LANGUAGES = [
  { code: "en", label: "Inglês", flag: "🇺🇸" },
  { code: "es", label: "Espanhol", flag: "🇪🇸" },
  { code: "fr", label: "Francês", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Alemão", flag: "🇩🇪" },
  { code: "ja", label: "Japonês", flag: "🇯🇵" },
  { code: "zh-CN", label: "Chinês", flag: "🇨🇳" },
  { code: "ar", label: "Árabe", flag: "🇸🇦" },
];

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
  { id: "azul-marinho", label: "Azul Marinho", colors: ["#1B2A4A", "#E8EEF5", "#C9A96E"] },
  { id: "terracota", label: "Terracota", colors: ["#C4704A", "#F5EDE8", "#4A3728"] },
  { id: "lavanda", label: "Lavanda", colors: ["#8B7FB8", "#F0EEF8", "#2D2140"] },
  { id: "custom", label: "Personalizada", colors: [] },
];

function parseCustomPalette(palette: string | null): [string, string, string] {
  if (!palette?.startsWith("custom|")) return ["#7A8C6A", "#EDE4D0", "#1C2018"];
  const parts = palette.split("|");
  return [parts[1] ?? "#7A8C6A", parts[2] ?? "#EDE4D0", parts[3] ?? "#1C2018"];
}

type Tab = "aparencia" | "secoes" | "configuracoes";

// ─── Toggle component ───────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${value ? "bg-moss" : "bg-smoke/20"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Section Card ───────────────────────────────────────────────────────────
function SectionCard({
  id,
  index,
  isOn,
  title,
  expanded,
  onToggle,
  onTitleChange,
  onExpandToggle,
  onDragStart,
  onDragEnter,
  onDragEnd,
  children,
}: {
  id: SectionId;
  index: number;
  isOn: boolean;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  onTitleChange: (v: string) => void;
  onExpandToggle: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  children?: React.ReactNode;
}) {
  const meta = SECTION_META[id];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={e => e.preventDefault()}
      className={`rounded-lg border transition-all select-none ${
        isOn
          ? "bg-white border-moss/20"
          : "bg-ivory border-transparent"
      }`}
      style={{ borderColor: isOn ? "rgba(58,74,48,0.15)" : "rgba(13,10,11,0.06)" }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-smoke/40 shrink-0 cursor-grab active:cursor-grabbing">
          <circle cx="4" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="4" cy="7" r="1.2" fill="currentColor"/>
          <circle cx="4" cy="11" r="1.2" fill="currentColor"/>
          <circle cx="10" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="10" cy="7" r="1.2" fill="currentColor"/>
          <circle cx="10" cy="11" r="1.2" fill="currentColor"/>
        </svg>

        <Toggle value={isOn} onChange={onToggle} />

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder={meta.defaultTitle}
          className={`flex-1 min-w-0 bg-transparent font-body text-sm font-medium outline-none border-b border-transparent focus:border-moss/30 transition-colors py-0.5 ${isOn ? "text-noir" : "text-smoke"}`}
        />

        {/* Expand/collapse button — only when section is active and has content fields */}
        {isOn && children && (
          <button
            type="button"
            onClick={onExpandToggle}
            className="p-1 text-smoke hover:text-noir transition-colors shrink-0"
          >
            <svg
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}
              viewBox="0 0 24 24"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Order badge */}
        {isOn && (
          <span className="font-body text-[10px] text-moss/50 shrink-0 w-4 text-right">{index + 1}</span>
        )}
      </div>

      {/* Expanded content */}
      {isOn && expanded && children && (
        <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: "rgba(13,10,11,0.06)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main SiteEditor component ───────────────────────────────────────────────
export function SiteEditor({ config, couple, plan = "free" }: { config: SiteConfig; couple: Couple; plan?: "free" | "pro" }) {
  const [tab, setTab] = useState<Tab>("aparencia");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingCouple, setSavingCouple] = useState(false);
  const [error, setError] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const appearanceFormRef = useRef<HTMLFormElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstAppearanceRender = useRef(true);

  // Controlled state for palette and template
  const initialPaletteId = config.palette?.startsWith("custom|") ? "custom" : (config.palette ?? "sage");
  const [selectedPalette, setSelectedPalette] = useState(initialPaletteId);
  const [selectedTemplate, setSelectedTemplate] = useState(config.template ?? "classico");
  const initialCustomColors = parseCustomPalette(config.palette);
  const [customColors, setCustomColors] = useState<[string, string, string]>(initialCustomColors);

  const refreshPreview = useCallback(() => setPreviewKey(k => k + 1), []);

  // Ouve cliques nas seções do preview (postMessage do iframe)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type !== "weddiners-section-click") return;
      const sectionId = e.data.sectionId as string;
      if (!sectionId) return;

      // Vai para a aba Seções
      if (sectionId === "hero") {
        setTab("secoes");
        return;
      }
      setTab("secoes");
      // Expande a seção clicada
      setExpanded(prev => ({ ...prev, [sectionId as SectionId]: true }));
      // Ativa a seção se estiver desligada
      setSectionChecked(prev => {
        if (prev[sectionId as SectionId] === false) return { ...prev, [sectionId as SectionId]: true };
        return prev;
      });
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

  // ─── Sections state ─────────────────────────────────────────────────────────
  const parsedOrder: SectionId[] = (() => {
    try { return JSON.parse(config.section_order ?? "null") ?? DEFAULT_ORDER; }
    catch { return DEFAULT_ORDER; }
  })();

  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(parsedOrder);
  const [sectionChecked, setSectionChecked] = useState<Record<SectionId, boolean>>({
    about: config.show_about,
    rsvp: config.show_rsvp,
    gifts: config.show_gifts,
    dresscode: config.show_dresscode,
    schedule: config.show_schedule,
    directions: config.show_directions,
    messages: config.show_messages,
  });
  const [sectionTitles, setSectionTitles] = useState<Record<SectionId, string>>({
    about:      config.about_title      ?? "",
    rsvp:       config.rsvp_title       ?? "",
    gifts:      config.gifts_title      ?? "",
    dresscode:  config.dresscode_title  ?? "",
    schedule:   config.schedule_title   ?? "",
    directions: config.directions_title ?? "",
    messages:   config.messages_title   ?? "",
  });
  const [sectionContent, setSectionContent] = useState({
    about_text:     config.about_text      ?? "",
    dresscode:      config.dresscode       ?? "",
    gifts_notice:   config.gifts_notice    ?? "",
    schedule:       config.schedule        ?? "",
    directions:     config.directions      ?? "",
    directions_url: config.directions_url  ?? "",
    hero_title:     config.hero_title      ?? "",
    hero_subtitle:  config.hero_subtitle   ?? "",
  });
  const [expanded, setExpanded] = useState<Partial<Record<SectionId, boolean>>>({});

  // Drag & drop
  const dragItem = useRef<number | null>(null);

  function handleDragStart(index: number) { dragItem.current = index; }
  function handleDragEnter(index: number) {
    if (dragItem.current === null || dragItem.current === index) return;
    setSectionOrder(prev => {
      const next = [...prev];
      const dragged = next.splice(dragItem.current!, 1)[0];
      next.splice(index, 0, dragged);
      dragItem.current = index;
      return next;
    });
  }
  function handleDragEnd() { dragItem.current = null; }

  // Sections save handler
  async function handleSaveSections() {
    setSaving(true);
    setError("");

    // Build FormData for content + titles
    const fd = new FormData();
    fd.set("palette", selectedPalette === "custom" ? `custom|${customColors[0]}|${customColors[1]}|${customColors[2]}` : selectedPalette);
    fd.set("template", selectedTemplate);
    fd.set("cover_photo_url", config.cover_photo_url ?? "");
    fd.set("hero_title", sectionContent.hero_title);
    fd.set("hero_subtitle", sectionContent.hero_subtitle);
    fd.set("about_text", sectionContent.about_text);
    fd.set("dresscode", sectionContent.dresscode);
    fd.set("gifts_notice", sectionContent.gifts_notice);
    fd.set("schedule", sectionContent.schedule);
    fd.set("directions", sectionContent.directions);
    fd.set("directions_url", sectionContent.directions_url);
    fd.set("about_title", sectionTitles.about);
    fd.set("rsvp_title", sectionTitles.rsvp);
    fd.set("gifts_title", sectionTitles.gifts);
    fd.set("dresscode_title", sectionTitles.dresscode);
    fd.set("schedule_title", sectionTitles.schedule);
    fd.set("directions_title", sectionTitles.directions);
    fd.set("messages_title", sectionTitles.messages);

    // Save content + titles via updateSiteConfig
    const [contentResult, sectionsResult] = await Promise.all([
      updateSiteConfig(fd),
      updateSections(sectionOrder, sectionChecked),
    ]);

    if (contentResult?.error) { setError(contentResult.error); setSaving(false); return; }
    if (sectionsResult?.error) { setError(sectionsResult.error); setSaving(false); return; }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refreshPreview();
    setSaving(false);
  }

  // Couple save handler
  async function handleSaveCouple(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingCouple(true);
    setError("");
    const result = await updateCoupleInfo(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); refreshPreview(); }
    setSavingCouple(false);
  }

  // Appearance save (for the button in the tab)
  async function handleSaveAppearance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("hero_title", config.hero_title ?? "");
    fd.set("hero_subtitle", config.hero_subtitle ?? "");
    fd.set("about_text", config.about_text ?? "");
    fd.set("dresscode", config.dresscode ?? "");
    fd.set("gifts_notice", config.gifts_notice ?? "");
    fd.set("schedule", config.schedule ?? "");
    fd.set("directions", config.directions ?? "");
    fd.set("directions_url", config.directions_url ?? "");
    const result = await updateSiteConfig(fd);
    if (result?.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); refreshPreview(); }
    setSaving(false);
  }

  // Settings state
  const [pwEnabled, setPwEnabled] = useState(!!couple.site_password_enabled);
  const [pwValue, setPwValue] = useState(couple.site_password ?? "");
  const [pwShow, setPwShow] = useState(false);
  const [transEnabled, setTransEnabled] = useState(!!couple.translations_enabled);
  const [transLangs, setTransLangs] = useState<string[]>(couple.translation_languages ?? []);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  function toggleLang(code: string) {
    setTransLangs(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    const result = await updateSiteSettings({
      passwordEnabled: pwEnabled,
      password: pwValue,
      translationsEnabled: transEnabled,
      translationLanguages: transLangs,
    });
    if (!result?.error) { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); refreshPreview(); }
    setSavingSettings(false);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "aparencia", label: "Aparência" },
    { id: "secoes", label: "Seções" },
    { id: "configuracoes", label: "Configurações" },
  ];

  // Sections with expandable content
  const SECTIONS_WITH_CONTENT: Partial<Record<SectionId, React.ReactNode>> = {
    about: (
      <>
        <label className="font-body text-xs text-smoke block mb-1">Texto da seção</label>
        <Textarea
          name="about_text"
          value={sectionContent.about_text}
          onChange={e => setSectionContent(p => ({ ...p, about_text: e.target.value }))}
          placeholder="Conte um pouco da história de vocês..."
          rows={4}
        />
      </>
    ),
    gifts: (
      <>
        <label className="font-body text-xs text-smoke block mb-1">Aviso para convidados</label>
        <p className="font-body text-[11px] text-smoke/70 mb-1.5">Aparece no topo da lista. Deixe em branco para ocultar.</p>
        <Textarea
          name="gifts_notice"
          value={sectionContent.gifts_notice}
          onChange={e => setSectionContent(p => ({ ...p, gifts_notice: e.target.value }))}
          placeholder="Ex: Os nomes são criativos, mas os presentes são reais!"
          rows={3}
        />
      </>
    ),
    dresscode: (
      <>
        <label className="font-body text-xs text-smoke block mb-1">Orientações de vestimenta</label>
        <Textarea
          name="dresscode"
          value={sectionContent.dresscode}
          onChange={e => setSectionContent(p => ({ ...p, dresscode: e.target.value }))}
          placeholder="Ex: Traje esporte fino. Preferência por tons terrosos e neutros."
          rows={3}
        />
      </>
    ),
    schedule: (
      <>
        <label className="font-body text-xs text-smoke block mb-1">Programação do dia</label>
        <p className="font-body text-[11px] text-smoke/70 mb-1.5">Uma linha por evento: &ldquo;18:00 Cerimônia&rdquo;</p>
        <Textarea
          name="schedule"
          value={sectionContent.schedule}
          onChange={e => setSectionContent(p => ({ ...p, schedule: e.target.value }))}
          placeholder={"17:30 Recepção\n18:00 Cerimônia\n19:30 Coquetel\n21:00 Jantar e festa"}
          rows={5}
        />
      </>
    ),
    directions: (
      <div className="space-y-3">
        <div>
          <label className="font-body text-xs text-smoke block mb-1">Descrição</label>
          <Textarea
            name="directions"
            value={sectionContent.directions}
            onChange={e => setSectionContent(p => ({ ...p, directions: e.target.value }))}
            placeholder="Ex: O local fica na Av. Paulista, 1000. Há estacionamento próprio."
            rows={3}
          />
        </div>
        <div>
          <label className="font-body text-xs text-smoke block mb-1">Link do Google Maps (opcional)</label>
          <input
            type="url"
            value={sectionContent.directions_url}
            onChange={e => setSectionContent(p => ({ ...p, directions_url: e.target.value }))}
            placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2 rounded-md border font-body text-sm outline-none focus:border-moss transition-colors"
            style={{ borderColor: "rgba(13,10,11,0.12)" }}
          />
        </div>
      </div>
    ),
  };

  return (
    <div className="flex h-full">
      {/* ── Editor Sidebar ── */}
      <div className="w-[360px] shrink-0 flex flex-col h-full bg-ivory border-r overflow-hidden" style={{ borderColor: "rgba(13,10,11,0.08)" }}>

        {/* Tabs header */}
        <div className="shrink-0 px-4 pt-4 pb-3 border-b bg-white" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <div className="flex gap-1 bg-ivory rounded-lg p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-md font-body text-xs font-medium transition-all ${
                  tab === t.id ? "bg-moss text-white shadow-sm" : "text-smoke hover:text-noir"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {error && <p className="text-rose text-xs font-body mt-2">{error}</p>}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">

        {/* Aparência */}
        {tab === "aparencia" && (
          <form ref={appearanceFormRef} onSubmit={handleSaveAppearance} className="space-y-6">
            <input type="hidden" name="show_gifts" value={config.show_gifts ? "on" : ""} />
            <input type="hidden" name="show_rsvp" value={config.show_rsvp ? "on" : ""} />
            <input type="hidden" name="show_about" value={config.show_about ? "on" : ""} />
            <input type="hidden" name="show_dresscode" value={config.show_dresscode ? "on" : ""} />
            <input type="hidden" name="show_schedule" value={config.show_schedule ? "on" : ""} />
            <input type="hidden" name="show_directions" value={config.show_directions ? "on" : ""} />
            <input type="hidden" name="show_messages" value={config.show_messages ? "on" : ""} />

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

        {/* Seções */}
        {tab === "secoes" && (
          <div className="space-y-4">
            {/* Card: Informações do casal */}
            <div className="bg-white rounded-lg border p-5" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <h3 className="font-display text-base text-noir mb-4">Informações do casal</h3>
              <form onSubmit={handleSaveCouple} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nome — Noiva/Noivo 1" name="partner1_name" defaultValue={couple.partner1_name ?? couple.bride_name} placeholder="Maria" />
                  <Input label="Nome — Noivo/Noiva 2" name="partner2_name" defaultValue={couple.partner2_name ?? couple.groom_name} placeholder="João" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Data do casamento" name="wedding_date" type="date" defaultValue={couple.wedding_date ?? ""} />
                  <Input label="Local" name="wedding_location" defaultValue={couple.wedding_location ?? ""} placeholder="São Paulo, SP" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-xs font-medium text-smoke block mb-1">Título do hero</label>
                    <input
                      type="text"
                      value={sectionContent.hero_title}
                      onChange={e => setSectionContent(p => ({ ...p, hero_title: e.target.value }))}
                      placeholder={`${couple.partner1_name ?? couple.bride_name} & ${couple.partner2_name ?? couple.groom_name}`}
                      className="w-full px-3 py-2 rounded-md border font-body text-sm outline-none focus:border-moss transition-colors"
                      style={{ borderColor: "rgba(13,10,11,0.12)" }}
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs font-medium text-smoke block mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={sectionContent.hero_subtitle}
                      onChange={e => setSectionContent(p => ({ ...p, hero_subtitle: e.target.value }))}
                      placeholder="21 de novembro de 2026 · São Paulo"
                      className="w-full px-3 py-2 rounded-md border font-body text-sm outline-none focus:border-moss transition-colors"
                      style={{ borderColor: "rgba(13,10,11,0.12)" }}
                    />
                  </div>
                </div>
                <Button type="submit" loading={savingCouple} className="w-full sm:w-auto">
                  {saved ? "Salvo!" : "Salvar informações"}
                </Button>
              </form>
            </div>

            {/* Seções do site */}
            <div className="bg-white rounded-lg border p-5" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base text-noir">Seções do site</h3>
              </div>
              <p className="font-body text-xs text-smoke mb-4">Ative, renomeie e arraste para reordenar. Expanda para editar o conteúdo.</p>

              <div className="space-y-2">
                {sectionOrder.map((id, index) => {
                  const hasContent = id in SECTIONS_WITH_CONTENT;
                  const isExpanded = !!expanded[id];
                  return (
                    <SectionCard
                      key={id}
                      id={id}
                      index={index}
                      isOn={sectionChecked[id]}
                      title={sectionTitles[id]}
                      expanded={isExpanded}
                      onToggle={() => setSectionChecked(prev => ({ ...prev, [id]: !prev[id] }))}
                      onTitleChange={v => setSectionTitles(prev => ({ ...prev, [id]: v }))}
                      onExpandToggle={() => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                    >
                      {hasContent ? SECTIONS_WITH_CONTENT[id] : undefined}
                    </SectionCard>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Button onClick={handleSaveSections} loading={saving} type="button">
                  {saved ? "Salvo!" : "Salvar seções"}
                </Button>
                {error && <p className="text-rose text-xs font-body">{error}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Configurações */}
        {tab === "configuracoes" && (
          <div className="space-y-4">
            {/* Senha de acesso */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <svg width="15" height="15" fill="none" stroke="#5A6A52" strokeWidth={1.8} viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-sm">Senha de acesso</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Os convidados precisarão digitar a senha para acessar o site.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPwEnabled(v => !v)}
                  className={["relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", pwEnabled ? "bg-sage" : "bg-neutral-200"].join(" ")}
                >
                  <span className={["pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out", pwEnabled ? "translate-x-5" : "translate-x-0"].join(" ")} />
                </button>
              </div>
              {pwEnabled && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Senha do site</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={pwShow ? "text" : "password"}
                        value={pwValue}
                        onChange={e => setPwValue(e.target.value)}
                        placeholder="Crie uma senha para o site"
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setPwShow(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {pwShow
                          ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1.5">Compartilhe a senha junto com o link do site.</p>
                </div>
              )}
            </div>

            {/* Traduções */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <svg width="15" height="15" fill="none" stroke="#5A6A52" strokeWidth={1.8} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="2" y1="12" x2="22" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-sm">Traduções</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Adiciona um botão no site para os convidados traduzirem para outros idiomas.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTransEnabled(v => !v)}
                  className={["relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", transEnabled ? "bg-sage" : "bg-neutral-200"].join(" ")}
                >
                  <span className={["pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out", transEnabled ? "translate-x-5" : "translate-x-0"].join(" ")} />
                </button>
              </div>
              {transEnabled && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-3">Idiomas disponíveis para os convidados</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => toggleLang(lang.code)}
                        className={["flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all", transLangs.includes(lang.code) ? "border-sage bg-sage/5 text-sage font-medium" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"].join(" ")}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {transLangs.includes(lang.code) && <svg className="ml-auto" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                  {transLangs.length === 0 && (
                    <p className="text-xs text-amber-500 mt-2">Selecione pelo menos um idioma.</p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings || (transEnabled && transLangs.length === 0)}
              className="btn-primary w-full py-3 disabled:opacity-40"
            >
              {savingSettings ? "Salvando..." : settingsSaved ? "Salvo!" : "Salvar configurações"}
            </button>
          </div>
        )}

        {/* Compartilhar — no fim do painel */}
        <div className="bg-white rounded-lg border p-5" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <h3 className="font-display text-base text-noir mb-3">Compartilhar</h3>
          <div className="space-y-2">
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
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Olá! Confirme sua presença no nosso casamento: ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-white text-sm font-body font-medium transition-opacity hover:opacity-90 w-full justify-center"
              style={{ background: "#25D366" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
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

        </div>{/* end scrollable content */}

        {/* Botão salvar fixo no rodapé */}
        <div className="shrink-0 border-t bg-white px-4 py-3" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          {tab === "aparencia" && (
            <button
              type="button"
              onClick={() => appearanceFormRef.current?.requestSubmit()}
              disabled={saving}
              className="w-full btn-primary py-2.5 text-sm disabled:opacity-40"
            >
              {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar aparência"}
            </button>
          )}
          {tab === "secoes" && (
            <button
              type="button"
              onClick={handleSaveSections}
              disabled={saving}
              className="w-full btn-primary py-2.5 text-sm disabled:opacity-40"
            >
              {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar seções"}
            </button>
          )}
          {tab === "configuracoes" && (
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings || (transEnabled && transLangs.length === 0)}
              className="w-full btn-primary py-2.5 text-sm disabled:opacity-40"
            >
              {savingSettings ? "Salvando..." : settingsSaved ? "✓ Salvo!" : "Salvar configurações"}
            </button>
          )}
        </div>
      </div>{/* end editor sidebar */}

      {/* ── Live Preview (ocupa o resto da tela) ── */}
      <div className="flex-1 flex flex-col h-full bg-neutral-100 overflow-hidden">
        {/* Toolbar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-white border-b" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              title="Mobile"
              className={`p-2 rounded-lg transition-colors ${device === "mobile" ? "bg-moss/10 text-moss" : "text-smoke hover:text-noir"}`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              title="Desktop"
              className={`p-2 rounded-lg transition-colors ${device === "desktop" ? "bg-moss/10 text-moss" : "text-smoke hover:text-noir"}`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={refreshPreview}
              title="Atualizar prévia"
              className="p-2 rounded-lg text-smoke hover:text-noir transition-colors"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-ivory border rounded-full px-3 py-1" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <p className="font-body text-[11px] text-smoke">{couple.slug}.weddiners.com.br</p>
            </div>
            <a
              href={`/${couple.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-body text-xs text-moss hover:underline px-2 py-1"
            >
              Abrir
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 flex items-start justify-center overflow-hidden p-6">
          {device === "mobile" ? (
            <div className="rounded-[2.5rem] border-[6px] border-noir/20 overflow-hidden shadow-2xl bg-white shrink-0" style={{ width: 300, height: 620 }}>
              <div className="w-full h-full overflow-hidden relative">
                <iframe
                  key={previewKey}
                  ref={iframeRef}
                  src={`/${couple.slug}?_preview=${previewKey}`}
                  className="absolute top-0 left-0"
                  style={{ width: 390, height: 804, transform: "scale(0.769)", transformOrigin: "top left", border: "none" }}
                  title="Prévia mobile"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full max-w-5xl flex flex-col bg-white rounded-xl overflow-hidden shadow-xl border" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b shrink-0" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
                <div className="w-3 h-3 rounded-full bg-rose/60" />
                <div className="w-3 h-3 rounded-full bg-gold/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                <div className="flex-1 bg-ivory rounded px-3 py-1 mx-2">
                  <p className="font-body text-[10px] text-smoke truncate">{couple.slug}.weddiners.com.br</p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <iframe
                  key={previewKey}
                  src={`/${couple.slug}?_preview=${previewKey}`}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: "none" }}
                  title="Prévia desktop"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
