"use client";

import { useState } from "react";
import { REFERENCE_CATEGORIES, type Reference } from "./referencesData";
import { addReference } from "./actions";

type Props = {
  onAdd: (ref: Reference) => void;
  onClose: () => void;
};

type Tab = "link" | "upload";

export function AddReferenceModal({ onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("link");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("decoracao");
  const [previewing, setPreviewing] = useState(false);
  const [previewImg, setPreviewImg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // imageData que será enviado para a action:
  // - tab "upload": base64 data URL
  // - tab "link": URL externa direta
  const [imageData, setImageData] = useState("");

  // Detecta se é Pinterest ou Instagram pelo URL
  function detectSource(url: string): Reference["sourceType"] {
    if (url.includes("pinterest")) return "pinterest";
    if (url.includes("instagram")) return "instagram";
    return "link";
  }

  async function handlePreviewUrl() {
    if (!url.trim()) return;
    setPreviewing(true);
    setError("");
    const isImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
    if (isImage) {
      setPreviewImg(url);
      setImageData(url);
    } else {
      setPreviewImg("");
      setImageData("");
      setError("Cole o link direto da imagem ou use a aba de upload. Em breve suportaremos links do Pinterest e Instagram automaticamente.");
    }
    setPreviewing(false);
  }

  async function handleSave() {
    if (!imageData) { setError("Adicione uma imagem válida"); return; }
    setSaving(true);
    setError("");

    const result = await addReference({
      category,
      imageData,
      note: note.trim() || undefined,
      sourceUrl: url.trim() || undefined,
      sourceType: tab === "upload" ? "upload" : detectSource(url),
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.reference) {
      onAdd(result.reference);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setPreviewImg(dataUrl);
      setImageData(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">Adicionar referência</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Tab */}
          <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => { setTab("link"); setPreviewImg(""); setImageData(""); setError(""); }}
              className={["flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                tab === "link" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500"
              ].join(" ")}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Link / Pinterest
            </button>
            <button
              onClick={() => { setTab("upload"); setPreviewImg(""); setImageData(""); setError(""); }}
              className={["flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                tab === "upload" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500"
              ].join(" ")}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
              </svg>
              Upload
            </button>
          </div>

          {/* Link tab */}
          {tab === "link" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">URL da imagem</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="url"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setPreviewImg(""); setImageData(""); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handlePreviewUrl()}
                  placeholder="Cole o link aqui..."
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
                <button
                  onClick={handlePreviewUrl}
                  disabled={previewing || !url.trim()}
                  className="bg-neutral-100 text-neutral-600 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {previewing ? "..." : "Pré-ver"}
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5">
                Pinterest, Instagram, ou link direto de imagem (.jpg, .png...)
              </p>
            </div>
          )}

          {/* Upload tab */}
          {tab === "upload" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Selecionar imagem</label>
              <label className="block border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center cursor-pointer hover:border-sage/50 transition-colors">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {previewImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImg} alt="Preview" className="max-h-32 mx-auto rounded-lg object-cover" />
                ) : (
                  <>
                    <svg className="mx-auto mb-2 text-neutral-300" width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
                    </svg>
                    <p className="text-sm text-neutral-400">Clique para selecionar</p>
                    <p className="text-xs text-neutral-300 mt-0.5">JPG, PNG, WEBP</p>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Preview de imagem do link */}
          {tab === "link" && previewImg && (
            <div className="rounded-xl overflow-hidden border border-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImg} alt="Preview" className="w-full max-h-48 object-cover" />
            </div>
          )}

          {error && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{error}</p>}

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {REFERENCE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={["px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    category === cat.id ? "border-transparent" : "bg-white border-neutral-200"
                  ].join(" ")}
                  style={category === cat.id ? { background: cat.color, color: "white" } : { color: cat.color }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: Quero exatamente esse tom de verde..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-neutral-200 rounded-lg py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!imageData || saving}
            className="btn-primary flex-1"
          >
            {saving ? "Salvando..." : "Salvar referência"}
          </button>
        </div>
      </div>
    </div>
  );
}
