"use client";

import { useEffect, useState } from "react";

function getTimeLeft(weddingDate: string) {
  if (!weddingDate) return null;

  // "2026-11-20" → parseia como meia-noite no horário LOCAL (não UTC)
  // new Date("2026-11-20") seria UTC, causando bug em fusos negativos
  const [year, month, day] = weddingDate.split("-").map(Number);
  const target = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();

  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function CountdownClient({ weddingDate, primaryColor }: { weddingDate: string; primaryColor: string }) {
  // Lazy init: calcula na primeira renderização, sem flash de "Hoje é o grande dia!"
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft>>(
    () => getTimeLeft(weddingDate)
  );

  useEffect(() => {
    setTime(getTimeLeft(weddingDate));
    const id = setInterval(() => setTime(getTimeLeft(weddingDate)), 1000);
    return () => clearInterval(id);
  }, [weddingDate]);

  if (!time) {
    return <p className="text-2xl opacity-60" style={{ fontFamily: "var(--font-display)" }}>Hoje é o grande dia! 🥂</p>;
  }

  const units = [
    { label: "dias", value: time.days },
    { label: "horas", value: time.hours },
    { label: "min", value: time.minutes },
    { label: "seg", value: time.seconds },
  ];

  return (
    <div className="flex justify-center gap-6 flex-wrap">
      {units.map(u => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="tabular-nums leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 4rem)", color: primaryColor }}>
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-xs tracking-widest uppercase mt-1 opacity-40">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
