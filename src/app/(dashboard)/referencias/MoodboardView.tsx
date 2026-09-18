"use client";

import { useState } from "react";
import { REFERENCE_CATEGORIES, type Reference, type ReferenceCategory } from "./referencesData";
import { deleteReference } from "./actions";
import { AddReferenceModal } from "./AddReferenceModal";
import { ReferenceCard } from "./ReferenceCard";
import { ImageLightbox } from "./ImageLightbox";

type Props = { initialReferences: Reference[] };

const CAT_COLORS = [
  { color: "#7A8C6A", bg: "#F0F4ED" },
  { color: "#C4704A", bg: "#FAF0EA" },
  { color: "#1B3A5C", bg: "#EEF3F8" },
  { color: "#7B6BA8", bg: "#F5F3FB" },
  { color: "#C4707A", bg: "#FDF3F4" },
  { color: "#5A7A6A", bg: "#EDF4F0" },
  { color: "#A0729A", bg: "#F8F3F8" },
  { color: "#2A6A8C", bg: "#EAF4FA" },
  { color: "#8C7A5A", bg: "#F7F3ED" },
  { color: "#B5892A", bg: "#FBF6EA" },
];

const CAT_EMOJIS = ["📁", "🎨", "💡", "⭐", "🌿", "🎀", "🕊️", "🪷", "🎭", "✨"];

function ls<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}

