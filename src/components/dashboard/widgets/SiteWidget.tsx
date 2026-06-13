import Link from "next/link";

interface SiteWidgetProps {
  slug: string;
}

export function SiteWidget({ slug }: SiteWidgetProps) {
  // url reserved for future use (e.g. QR code, copy button)
  // const url = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;

  return (
    <div className="bg-moss rounded-md p-6 shadow-sm flex flex-col gap-2">
      <p className="text-white/60 text-xs font-body uppercase tracking-widest">Meu site público</p>
      <p className="font-display text-xl text-white leading-snug break-all">weddiners.com/{slug}</p>
      <Link
        href={`/${slug}`}
        target="_blank"
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-body text-white/80 hover:text-white transition-colors"
      >
        Ver meu site →
      </Link>
    </div>
  );
}
