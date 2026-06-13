"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { generatePixPayload } from "@/lib/pix/generator";
import { registerContribution } from "./actions";

interface Gift {
  id: string;
  title: string;
  amount: number;
  is_group_gift: boolean;
}

interface GiftPixModalProps {
  open: boolean;
  onClose: () => void;
  gift: Gift;
  coupleId: string;
  pixKey: string;
  pixHolderName: string;
  pixCity: string;
}

type Step = "pix" | "confirm" | "done";

export function GiftPixModal({ open, onClose, gift, coupleId, pixKey, pixHolderName, pixCity }: GiftPixModalProps) {
  const [step, setStep] = useState<Step>("pix");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) { setStep("pix"); setCopied(false); return; }

    const payload = generatePixPayload({
      pixKey,
      holderName: pixHolderName,
      city: pixCity || "Brasil",
      amount: Number(gift.amount),
      description: gift.title.slice(0, 30),
    });
    setPixCode(payload);
    QRCode.toDataURL(payload, { width: 240, margin: 2, color: { dark: "#1C2018", light: "#FFFFFF" } })
      .then(setQrDataUrl);
  }, [open, gift, pixKey, pixHolderName, pixCity]);

  async function handleCopy() {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set("gift_id", gift.id);
    formData.set("couple_id", coupleId);
    formData.set("giver_name", giverName);
    formData.set("giver_email", giverEmail);
    formData.set("amount", String(gift.amount));
    formData.set("message", message);
    formData.set("pix_key", pixKey);
    formData.set("pix_holder_name", pixHolderName);
    await registerContribution(formData);
    setStep("done");
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={step === "done" ? "Obrigada! 💚" : gift.title} size="md">

      {step === "pix" && (
        <div className="flex flex-col items-center gap-5">
          <p className="text-smoke text-sm font-body text-center">
            Escaneie o QR Code ou copie o código Pix abaixo para presentear o casal.
          </p>

          {qrDataUrl && (
            <div className="p-4 bg-ivory rounded-lg border border-champagne">
              <img src={qrDataUrl} alt="QR Code Pix" className="w-48 h-48" />
            </div>
          )}

          <div className="w-full">
            <p className="text-xs text-smoke font-body mb-2 text-center">Pix Copia e Cola</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={pixCode}
                className="flex-1 text-xs px-3 py-2 rounded-md border border-noir/15 bg-ivory text-noir/60 font-body truncate"
              />
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="w-full border-t border-champagne pt-4">
            <p className="text-xs text-smoke font-body text-center mb-3">
              Valor:{" "}
              <span className="font-semibold text-moss">
                {Number(gift.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </p>
            <Button className="w-full" onClick={() => setStep("confirm")}>
              Já enviei o Pix ✓
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <form onSubmit={handleConfirm} className="space-y-4">
          <p className="text-smoke text-sm font-body">Deixe seu nome para o casal saber quem presenteou!</p>
          <Input
            label="Seu nome"
            value={giverName}
            onChange={e => setGiverName(e.target.value)}
            required
            placeholder="Seu nome completo"
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            value={giverEmail}
            onChange={e => setGiverEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <Textarea
            label="Mensagem para o casal (opcional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Felicidades! 💚"
            rows={3}
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep("pix")} className="flex-1">Voltar</Button>
            <Button type="submit" loading={loading} className="flex-1">Confirmar presente</Button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="text-center py-4 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center text-3xl">💚</div>
          <div>
            <p className="font-display text-2xl text-noir">Presente registrado!</p>
            <p className="text-smoke text-sm font-body mt-2">
              O casal foi notificado e irá confirmar o recebimento em breve.
            </p>
          </div>
          <Button onClick={onClose} className="mt-2">Fechar</Button>
        </div>
      )}
    </Modal>
  );
}
