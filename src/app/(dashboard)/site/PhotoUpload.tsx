"use client";

import { useState } from "react";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { saveSitePhotoUrl } from "./actions";

interface PhotoUploadProps {
  slot: "cover" | "about";
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspectRatio?: string;
}

export function PhotoUpload({ slot, value, onChange, label, hint, aspectRatio = "16/9" }: PhotoUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);

  async function handleRemove() {
    await saveSitePhotoUrl(slot, "");
    onChange("");
  }

  return (
    <div>
      {label && <label className="font-body text-xs text-smoke block mb-1.5">{label}</label>}

      <div
        className="relative rounded-xl overflow-hidden border-2 border-dashed cursor-pointer group transition-colors"
        style={{
          aspectRatio,
          borderColor: value ? "transparent" : "rgba(58,74,48,0.2)",
          background: value ? "transparent" : "rgba(58,74,48,0.04)",
        }}
        onClick={() => setModalOpen(true)}
      >
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all ${
            value
              ? "opacity-0 group-hover:opacity-100 bg-black/50"
              : "opacity-100"
          }`}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: value ? "rgba(255,255,255,0.2)" : "rgba(58,74,48,0.1)" }}>
            <svg width="16" height="16" fill="none" stroke={value ? "white" : "#3A4A30"} strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-body text-xs font-medium" style={{ color: value ? "white" : "#3A4A30" }}>
            {value ? "Trocar foto" : "Escolher foto"}
          </p>
          {!value && (
            <p className="font-body text-[11px]" style={{ color: "rgba(58,74,48,0.5)" }}>
              Da biblioteca ou novo upload
            </p>
          )}
        </div>
      </div>

      {value && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 font-body text-[11px] text-smoke hover:text-rose transition-colors flex items-center gap-1"
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
          </svg>
          Remover foto
        </button>
      )}

      {hint && <p className="font-body text-[11px] text-smoke/60 mt-1">{hint}</p>}

      <MediaLibraryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        slot={slot}
        onSelect={url => { onChange(url); setModalOpen(false); }}
      />
    </div>
  );
}
