interface GuestsWidgetProps {
  stats: {
    confirmed: number;
    pending: number;
    declined: number;
    total: number;
  };
}

export function GuestsWidget({ stats }: GuestsWidgetProps) {
  return (
    <div className="bg-white rounded-md p-6 border border-noir/7 shadow-sm flex flex-col gap-2">
      <p className="text-smoke text-xs font-body uppercase tracking-widest">Convidados</p>
      <p className="font-display text-4xl text-noir leading-none">{stats.total}</p>
      <div className="flex gap-3 mt-1">
        <span className="text-xs font-body text-emerald-600">✓ {stats.confirmed}</span>
        <span className="text-xs font-body text-smoke">⏳ {stats.pending}</span>
        <span className="text-xs font-body text-rose">✕ {stats.declined}</span>
      </div>
    </div>
  );
}
