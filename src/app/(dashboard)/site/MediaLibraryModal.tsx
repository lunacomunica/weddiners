"use client";

import { useEffect, useRef, useState } from "react";
import { uploadSitePhoto, listSitePhotos, saveSitePhotoUrl } from "./actions";

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  slot: "cover" | "about";
  onSelect: (url: string) => void;
}

export function MediaLibraryModal({ open, onClose, slot, onSelect }: MediaLibraryModalProps) {
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listSitePhotos().then(res => {
      setPhotos(res.photos ?? []);
      setLoading(false);
    });
  }, [open]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
    if (result?.url) {
      const newPhoto = { name: file.name, url: result.url };
      setPhotos(prev => [newPhoto, ...prev]);
      await handleSelect(result.url);
    }
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSelect(url: string) {
    await saveSitePhotoUrl(slot, url);
    onSelect(url);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
          <div>
            <h2 className="font-display text-lg text-noir">Biblioteca de mídias</h2>
            <p className="font-body text-xs text-smoke mt-0.5">Selecione uma foto existente ou envie uma nova</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-smoke hover:text-noir transition-colors rounded-lg hover:bg-ivory">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Upload button */}
        <div className="px-6 py-3 border-b" style={{ borderColor: "rgba(13,10,11,0.06)" }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed font-body text-sm font-medium transition-colors hover:border-moss hover:text-moss text-smoke"
            style={{ borderColor: "rgba(58,74,48,0.25)" }}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-moss/30 border-t-moss animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Enviar nova foto
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFile}
          />
          {error && <p className="font-body text-xs text-rose mt-2">{error}</p>}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-moss/30 border-t-moss animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">🖼️</p>
              <p className="font-display text-lg text-noir mb-1">Nenhuma foto ainda</p>
              <p className="font-body text-sm text-smoke">Envie sua primeira foto acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map(photo => (
                <button
                  key={photo.url}
                  type="button"
                  onClick={() => handleSelect(photo.url)}
                  className="relative aspect-square rounded-xl overflow-hidden group border-2 border-transparent hover:border-moss transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full px-3 py-1.5">
                      <p className="font-body text-xs font-medium text-noir">Selecionar</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
