"use client";

import { useState } from "react";
import { GiftPixModal } from "./GiftPixModal";
import { fmtBRL } from "@/lib/format";

interface Gift {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string | null;
  image_url: string | null;
  image_position: number | null;
  is_group_gift: boolean;
  target_amount: number | null;
  received_amount: number;
  is_received: boolean;
}

interface GiftCardProps {
  gift: Gift;
  coupleId: string;
  pixKey: string;
  pixKeyType: string;
  pixHolderName: string;
  pixCity: string;
  coupleName: string;
}

const categoryLabels: Record<string, string> = {
  viagem: "Viagem",
  casa: "Casa",
  experiencia: "Experiência",
  livre: "Livre",
};

export function GiftCard({ gift, coupleId, pixKey, pixKeyType, pixHolderName, pixCity, coupleName }: GiftCardProps) {
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
          <img src={gift.image_url} alt={gift.title} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300" style={{ objectPosition: `center ${gift.image_position ?? 50}%` }} />
        ) : (
          <div className="w-full h-60 bg-champagne flex items-center justify-center text-4xl">🎁</div>
        )}
        <div className="p-5">
          {gift.category && (
            <span className="inline-block text-xs font-body text-moss bg-sage/10 px-2.5 py-0.5 rounded-full mb-1">
              {categoryLabels[gift.category] ?? gift.category}
            </span>
          )}
          <h3 className="font-display text-xl text-noir mt-1 leading-snug">{gift.title}</h3>
          {gift.description && (
            <p className="text-smoke text-sm font-body mt-1 line-clamp-2">{gift.description}</p>
          )}
          <p className="font-body font-semibold text-moss text-lg mt-3">
            {fmtBRL(Number(gift.amount))}
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
                {fmtBRL(Number(gift.received_amount))} de {fmtBRL(Number(gift.target_amount))}
              </p>
            </div>
          )}
          <div className="mt-4 w-full py-2.5 bg-moss text-white text-sm font-body font-medium rounded-full text-center">
            Presentear via Pix ✦
          </div>
        </div>
      </button>

      <GiftPixModal
        open={open}
        onClose={() => setOpen(false)}
        gift={gift}
        coupleId={coupleId}
        pixKey={pixKey}
        pixKeyType={pixKeyType}
        pixHolderName={pixHolderName}
        pixCity={pixCity}
        coupleName={coupleName}
      />
    </>
  );
}
