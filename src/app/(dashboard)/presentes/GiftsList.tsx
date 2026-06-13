"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fmtBRL } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { GiftModal } from "./GiftModal";
import { deleteGift, toggleGiftReceived } from "./actions";

interface Gift {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string | null;
  image_url: string | null;
  is_group_gift: boolean;
  target_amount: number | null;
  received_amount: number;
  is_received: boolean;
}

const categoryLabels: Record<string, string> = {
  viagem: "Viagem",
  casa: "Casa",
  experiencia: "Experiência",
  livre: "Livre",
};

export function GiftsList({ gifts }: { gifts: Gift[] }) {
  const [editGift, setEditGift] = useState<Gift | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    await deleteGift(deleteId);
    setDeleteId(null);
  }

  async function handleToggle(id: string, current: boolean) {
    setLoadingId(id);
    await toggleGiftReceived(id, !current);
    setLoadingId(null);
  }

  if (gifts.length === 0) {
    return (
      <div className="text-center py-16 text-smoke font-body">
        <div className="w-12 h-12 rounded-full bg-champagne flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-smoke"><polyline points="20 12 20 22 4 22 4 12" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="7" width="20" height="5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p className="font-display text-2xl text-noir mb-1">Nenhum presente ainda</p>
        <p className="text-sm">Adicione o primeiro presente da sua lista!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map(gift => (
          <div key={gift.id} className="bg-white rounded-md border p-5 flex flex-col gap-3" style={{ borderColor: "rgba(13,10,11,0.07)" }}>
            {gift.image_url && (
              <img src={gift.image_url} alt={gift.title} className="w-full h-36 object-cover rounded-md" />
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg text-noir leading-snug">{gift.title}</h3>
              {gift.is_received && <Badge variant="confirmed">Recebido</Badge>}
            </div>
            {gift.category && (
              <span className="text-xs text-smoke font-body">{categoryLabels[gift.category] ?? gift.category}</span>
            )}
            <p className="font-body text-xl font-semibold text-moss">
              {fmtBRL(Number(gift.amount))}
            </p>
            {gift.is_group_gift && gift.target_amount && (
              <div>
                <div className="flex justify-between text-xs text-smoke font-body mb-1">
                  <span>Arrecadado</span>
                  <span>{fmtBRL(Number(gift.received_amount))} / {fmtBRL(Number(gift.target_amount))}</span>
                </div>
                <div className="w-full bg-champagne rounded-full h-1.5">
                  <div
                    className="bg-gold h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (gift.received_amount / gift.target_amount) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-auto pt-2 border-t border-noir/5">
              <Button
                variant="ghost"
                size="sm"
                loading={loadingId === gift.id}
                onClick={() => handleToggle(gift.id, gift.is_received)}
                className="flex-1 text-xs"
              >
                {gift.is_received ? "Marcar pendente" : "Marcar recebido"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditGift(gift)} className="px-3" title="Editar">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(gift.id)} className="px-3" title="Remover">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editGift && (
        <GiftModal open={!!editGift} onClose={() => setEditGift(null)} gift={editGift} />
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remover presente" size="sm">
        <p className="text-smoke font-body text-sm mb-6">Tem certeza que deseja remover este presente? Essa ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">Remover</Button>
        </div>
      </Modal>
    </>
  );
}
