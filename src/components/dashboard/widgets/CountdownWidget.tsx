interface CountdownWidgetProps {
  weddingDate: string | null;
}

export function CountdownWidget({ weddingDate }: CountdownWidgetProps) {
  let days: number | null = null;

  if (weddingDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate + "T00:00:00");
    days = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="bg-white rounded-md p-6 border border-noir/7 shadow-sm flex flex-col gap-2">
      <p className="text-smoke text-xs font-body uppercase tracking-widest">Dias para o grande dia</p>
      {days !== null ? (
        <>
          <p className="font-display text-6xl text-moss leading-none">{days}</p>
          <p className="text-smoke text-xs font-body">dias restantes 💍</p>
        </>
      ) : (
        <p className="text-smoke text-sm font-body mt-2">Configure a data do casamento</p>
      )}
    </div>
  );
}
