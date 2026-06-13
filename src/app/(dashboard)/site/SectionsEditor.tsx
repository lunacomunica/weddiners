"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { updateSections } from "./actions";

const SECTION_META = {
  about:      { label: "Sobre o casal",               desc: "Foto e mensagem do casal" },
  rsvp:       { label: "Confirmação de presença",      desc: "Permite confirmar presença (RSVP)" },
  gifts:      { label: "Lista de presentes",           desc: "Presentes com pagamento via Pix" },
  dresscode:  { label: "Dress Code",                   desc: "Orientações de vestimenta" },
  schedule:   { label: "Cronograma",                   desc: "Horários e eventos do grande dia" },
  directions: { label: "Como Chegar",                  desc: "Endereço e instruções de acesso" },
  messages:   { label: "Mural de Recados",             desc: "Convidados podem deixar mensagens" },
} as const;

type SectionId = keyof typeof SECTION_META;
export const DEFAULT_ORDER: SectionId[] = ["about", "rsvp", "gifts", "dresscode", "schedule", "directions", "messages"];

interface Props {
  initialOrder: SectionId[];
  initialChecked: Record<SectionId, boolean>;
  onSaved: () => void;
}

export function SectionsEditor({ initialOrder, initialChecked, onSaved }: Props) {
  const [order, setOrder] = useState<SectionId[]>(initialOrder);
  const [checked, setChecked] = useState<Record<SectionId, boolean>>(initialChecked);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const save = useCallback(async (o: SectionId[], c: Record<SectionId, boolean>) => {
    setStatus("saving");
    await updateSections(o, c);
    setStatus("saved");
    onSaved();
    setTimeout(() => setStatus("idle"), 1500);
  }, [onSaved]);

  // Auto-save with debounce whenever order or checked changes (skip initial mount)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(order, checked), 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [order, checked, save]);

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
    if (dragItem.current === null || dragItem.current === index) return;
    setOrder(prev => {
      const next = [...prev];
      const dragged = next.splice(dragItem.current!, 1)[0];
      next.splice(index, 0, dragged);
      dragItem.current = index;
      return next;
    });
  }

  function handleDragEnd() {
    dragItem.current = null;
    dragOverItem.current = null;
  }

  return (
    <div className="bg-white rounded-lg border p-6" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg text-noir">Seções do site</h3>
        <span className={`font-body text-xs transition-all ${
          status === "saving" ? "text-smoke" : status === "saved" ? "text-moss" : "text-transparent"
        }`}>
          {status === "saving" ? "Salvando..." : "Salvo e atualizado"}
        </span>
      </div>
      <p className="font-body text-xs text-smoke mb-5">Ative ou desative seções e arraste para reordenar</p>

      <div className="space-y-2">
        {order.map((id, index) => {
          const meta = SECTION_META[id];
          const isOn = checked[id];
          return (
            <div
              key={id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border transition-all select-none ${
                isOn
                  ? "bg-white border-moss/20 cursor-grab active:cursor-grabbing"
                  : "bg-ivory border-transparent cursor-grab active:cursor-grabbing"
              }`}
              style={{ borderColor: isOn ? "rgba(58,74,48,0.15)" : "transparent" }}
            >
              {/* Drag handle */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-smoke/40 shrink-0">
                <circle cx="4" cy="3" r="1.2" fill="currentColor"/>
                <circle cx="4" cy="7" r="1.2" fill="currentColor"/>
                <circle cx="4" cy="11" r="1.2" fill="currentColor"/>
                <circle cx="10" cy="3" r="1.2" fill="currentColor"/>
                <circle cx="10" cy="7" r="1.2" fill="currentColor"/>
                <circle cx="10" cy="11" r="1.2" fill="currentColor"/>
              </svg>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => setChecked(prev => ({ ...prev, [id]: !prev[id] }))}
                className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${isOn ? "bg-moss" : "bg-smoke/20"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isOn ? "translate-x-4" : "translate-x-0"}`} />
              </button>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm font-medium ${isOn ? "text-noir" : "text-smoke"}`}>{meta.label}</p>
                <p className="font-body text-xs text-smoke/70 truncate">{meta.desc}</p>
              </div>

              {/* Order badge */}
              {isOn && (
                <span className="font-body text-[10px] text-moss/60 shrink-0">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
