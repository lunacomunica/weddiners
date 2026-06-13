interface GiftsWidgetProps {
  total: number;
  count: number;
}

export function GiftsWidget({ total, count }: GiftsWidgetProps) {
  const formatted = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="bg-white rounded-md p-6 border border-noir/7 shadow-sm flex flex-col gap-2">
      <p className="text-smoke text-xs font-body uppercase tracking-widest">Presentes recebidos</p>
      <p className="font-display text-4xl text-noir leading-none">{count}</p>
      <p className="text-gold text-sm font-body font-medium">{formatted} arrecadados</p>
    </div>
  );
}
