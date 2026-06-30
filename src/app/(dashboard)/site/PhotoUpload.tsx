"use client";

import { useRef, useState } from "react";
import { uploadSitePhoto } from "./actions";

interface PhotoUploadProps {
  slot: "cover" | "about";
  value: string;           // current URL (controlled)
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspectRatio?: string;    // CSS aspect-ratio, eg "16/9" or "3/4"
}

export function PhotoUpload({ slot, value, onChange, label, hint, aspectRatio = "16/9" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: images only, max 8 MB
    if (!file.type.startsWith("image/")) { setError("Apenas imagens são permitidas."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Tamanho máximo: 8 MB."); return; }

    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("slot", slot);
    const result = await uploadSitePhoto(fd);
    setUploading(false);

    if (result?.error) { setError(result.error); return; }
    if (result?.url) onChange(result.url);
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
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {/* Preview */}
        {value && (
          <img
            src={value}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all ${
            value
              ? "opacity-0 group-hover:opacity-100 bg-black/50"
              : "opacity-100"
          }`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              <p className="font-body text-xs text-white">Enviando...</p>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: value ? "rgba(255,255,255,0.2)" : "rgba(58,74,48,0.1)" }}>
                <svg width="16" height="16" fill="none" stroke={value ? "white" : "#3A4A30"} strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-body text-xs font-medium" style={{ color: value ? "white" : "#3A4A30" }}>
                {value ? "Trocar foto" : "Fazer upload"}
              </p>
              <p className="font-body text-[11px]" style={{ color: value ? "rgba(255,255,255,0.7)" : "rgba(58,74,48,0.5)" }}>
                JPG, PNG ou WEBP · máx 8 MB
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFile}
          disabled={uploading}
        />
      </div>

      {/* Remove button */}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 font-body text-[11px] text-smoke hover:text-rose transition-colors flex items-center gap-1"
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
          </svg>
          Remover foto
        </button>
      )}

      {error && <p className="font-body text-xs text-rose mt-1">{error}</p>}
      {hint && !error && <p className="font-body text-[11px] text-smoke/60 mt-1">{hint}</p>}
    </div>
  );
}
