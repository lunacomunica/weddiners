"use client";

import { useState } from "react";
import { postMessage } from "./actions";

interface Message {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

export function MessagesSection({
  slug,
  initialMessages,
  accentColor,
  textColor,
}: {
  slug: string;
  initialMessages: Message[];
  accentColor: string;
  textColor: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    const result = await postMessage(slug, name.trim(), text.trim());
    if (result.success && result.message) {
      setMessages(prev => [result.message!, ...prev]);
      setName("");
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }
    setSending(false);
  }

  return (
    <div>
      {/* Formulário */}
      <div className="max-w-lg mx-auto mb-10 rounded-xl p-6" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${accentColor}22` }}>
        <h3 className="font-display text-lg mb-4 text-center" style={{ color: textColor }}>Deixe seu recado</h3>
        {sent ? (
          <p className="text-center text-sm py-4" style={{ color: accentColor }}>Recado enviado! Obrigado</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-md text-sm outline-none border"
              style={{ borderColor: `${accentColor}33`, background: "rgba(255,255,255,0.8)", color: textColor, fontFamily: "var(--font-body)" }}
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Seu recado, votos ou mensagem ao casal..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-md text-sm outline-none border resize-none"
              style={{ borderColor: `${accentColor}33`, background: "rgba(255,255,255,0.8)", color: textColor, fontFamily: "var(--font-body)" }}
            />
            <button
              type="submit"
              disabled={sending || !name.trim() || !text.trim()}
              className="w-full py-2.5 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: accentColor, fontFamily: "var(--font-body)" }}
            >
              {sending ? "Enviando..." : "Enviar recado"}
            </button>
          </form>
        )}
      </div>

      {/* Lista de mensagens */}
      {messages.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className="rounded-lg p-5" style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${accentColor}18` }}>
              <p className="text-sm leading-relaxed mb-3 whitespace-pre-line" style={{ color: textColor, fontFamily: "var(--font-body)" }}>{m.message}</p>
              <p className="text-xs font-medium" style={{ color: accentColor, fontFamily: "var(--font-body)" }}>{m.guest_name}</p>
            </div>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <p className="text-center text-sm" style={{ color: `${textColor}60`, fontFamily: "var(--font-body)" }}>
          Ainda não há recados. Seja o primeiro!
        </p>
      )}
    </div>
  );
}
