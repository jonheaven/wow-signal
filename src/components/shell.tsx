import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth-slot";

const NAV = [
  { to: "/", label: "Beacon" },
  { to: "/wall", label: "Wall" },
  { to: "/transmit", label: "Transmit" },
  { to: "/mission", label: "Mission" },
  { to: "/stack", label: "Stack" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBeacon = pathname === "/";

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header
        className={
          isBeacon
            ? "pointer-events-none absolute inset-x-0 top-0 z-20"
            : "border-b border-border bg-bg"
        }
      >
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-8 place-items-center border border-gold text-gold">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="12" r="2.2" />
                <path d="M10.2 12 H19" />
                <path d="M16.2 8.5 L19.6 12 L16.2 15.5" />
              </svg>
            </span>
            <span className="font-display text-lg tracking-tight">
              WOW SIGNAL
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? "px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-gold"
                      : "px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-fg"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <AuthSlot />
        </div>
        <nav className="pointer-events-auto flex gap-1 overflow-x-auto border-t border-border/70 px-3 py-2 sm:hidden">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "whitespace-nowrap px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-gold"
                    : "whitespace-nowrap px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className={isBeacon ? "" : "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"}>
        {children}
      </main>
    </div>
  );
}
