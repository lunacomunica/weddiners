const ACTION_ICONS: Record<string, string> = {
  task_added: "✅",
  task_done: "☑️",
  task_undone: "↩️",
  task_updated: "✏️",
  task_deleted: "🗑️",
  guest_added: "👤",
  guest_deleted: "👤",
  guests_imported: "📋",
  reference_added: "🖼️",
  reference_deleted: "🗑️",
};

interface Activity {
  id: string;
  actor_name: string;
  action: string;
  description: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="font-body font-semibold text-sm text-neutral-500 uppercase tracking-wide mb-4">
        Atividades recentes
      </h3>
      <ul className="space-y-3">
        {activities.map(a => {
          const isCerim = a.actor_name.includes("(cerimonialista)");
          const cleanName = a.actor_name.replace(" (cerimonialista)", "");
          const icon = ACTION_ICONS[a.action] ?? "📝";

          return (
            <li key={a.id} className="flex items-start gap-3">
              <span className="text-base shrink-0 mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-noir font-body leading-snug">
                  <span className="font-medium">{cleanName}</span>
                  {isCerim && (
                    <span className="ml-1.5 text-xs font-medium text-sage bg-sage/10 px-1.5 py-0.5 rounded-full">cerimonialista</span>
                  )}
                  {" · "}{a.description}
                </p>
                <p className="text-xs text-smoke/60 font-body mt-0.5">{timeAgo(a.created_at)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
