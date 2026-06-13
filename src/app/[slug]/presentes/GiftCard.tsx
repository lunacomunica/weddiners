"use client";

import { useState } from "react";
import { GiftPixModal } from "./GiftPixModal";

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

interface GiftCardProps {
  gift: Gift;
  coupleId: string;
  pixKey: string;
  pixHolderName: string;
  pixCity: string;
}

const categoryLabels: Record<string, string> = {
  viagem: "🌍 Viagem",
  casa: "🏠 Casa",
  experiencia: "✨ Experiência",
  livre: "🎁 Livre",
};

export function GiftCard({ gift, coupleId, pixKey, pixHolderName, pixCity }: GiftCardProps) {
  const [open, setOpen] = useState(false);

  if (gift.is_received) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white rounded-md border text-left w-full hover:shadow-md transition-shadow duration-200 overflow-hidden group"
        style={{ borderColor: "rgba(28,32,24,0.08)" }}
      >
        {gift.image_url ? (
          <img src={gift.image_url} alt={gift.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-44 bg-champagne flex items-center justify-center text-4xl">🎁</div>
        )}
        <div className="p-5">
          {gift.category && (
            <span className="text-xs text-smoke font-body">{categoryLabels[gift.category] ?? gift.category}</span>
          )}
          <h3 className="font-display text-xl text-noir mt-1 leading-snug">{gift.title}</h3>
          {gift.description && (
            <p className="text-smoke text-sm font-body mt-1 line-clamp-2">{gift.description}</p>
          )}
          <p className="font-body font-semibold text-moss text-lg mt-3">
            {Number(gift.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          {gift.is_group_gift && gift.target_amount && (
            <div className="mt-2">
              <div className="w-full bg-champagne rounded-full h-1.5">
                <div
                  className="bg-gold h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (gift.received_amount / gift.target_amount) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-smoke font-body mt-1">
                {Number(gift.received_amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de {Number(gift.target_amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          )}
          <div className="mt-4 w-full py-2.5 bg-moss text-white text-sm font-body font-medium rounded-full text-center">
            Presentear ✦
          </div>
        </div>
      </button>

      <GiftPixModal
        open={open}
        onClose={() => setOpen(false)}
        gift={gift}
        coupleId={coupleId}
        pixKey={pixKey}
        pixHolderName={pixHolderName}
        pixCity={pixCity}
      />
    </>
  );
}
