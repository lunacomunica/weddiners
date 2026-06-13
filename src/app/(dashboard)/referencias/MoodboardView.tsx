"use client";

import { useState } from "react";
import { REFERENCE_CATEGORIES, type Reference } from "./referencesData";
import { deleteReference } from "./actions";
import { AddReferenceModal } from "./AddReferenceModal";
import { ReferenceCard } from "./ReferenceCard";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  initialReferences: Reference[];
};

export function MoodboardView({ initialReferences }: Props) {
  const [references, setReferences] = useState<Reference[]>(initialReferences);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [addModal, setAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === "todos"
    ? references
    : references.filter(r => r.category === activeCategory);

  const categoriesWithCount = REFERENCE_CATEGORIES.map(cat => ({
    ...cat,
    count: references.filter(r => r.category === cat.id).length,
  })).filter(c => c.count > 0);

  function handleAdd(ref: Reference) {
    setReferences(prev => [ref, ...prev]);
    setAddModal(false);
  }

  async function handleDelete(id: string) {
    // Optimistic update
    setReferences(prev => prev.filter(r => r.id !== id));
    await deleteReference(id);
  }

  // Slug compartilhável (mock por agora)
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/moodboard/vanessa-e-pedro`;

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">{references.length} referências salvas</span>

          {/* View toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode("masonry")}
              title="Mosaico"
              className={["p-1.5 rounded-md transition-all", viewMode === "masonry" ? "bg-white shadow-sm" : "text-neutral-400 hover:text-neutral-600"].join(" ")}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="9" rx="1"/>
                <rect x="9" y="1" width="6" height="5" rx="1"/>
                <rect x="9" y="8" width="6" height="7" rx="1"/>
                <rect x="1" y="12" width="6" height="3" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grade"
              className={["p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-white shadow-sm" : "text-neutral-400 hover:text-neutral-600"].join(" ")}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" rx="1"/>
                <rect x="9" y="1" width="6" height="6" rx="1"/>
                <rect x="1" y="9" width="6" height="6" rx="1"/>
                <rect x="9" y="9" width="6" height="6" rx="1"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Share button */}
          <button
            onClick={() => { navigator.clipboard?.writeText(shareUrl); }}
            className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round"/>
            </svg>
            Compartilhar com fornecedor
          </button>

          {/* Add button */}
          <button
            onClick={() => setAddModal(true)}
            className="btn-texture"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Adicionar referência
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory("todos")}
          className={["px-4 py-2 rounded-full text-sm font-medium border transition-all",
            activeCategory === "todos"
              ? "bg-neutral-800 text-white border-neutral-800"
              : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
          ].join(" ")}
        >
          Todos <span className="ml-1 opacity-60">({references.length})</span>
        </button>
        {categoriesWithCount.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={["px-4 py-2 rounded-full text-sm font-medium border transition-all",
              activeCategory === cat.id
                ? "border-transparent"
                : "bg-white border-neutral-200 hover:border-neutral-300"
            ].join(" ")}
            style={activeCategory === cat.id
              ? { background: cat.color, color: "white", borderColor: cat.color }
              : { color: cat.color }
            }
          >
            {cat.emoji} {cat.label} <span className="ml-1 opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-neutral-200">
          <div className="text-5xl mb-4">📌</div>
          <p className="text-neutral-600 font-medium mb-1">Nenhuma referência ainda</p>
          <p className="text-neutral-400 text-sm mb-6">Adicione fotos do Pinterest, Instagram ou faça upload de imagens</p>
          <button onClick={() => setAddModal(true)} className="btn-primary">
            Adicionar primeira referência
          </button>
        </div>
      )}

      {/* Masonry grid */}
      {filtered.length > 0 && viewMode === "masonry" && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((ref, idx) => (
            <div key={ref.id} className="break-inside-avoid">
              <ReferenceCard ref_={ref} onDelete={handleDelete} onClick={() => setLightboxIndex(idx)} />
            </div>
          ))}
        </div>
      )}

      {/* Regular grid */}
      {filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ref, idx) => (
            <ReferenceCard key={ref.id} ref_={ref} onDelete={handleDelete} onClick={() => setLightboxIndex(idx)} />
          ))}
        </div>
      )}

      {addModal && (
        <AddReferenceModal onAdd={handleAdd} onClose={() => setAddModal(false)} />
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          ref_={filtered[lightboxIndex]}
          total={filtered.length}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : 0)}
          onNext={() => setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : 0)}
          onDelete={id => { handleDelete(id); setLightboxIndex(null); }}
        />
      )}
    </div>
  );
}
