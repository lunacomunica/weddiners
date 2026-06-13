"use client";

import { useState } from "react";
import { REFERENCE_CATEGORIES, type Reference } from "./referencesData";

const SOURCE_ICONS = {
  pinterest: { label: "Pinterest", color: "#E60023", icon: "P" },
  instagram: { label: "Instagram", color: "#C13584", icon: "IG" },
  upload:    { label: "Upload",    color: "#7A8C6A", icon: "↑" },
  link:      { label: "Link",      color: "#1B3A5C", icon: "🔗" },
};

export function ReferenceCard({ ref_, onDelete, onClick }: { ref_: Reference; onDelete: (id: string) => void; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cat = REFERENCE_CATEGORIES.find(c => c.id === ref_.category);
  const source = ref_.sourceType ? SOURCE_ICONS[ref_.sourceType] : null;

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-white border border-neutral-200 group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ref_.imageUrl}
          alt={ref_.note ?? cat?.label ?? "Referência"}
          className="w-full object-cover block"
          loading="lazy"
        />

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-black/30 flex items-start justify-end p-2 gap-1.5">
            {ref_.sourceUrl && (
              <a
                href={ref_.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="bg-white/90 p-1.5 rounded-lg hover:bg-white transition-colors"
                title="Ver original"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
                </svg>
              </a>
            )}
            {!confirmDelete ? (
              <button
                onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                className="bg-white/90 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onDelete(ref_.id); }}
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-medium"
              >
                Excluir?
              </button>
            )}
            {/* Ícone de expandir */}
            <div className="bg-white/90 p-1.5 rounded-lg pointer-events-none">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          {cat && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
              {cat.emoji} {cat.label}
            </span>
          )}
          {source && (
            <span className="text-xs font-bold" style={{ color: source.color }}>
              {source.icon}
            </span>
          )}
        </div>
        {ref_.note && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{ref_.note}</p>
        )}
      </div>
    </div>
  );
}
