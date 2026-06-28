import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { views } from "../config/navigation";
import { usePageTitle } from "../hooks/usePageTitle";
import { DataNotice } from "./DataNotice";

export function AppShell({ children }: { children: ReactNode }) {
  usePageTitle();

  return (
    <main className="min-h-screen px-5 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Header />
        {children}
        <DataNotice />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-300">
            CS2 Analytics Lab
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">
            ClutchLab
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            Explore elite CS2 players, team identities, map tendencies and roster
            construction logic in one focused workspace.
          </p>
        </div>

        <nav className="flex max-w-5xl flex-wrap gap-2">
          {views.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                [
                  "rounded-full border px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/60 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