export function MoodboardView({ initialReferences }: Props) {
  const [references, setReferences] = useState<Reference[]>(initialReferences);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [addModal, setAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Custom categories (new ones created by user)
  const [customCats, setCustomCats] = useState<ReferenceCategory[]>(() => ls("weddiners_ref_custom_cats", []));
  // Overrides for fixed categories: { [id]: { label?: string } }
  const [catOverrides, setCatOverrides] = useState<Record<string, { label: string; emoji?: string }>>(() => ls("weddiners_ref_cat_overrides", {}));
  // Hidden fixed category ids
  const [hiddenCats, setHiddenCats] = useState<string[]>(() => ls("weddiners_ref_hidden_cats", []));

  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(0);
  const [newCatEmoji, setNewCatEmoji] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editEmoji, setEditEmoji] = useState(0);

  // Compute allCategories: fixed (not hidden, with label/emoji overrides) + custom
  const allCategories: ReferenceCategory[] = [
    ...REFERENCE_CATEGORIES
      .filter(c => !hiddenCats.includes(c.id))
      .map(c => catOverrides[c.id] ? { ...c, ...catOverrides[c.id] } : c),
    ...customCats,
  ];

  function persistCustomCats(cats: ReferenceCategory[]) {
    setCustomCats(cats);
    localStorage.setItem("weddiners_ref_custom_cats", JSON.stringify(cats));
  }

  function handleCreateCat() {
    if (!newCatLabel.trim()) return;
    const { color, bg } = CAT_COLORS[newCatColor];
    const id = newCatLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + Date.now();
    persistCustomCats([...customCats, { id, label: newCatLabel.trim(), emoji: CAT_EMOJIS[newCatEmoji], color, bg }]);
    setNewCatLabel("");
    setCreatingCat(false);
  }

  function handleEditStart(cat: ReferenceCategory) {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    const emojiIdx = CAT_EMOJIS.indexOf(cat.emoji);
    setEditEmoji(emojiIdx >= 0 ? emojiIdx : 0);
  }

  function handleEditSave() {
    if (!editingId || !editLabel.trim()) { setEditingId(null); return; }
    const isFixed = REFERENCE_CATEGORIES.some(c => c.id === editingId);
    if (isFixed) {
      const overrides = { ...catOverrides, [editingId]: { label: editLabel.trim(), emoji: CAT_EMOJIS[editEmoji] } };
      setCatOverrides(overrides);
      localStorage.setItem("weddiners_ref_cat_overrides", JSON.stringify(overrides));
    } else {
      persistCustomCats(customCats.map(c => c.id === editingId ? { ...c, label: editLabel.trim(), emoji: CAT_EMOJIS[editEmoji] } : c));
    }
    setEditingId(null);
  }

  function handleDeleteCat(id: string) {
    if (!confirm("Excluir esta categoria? As referências dela ficam sem categoria.")) return;
    const isFixed = REFERENCE_CATEGORIES.some(c => c.id === id);
    if (isFixed) {
      const hidden = [...hiddenCats, id];
      setHiddenCats(hidden);
      localStorage.setItem("weddiners_ref_hidden_cats", JSON.stringify(hidden));
    } else {
      persistCustomCats(customCats.filter(c => c.id !== id));
    }
    if (activeCategory === id) setActiveCategory("todos");
  }

  const filtered = activeCategory === "todos"
    ? references
    : references.filter(r => r.category === activeCategory);

  const categoriesWithCount = allCategories.map(cat => ({
    ...cat,
    count: references.filter(r => r.category === cat.id).length,
  })).filter(c => c.count > 0 || customCats.some(cc => cc.id === c.id));

  function handleAdd(ref: Reference) {
    setReferences(prev => [ref, ...prev]);
    setAddModal(false);
  }

  async function handleDelete(id: string) {
    setReferences(prev => prev.filter(r => r.id !== id));
    await deleteReference(id);
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/moodboard/vanessa-e-pedro`;

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">{references.length} referências salvas</span>
          <div className="flex bg-neutral-100 rounded-lg p-1 gap-0.5">
            <button onClick={() => setViewMode("masonry")} title="Mosaico"
              className={["p-1.5 rounded-md transition-all", viewMode === "masonry" ? "bg-white shadow-sm" : "text-neutral-400 hover:text-neutral-600"].join(" ")}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="9" rx="1"/><rect x="9" y="1" width="6" height="5" rx="1"/>
                <rect x="9" y="8" width="6" height="7" rx="1"/><rect x="1" y="12" width="6" height="3" rx="1"/>
              </svg>
            </button>
            <button onClick={() => setViewMode("grid")} title="Grade"
              className={["p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-white shadow-sm" : "text-neutral-400 hover:text-neutral-600"].join(" ")}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard?.writeText(shareUrl); }}
            className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round"/>
            </svg>
            Compartilhar com fornecedor
          </button>
          <button onClick={() => setAddModal(true)} className="btn-texture">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Adicionar referência
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6 items-center">
        <button onClick={() => setActiveCategory("todos")}
          className={["px-4 py-2 rounded-full text-sm font-medium border transition-all", activeCategory === "todos" ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"].join(" ")}>
          Todos <span className="ml-1 opacity-60">({references.length})</span>
        </button>

        {categoriesWithCount.map(cat => {
          const isEditing = editingId === cat.id;
          const isActive = activeCategory === cat.id;

          return (
            <div key={cat.id} className="relative group/cat flex items-center">
              <button onClick={() => setActiveCategory(cat.id)}
                className={["px-4 py-2 rounded-full text-sm font-medium border transition-all", isActive ? "border-transparent" : "bg-white border-neutral-200 hover:border-neutral-300"].join(" ")}
                style={isActive ? { background: cat.color, color: "white" } : { color: cat.color }}>
                {cat.emoji} {cat.label} <span className="ml-1 opacity-60">({cat.count})</span>
              </button>

              <div className="absolute -top-1 -right-1 hidden group-hover/cat:flex gap-0.5">
                <button onClick={() => handleEditStart(cat)}
                  className="w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm hover:border-sage hover:text-sage transition-colors text-neutral-400">
                  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => handleDeleteCat(cat.id)}
                  className="w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm hover:border-red-300 hover:text-red-400 transition-colors text-neutral-400">
                  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Edit popover */}
              {isEditing && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setEditingId(null)} />
                  <div className="absolute left-0 top-10 bg-white border border-neutral-200 rounded-2xl p-4 shadow-lg z-20 w-64">
                    <p className="text-xs font-semibold text-neutral-700 mb-3">Editar categoria</p>
                    <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") setEditingId(null); }}
                      placeholder="Nome..." className="w-full text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage mb-3" />
                    <p className="text-xs text-neutral-400 mb-1.5">Emoji</p>
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {CAT_EMOJIS.map((em, i) => (
                        <button key={i} onClick={() => setEditEmoji(i)}
                          className={["w-7 h-7 rounded-lg text-sm transition-all flex items-center justify-center", editEmoji === i ? "bg-sage/10 ring-2 ring-sage" : "hover:bg-neutral-100"].join(" ")}>
                          {em}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleEditSave} className="btn-primary text-xs py-1.5">Salvar</button>
                      <button onClick={() => setEditingId(null)} className="text-neutral-400 text-xs hover:text-neutral-600">Cancelar</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Nova categoria */}
        <div className="relative">
          <button onClick={() => setCreatingCat(v => !v)}
            className="w-8 h-8 rounded-full border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-sage hover:text-sage transition-colors flex items-center justify-center"
            title="Nova categoria">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {creatingCat && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCreatingCat(false)} />
              <div className="absolute left-0 top-10 bg-white border border-neutral-200 rounded-2xl p-4 shadow-lg z-20 w-72">
                <p className="text-xs font-semibold text-neutral-700 mb-3">Nova categoria</p>
                <input autoFocus value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateCat(); if (e.key === "Escape") setCreatingCat(false); }}
                  placeholder="Nome..." className="w-full text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage mb-3" />
                <div className="mb-2">
                  <p className="text-xs text-neutral-400 mb-1.5">Emoji</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CAT_EMOJIS.map((em, i) => (
                      <button key={i} onClick={() => setNewCatEmoji(i)}
                        className={["w-7 h-7 rounded-lg text-sm transition-all flex items-center justify-center", newCatEmoji === i ? "bg-sage/10 ring-2 ring-sage" : "hover:bg-neutral-100"].join(" ")}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-neutral-400 mb-1.5">Cor</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CAT_COLORS.map((c, i) => (
                      <button key={i} onClick={() => setNewCatColor(i)}
                        className={["w-6 h-6 rounded-full border-2 transition-all", newCatColor === i ? "border-neutral-800 scale-110" : "border-transparent"].join(" ")}
                        style={{ background: c.color }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateCat} className="btn-primary text-xs py-1.5">Criar</button>
                  <button onClick={() => setCreatingCat(false)} className="text-neutral-400 text-xs hover:text-neutral-600">Cancelar</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-neutral-200">
          <div className="text-5xl mb-4">📌</div>
          <p className="text-neutral-600 font-medium mb-1">Nenhuma referência ainda</p>
          <p className="text-neutral-400 text-sm mb-6">Adicione fotos do Pinterest, Instagram ou faça upload de imagens</p>
          <button onClick={() => setAddModal(true)} className="btn-primary">Adicionar primeira referência</button>
        </div>
      )}

      {filtered.length > 0 && viewMode === "masonry" && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((ref, idx) => (
            <div key={ref.id} className="break-inside-avoid">
              <ReferenceCard ref_={ref} onDelete={handleDelete} onClick={() => setLightboxIndex(idx)} />
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ref, idx) => (
            <ReferenceCard key={ref.id} ref_={ref} onDelete={handleDelete} onClick={() => setLightboxIndex(idx)} />
          ))}
        </div>
      )}

      {addModal && (
        <AddReferenceModal allCategories={allCategories} onAdd={handleAdd} onClose={() => setAddModal(false)} />
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          ref_={filtered[lightboxIndex]}
          total={filtered.length}
          index={lightboxIndex}
          allCategories={allCategories}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : 0)}
          onNext={() => setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : 0)}
          onDelete={id => { handleDelete(id); setLightboxIndex(null); }}
          onUpdate={(id, fields) => setReferences(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r))}
        />
      )}
    </div>
  );
}
