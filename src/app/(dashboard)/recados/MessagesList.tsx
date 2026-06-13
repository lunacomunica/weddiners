"use client";

import { useState } from "react";
import { toggleMessageApproval, deleteMessage } from "./actions";

interface Message {
  id: string;
  guest_name: string;
  message: string;
  approved: boolean;
  created_at: string;
}

export function MessagesList({ messages: initial, coupleId: _coupleId }: { messages: Message[]; coupleId: string }) {
  const [messages, setMessages] = useState(initial);

  async function handleToggle(id: string, approved: boolean) {
    await toggleMessageApproval(id, !approved);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, approved: !approved } : m));
  }

  async function handleDelete(id: string) {
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-body text-smoke text-sm">Nenhum recado ainda.</p>
        <p className="font-body text-smoke text-xs mt-1">Ative o Mural de Recados no editor do site para começar a receber mensagens.</p>
      </div>
    );
  }

  const approved = messages.filter(m => m.approved);
  const pending = messages.filter(m => !m.approved);

  return (
    <div className="space-y-8 max-w-3xl">
      {pending.length > 0 && (
        <div>
          <h3 className="font-display text-base text-noir mb-3">Aguardando aprovação ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map(m => (
              <MessageCard key={m.id} message={m} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="font-display text-base text-noir mb-3">Aprovados ({approved.length})</h3>
        {approved.length === 0
          ? <p className="font-body text-smoke text-sm">Nenhum recado aprovado.</p>
          : (
            <div className="space-y-3">
              {approved.map(m => (
                <MessageCard key={m.id} message={m} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function MessageCard({ message: m, onToggle, onDelete }: {
  message: Message;
  onToggle: (id: string, approved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border p-5 flex gap-4" style={{ borderColor: "rgba(13,10,11,0.08)" }}>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-noir leading-relaxed mb-2 whitespace-pre-line">{m.message}</p>
        <div className="flex items-center gap-3">
          <p className="font-body text-xs font-medium text-moss">{m.guest_name}</p>
          <span className="text-smoke/40">·</span>
          <p className="font-body text-xs text-smoke">
            {new Date(m.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {m.approved
            ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-body">Visível</span>
            : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-body">Pendente</span>
          }
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={() => onToggle(m.id, m.approved)}
          className="text-xs font-body px-3 py-1.5 rounded-md border transition-colors hover:bg-ivory"
          style={{ borderColor: "rgba(13,10,11,0.12)", color: "#3A4A30" }}
        >
          {m.approved ? "Ocultar" : "Aprovar"}
        </button>
        <button
          onClick={() => onDelete(m.id)}
          className="text-xs font-body px-3 py-1.5 rounded-md border transition-colors hover:bg-rose/5"
          style={{ borderColor: "rgba(13,10,11,0.12)", color: "#B85C5C" }}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
