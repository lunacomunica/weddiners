"use client";

import { useState, useEffect } from "react";
import { QrCodePix } from "qrcode-pix";
import { Modal } from "@/components/ui/Modal";
import { fmtBRL } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
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
  pixKeyType: string;
  pixHolderName: string;
  pixCity: string;
  coupleName: string;
}

type Step = "pix" | "confirm" | "done";

export function GiftPixModal({ open, onClose, gift, coupleId, pixKey, pixKeyType: _pixKeyType, pixHolderName, pixCity, coupleName: _coupleName }: GiftPixModalProps) {
  const [step, setStep] = useState<Step>("pix");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [message, setMessage] = useState("");

  const suggestedAmount = Number(gift.amount) > 0 ? Number(gift.amount) : null;

  useEffect(() => {
    if (!open) { setStep("pix"); setCopied(false); setQrDataUrl(""); return; }

    setQrDataUrl("");
    setPixPayload("");

    const cleanKey = pixKey.trim().replace(/[.\-\s]/g, "");
    const nameClean = (pixHolderName || "Casal").normalize("NFD").replace(/[̀-ͯ]/g, "").slice(0, 25);
    const cityClean = (pixCity || "Brasil").normalize("NFD").replace(/[̀-ͯ]/g, "").slice(0, 15);

    const qr = QrCodePix({ version: "01", key: cleanKey, name: nameClean, city: cityClean });
    setPixPayload(qr.payload());
    qr.base64().then(setQrDataUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pixKey, pixHolderName, pixCity]);

  async function handleCopyKey() {
    await navigator.clipboard.writeText(pixPayload || pixKey);
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
    formData.set("amount", String(suggestedAmount ?? 0));
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

          {suggestedAmount && (
            <div className="w-full bg-sage/10 border border-sage/20 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-body text-moss">
                Valor sugerido: <strong>{fmtBRL(suggestedAmount)}</strong> — você digita no seu banco 💚
              </p>
            </div>
          )}

          <p className="text-smoke text-sm font-body text-center">
            Escaneie o QR Code ou copie a chave Pix abaixo.
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
                value={pixPayload}
                className="flex-1 text-xs px-3 py-2 rounded-md border border-noir/15 bg-ivory text-noir/60 font-body truncate"
              />
              <Button variant="secondary" size="sm" onClick={handleCopyKey}>
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
            <p className="text-xs text-smoke/60 font-body mt-1.5 text-center">
              Titular: <span className="font-medium">{pixHolderName}</span>
            </p>
          </div>

          <div className="w-full border-t border-champagne pt-4">
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
