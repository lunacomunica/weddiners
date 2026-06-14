"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/site",
    label: "Meu Site",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/presentes",
    label: "Presentes",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <polyline points="20 12 20 22 4 22 4 12" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="7" width="20" height="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/convidados",
    label: "Convidados",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/mesas",
    label: "Mesas",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/pagamentos",
    label: "Pagamentos",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 10h22" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/fornecedores",
    label: "Fornecedores",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/planejamento",
    label: "Planejamento",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/referencias",
    label: "Referências",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="13" y="3" width="8" height="5" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="13" y="10" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="13" width="8" height="5" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/recados",
    label: "Recados",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/planos",
    label: "Planos",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Sidebar({ avatarUrl, displayName }: { avatarUrl?: string | null; displayName?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (displayName ?? "").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "W";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 sidebar-texture flex items-center justify-between px-4 border-b border-white/10">
        <img src="/logo.png" alt="Weddiners" className="h-14 w-auto" />
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="text-white/70 hover:text-white p-1.5 rounded-md"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </header>

      {/* ── Mobile overlay menu ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-14 left-0 bottom-0 w-72 sidebar-texture flex flex-col overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <nav className="flex-1 py-4 px-2">
              <ul className="space-y-0.5">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={[
                          "flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-150 font-body text-sm",
                          active
                            ? "bg-gold/15 text-gold font-medium"
                            : "text-white/60 hover:text-white hover:bg-white/5",
                        ].join(" ")}
                      >
                        <span className={["shrink-0", active ? "text-gold" : "text-white/40"].join(" ")}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <p className="text-white/25 text-xs font-body text-center py-4">© 2025 Weddiners</p>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside
        className={[
          "hidden md:flex fixed top-0 left-0 h-full sidebar-texture flex-col z-40 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64",
        ].join(" ")}
      >
        {/* Logo */}
        <div className={["border-b border-white/10 flex items-center", collapsed ? "px-4 py-6 justify-center" : "px-6 py-8"].join(" ")}>
          {collapsed ? (
            <span className="font-display text-gold text-xl">W</span>
          ) : (
            <div>
              <img src="/logo.png" alt="Weddiners" className="h-14 w-auto mb-1" />
              <p className="text-white/40 text-xs font-body mt-0.5">Painel da noiva</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-150 font-body text-sm",
                      collapsed ? "justify-center" : "",
                      active
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span className={["shrink-0", active ? "text-gold" : "text-white/40"].join(" ")}>
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Avatar + Toggle + Footer */}
        <div className="border-t border-white/10">
          {/* Avatar */}
          <Link href="/configuracoes" className={["flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors", collapsed ? "justify-center" : ""].join(" ")}>
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-sage/40 flex items-center justify-center">
                  <span className="text-white text-xs font-display font-semibold">{initials}</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white/80 text-xs font-body font-medium truncate">{displayName}</p>
                <p className="text-white/35 text-xs font-body">Configurações</p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(c => !c)}
            className={["w-full flex items-center gap-3 px-3 py-3 text-white/40 hover:text-white/70 transition-colors font-body text-xs border-t border-white/5", collapsed ? "justify-center" : ""].join(" ")}
          >
            <svg
              width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
              className={["transition-transform duration-300", collapsed ? "rotate-180" : ""].join(" ")}
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>Recolher menu</span>}
          </button>
          {!collapsed && (
            <p className="text-white/25 text-xs font-body text-center pb-4">© 2025 Weddiners</p>
          )}
        </div>
      </aside>

      {/* Desktop spacer */}
      <div className={["hidden md:block shrink-0 transition-all duration-300", collapsed ? "w-[68px]" : "w-64"].join(" ")} />
    </>
  );
}
