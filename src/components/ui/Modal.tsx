"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(13,10,11,0.6)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={[
          "bg-white rounded-lg shadow-2xl w-full animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
          sizeClasses[size],
        ].join(" ")}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-noir/7 shrink-0">
            <h2 className="font-display text-2xl text-noir">{title}</h2>
            <button
              onClick={onClose}
              className="text-smoke hover:text-noir transition-colors p-1"
              aria-label="Fechar"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
