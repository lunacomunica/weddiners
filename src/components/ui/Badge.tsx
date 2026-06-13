type BadgeVariant = "pending" | "confirmed" | "declined" | "gold" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  pending:   "bg-champagne/50 text-noir/70 border border-champagne",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  declined:  "bg-rose/10 text-rose border border-rose/20",
  gold:      "bg-gold/15 text-gold border border-gold/30",
  default:   "bg-smoke/10 text-smoke border border-smoke/20",
};

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
