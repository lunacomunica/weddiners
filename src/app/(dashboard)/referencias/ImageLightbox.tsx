"use client";

import { useEffect } from "react";
import { REFERENCE_CATEGORIES, type Reference } from "./referencesData";

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
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: (id: string) => void;
};

export function ImageLightbox({ ref_, total, index, onClose, onPrev, onNext, onDelete }: Props) {
  const cat = REFERENCE_CATEGORIES.find(c => c.id === ref_.category);
  const source = ref_.sourceType ? SOURCE_LABELS[ref_.sourceType] : null;

  // Navegação por teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Contador */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {index + 1} / {total}
      </div>

      {/* Seta anterior */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Seta próxima */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Conteúdo central */}
      <div
        className="flex flex-col md:flex-row items-center gap-0 max-w-5xl w-full mx-4 md:mx-16 max-h-[90vh] rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Imagem */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ref_.imageUrl}
            alt={ref_.note ?? cat?.label ?? "Referência"}
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>

        {/* Painel lateral */}
        <div className="w-full md:w-72 bg-white flex flex-col shrink-0 max-h-[90vh] overflow-y-auto">
          {/* Categoria */}
          <div className="px-5 pt-5 pb-4 border-b border-neutral-100">
            {cat && (
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                style={{ background: cat.bg, color: cat.color }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </span>
            )}
          </div>

          {/* Nota */}
          <div className="px-5 py-4 flex-1">
            {ref_.note ? (
              <>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Nota</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{ref_.note}</p>
              </>
            ) : (
              <p className="text-sm text-neutral-400 italic">Sem nota</p>
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

          {/* Ações */}
          <div className="px-5 py-4 border-t border-neutral-100 space-y-2">
            {ref_.sourceUrl && (
              <a
                href={ref_.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-neutral-200 rounded-lg py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
                </svg>
                Ver original
              </a>
            )}
            <button
              onClick={() => { onDelete(ref_.id); onClose(); }}
              className="flex items-center justify-center gap-2 w-full border border-red-100 rounded-lg py-2.5 text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Excluir referência
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
