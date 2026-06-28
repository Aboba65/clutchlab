import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { views } from "../config/navigation";
import { DataNotice } from "./DataNotice";

export function AppShell({ children }: { children: ReactNode }) {
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
    <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
          CS2 Analytics
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">ClutchLab</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Игроки, команды, роли, сравнение и сборка состава. MVP теперь работает через
          нормальные URL.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {views.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-300 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
