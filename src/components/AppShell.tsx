import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { views } from "../config/navigation";
import { usePageTitle } from "../hooks/usePageTitle";
import { DataNotice } from "./DataNotice";
import { Footer } from "./Footer";

export function AppShell({ children }: { children: ReactNode }) {
  usePageTitle();

  return (
    <main className="min-h-screen px-4 py-4 text-slate-100 sm:px-5 md:px-8 md:py-6">
      <div className="mx-auto max-w-7xl">
        <Header />
        {children}
        <DataNotice />
        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="mb-5 rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur md:mb-8 md:rounded-[2rem] md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-cyan-300 md:text-xs md:tracking-[0.45em]">
            CS2 Analytics Lab
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:mt-3 md:text-6xl">
            ClutchLab
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:mt-3 md:text-base">
            Explore elite CS2 players, team identities, map tendencies and roster
            construction logic in one focused workspace.
          </p>
        </div>

        <Navigation />
      </div>
    </header>
  );
}

function Navigation() {
  return (
    <nav
      aria-label="Primary navigation"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 xl:max-w-5xl"
    >
      {views.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            [
              "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition md:text-sm",
              "focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:ring-offset-2 focus:ring-offset-slate-950",
              isActive
                ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/40"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/60 hover:bg-white/10 hover:text-white",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
