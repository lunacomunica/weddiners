"use client";

import { signOut } from "@/app/(auth)/login/actions";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-ivory border-b border-noir/7">
      <div>
        <h2 className="font-display text-2xl text-noir leading-none">{title}</h2>
        {subtitle && (
          <p className="text-smoke text-sm font-body mt-0.5">{subtitle}</p>
        )}
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="text-smoke text-sm font-body hover:text-noir transition-colors"
        >
          Sair
        </button>
      </form>
    </header>
  );
}
