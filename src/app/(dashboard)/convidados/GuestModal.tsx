"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createGuest, updateGuest } from "./actions";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  group_name: string | null;
  table_number: number | null;
  adults: number;
  children: number;
  guest_type: "adulto" | "crianca" | null;
  child_age: number | null;
  dietary_restrictions: string | null;
  notes: string | null;
  rsvp_status: string;
}

interface GuestModalProps {
  open: boolean;
  onClose: () => void;
  guest?: Guest;
}

export function GuestModal({ open, onClose, guest }: GuestModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guestType, setGuestType] = useState<"adulto" | "crianca">(guest?.guest_type === "crianca" ? "crianca" : "adulto");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = guest
      ? await updateGuest(guest.id, formData)
      : await createGuest(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
    else { onClose(); setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={guest ? "Editar convidado" : "Novo convidado"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome completo" name="name" defaultValue={guest?.name} required placeholder="Maria Silva" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="E-mail" name="email" type="email" defaultValue={guest?.email ?? ""} placeholder="maria@email.com" />
          <Input label="Telefone" name="phone" defaultValue={guest?.phone ?? ""} placeholder="(11) 99999-9999" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Grupo" name="group_name" defaultValue={guest?.group_name ?? ""} placeholder="Ex: Família da noiva" />
          <Input label="Mesa nº" name="table_number" type="number" min="1" defaultValue={guest?.table_number ?? ""} placeholder="1" />
        </div>

        {/* Tipo de convidado */}
        <div>
          <label className="block text-sm font-body font-medium text-noir mb-2">Tipo de convidado</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGuestType("adulto")}
              className={["flex-1 py-2.5 rounded-xl border text-sm font-medium font-body transition-all", guestType === "adulto" ? "bg-sage/10 border-sage text-moss" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"].join(" ")}
            >
              🧑 Adulto
            </button>
            <button
              type="button"
              onClick={() => setGuestType("crianca")}
              className={["flex-1 py-2.5 rounded-xl border text-sm font-medium font-body transition-all", guestType === "crianca" ? "bg-sage/10 border-sage text-moss" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"].join(" ")}
            >
              👶 Criança
            </button>
          </div>
          <input type="hidden" name="guest_type" value={guestType} />
        </div>

        {guestType === "crianca" && (
          <Input
            label="Idade da criança"
            name="child_age"
            type="number"
            min="0"
            max="17"
            defaultValue={guest?.child_age ?? ""}
            placeholder="Ex: 5"
          />
        )}

        <Input label="Restrições alimentares" name="dietary_restrictions" defaultValue={guest?.dietary_restrictions ?? ""} placeholder="Vegetariano, sem glúten..." />
        <Textarea label="Observações" name="notes" defaultValue={guest?.notes ?? ""} placeholder="Observações internas..." rows={2} />

        {error && <p className="text-rose text-sm font-body">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">{guest ? "Salvar" : "Adicionar"}</Button>
        </div>
      </form>
    </Modal>
  );
}
