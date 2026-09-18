"use client";

import { useEffect, useState } from "react";
import { REFERENCE_CATEGORIES, type Reference, type ReferenceCategory } from "./referencesData";
import { updateReference } from "./actions";

const SOURCE_LABELS = {
  pinterest: { label: "Pinterest", color: "#E60023" },
  instagram: { label: "Instagram", color: "#C13584" },
  upload:    { label: "Upload",    color: "#7A8C6A" },
  link:      { label: "Link",      color: "#1B3A5C" },
};

type Props = {
  ref_: Reference;
  total: number;
  index: number;
  allCategories?: ReferenceCategory[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, fields: { note?: string; category?: string }) => void;
};

export function ImageLightbox({ ref_, total, index, allCategories, onClose, onPrev, onNext, onDelete, onUpdate }: Props) {
  const categories = allCategories ?? REFERENCE_CATEGORIES;
  const cat = categories.find(c => c.id === ref_.category);
  const source = ref_.sourceType ? SOURCE_LABELS[ref_.sourceType] : null;

  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState(ref_.note ?? "");
  const [editCategory, setEditCategory] = useState(ref_.category);
  const [saving, setSaving] = useState(false);

  // Reset edit state when reference changes
  useEffect(() => {
    setEditing(false);
    setEditNote(ref_.note ?? "");
    setEditCategory(ref_.category);
  }, [ref_.id, ref_.note, ref_.category]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editing) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, editing]);

  async function handleSave() {
    setSaving(true);
    await updateReference(ref_.id, { note: editNote.trim() || undefined, category: editCategory });
    onUpdate?.(ref_.id, { note: editNote.trim() || undefined, category: editCategory });
    setEditing(false);
    setSaving(false);
  }

  const editCat = categories.find(c => c.id === editCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      {/* Fechar */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">{index + 1} / {total}</div>

      {total > 1 && (
        <button onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}

      {total > 1 && (
        <button onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}

      <div className="flex flex-col md:flex-row items-center gap-0 max-w-5xl w-full mx-4 md:mx-16 max-h-[90vh] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Imagem */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ref_.imageUrl} alt={ref_.note ?? cat?.label ?? "Referência"} className="max-h-[90vh] max-w-full object-contain" />
        </div>

        {/* Painel lateral */}
        <div className="w-full md:w-72 bg-white flex flex-col shrink-0 max-h-[90vh] overflow-y-auto">
          {editing ? (
            /* Modo edição */
            <>
              <div className="px-5 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-700">Editar referência</p>
                <button onClick={() => setEditing(false)} className="text-neutral-400 hover:text-neutral-600">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <div className="px-5 py-4 flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Categoria</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(c => (
                      <button key={c.id} onClick={() => setEditCategory(c.id)}
                        className={["px-2.5 py-1 rounded-full text-xs font-medium border transition-all", editCategory === c.id ? "border-transparent" : "bg-white border-neutral-200"].join(" ")}
                        style={editCategory === c.id ? { background: c.color, color: "white" } : { color: c.color }}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                  {editCat && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: editCat.bg, color: editCat.color }}>
                        {editCat.emoji} {editCat.label}
                      </span>
                      <span className="text-xs text-neutral-400">selecionada</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Nota</label>
                  <textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={4}
                    placeholder="Ex: Quero exatamente esse tom de verde..."
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage resize-none text-neutral-700 placeholder:text-neutral-300" />
                </div>
              </div>

              <div className="px-5 py-4 border-t border-neutral-100 flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 border border-neutral-200 rounded-lg py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          ) : (
            /* Modo visualização */
            <>
              <div className="px-5 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
                {cat ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
                    <span>{cat.emoji}</span><span>{cat.label}</span>
                  </span>
                ) : <span />}
                <button onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all" title="Editar">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="px-5 py-4 flex-1">
                {ref_.note ? (
                  <>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Nota</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{ref_.note}</p>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="text-sm text-neutral-400 italic hover:text-sage transition-colors">
                    Clique para adicionar uma nota...
                  </button>
                )}

                {source && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Fonte</p>
                    <span className="text-sm font-medium" style={{ color: source.color }}>{source.label}</span>
                  </div>
                )}

                {ref_.createdAt && (
                  <div className="mt-4">
                    <p className="text-xs text-neutral-300">
                      Salva em {new Date(ref_.createdAt + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-neutral-100 space-y-2">
                {ref_.sourceUrl && (
                  <a href={ref_.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full border border-neutral-200 rounded-lg py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
                    </svg>
                    Ver original
                  </a>
                )}
                <button onClick={() => { onDelete(ref_.id); onClose(); }}
                  className="flex items-center justify-center gap-2 w-full border border-red-100 rounded-lg py-2.5 text-sm font-medium text-red-400 hover:bg-red-50 transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Excluir referência
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
