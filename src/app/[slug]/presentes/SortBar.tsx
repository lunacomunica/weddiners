"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "order", label: "Ordem padrão" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export function SortBar({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("sort") ?? "order";

  function setSort(value: string) {
    const url = value === "order"
      ? `/${slug}/presentes`
      : `/${slug}/presentes?sort=${value}`;
    router.push(url, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-body text-xs text-smoke mr-1">Ordenar:</span>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setSort(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all border ${
            current === opt.value
              ? "bg-moss text-white border-moss"
              : "bg-white text-smoke border-noir/10 hover:border-moss/40 hover:text-noir"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
