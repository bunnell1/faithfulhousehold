import { Link, useRouterState } from "@tanstack/react-router";
import { House } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "Plan" },
  { to: "/about", label: "About" },
] as const;

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 pt-8 pb-24 sm:px-6">
      <div className="no-print mb-8 h-1 w-16 bg-olive" aria-hidden="true" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-olive text-paper">
            <House className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-xl leading-tight text-ink">Faithful Household</p>
            <p className="text-sm text-muted">A stewardship planning aid</p>
          </div>
        </div>
        <nav className="no-print flex gap-4 text-sm" aria-label="Site">
          {links.map((link) => {
            const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={
                  active ? "font-medium text-ink" : "text-muted underline-offset-4 hover:text-ink hover:underline"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
