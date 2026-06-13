"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GiftsList } from "./GiftsList";
import { GiftModal } from "./GiftModal";

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

export function GiftsListWrapper({ gifts }: { gifts: Gift[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-smoke text-sm font-body">{gifts.length} presente{gifts.length !== 1 ? "s" : ""} na lista</p>
        </div>
        <Button variant="texture" onClick={() => setModalOpen(true)}>+ Adicionar presente</Button>
      </div>

      <GiftsList gifts={gifts} />

      <GiftModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
