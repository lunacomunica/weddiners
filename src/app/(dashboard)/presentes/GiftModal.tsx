"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createGift, updateGift } from "./actions";

interface Gift {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string | null;
  image_url: string | null;
  is_group_gift: boolean;
  target_amount: number | null;
  is_received: boolean;
}

interface GiftModalProps {
  open: boolean;
  onClose: () => void;
  gift?: Gift;
}

const categories = [
  { value: "viagem", label: "Viagem" },
  { value: "casa", label: "Casa" },
  { value: "experiencia", label: "Experiência" },
  { value: "livre", label: "Livre" },
];

export function GiftModal({ open, onClose, gift }: GiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [isGroup, setIsGroup] = useState(gift?.is_group_gift ?? false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("is_group_gift", String(isGroup));

    const result = gift
      ? await updateGift(gift.id, formData)
      : await createGift(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={gift ? "Editar presente" : "Novo presente"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome do presente" name="title" defaultValue={gift?.title} required placeholder="Ex: Lua de mel em Paris" />

        <Textarea label="Descrição" name="description" defaultValue={gift?.description ?? ""} placeholder="Conte um pouco sobre esse presente..." />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor (R$)"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={gift?.amount}
            required
            placeholder="0,00"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-noir/80 font-body">Categoria</label>
            <select
              name="category"
              defaultValue={gift?.category ?? ""}
              className="w-full px-4 py-3 rounded-md border border-noir/15 bg-white text-noir font-body text-base focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
            >
              <option value="">Selecionar...</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Input label="URL da imagem" name="image_url" defaultValue={gift?.image_url ?? ""} placeholder="https://..." />

        {/* Presente coletivo */}
        <div className="flex items-center gap-3 p-4 bg-ivory rounded-md border border-noir/7">
          <input
            type="checkbox"
            id="is_group_gift"
            checked={isGroup}
            onChange={e => setIsGroup(e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          <label htmlFor="is_group_gift" className="text-sm font-body text-noir">
            Presente coletivo (várias pessoas contribuem)
          </label>
        </div>

        {isGroup && (
          <Input
            label="Valor alvo (R$)"
            name="target_amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={gift?.target_amount ?? ""}
            placeholder="Valor total desejado"
          />
        )}

        {error && <p className="text-rose text-sm font-body">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {gift ? "Salvar" : "Adicionar presente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
