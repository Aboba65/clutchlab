import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { PlayersPage } from "./pages/PlayersPage";
import { TeamsPage } from "./pages/TeamsPage";
import { MapsPage } from "./pages/MapsPage";
import { TraitsPage } from "./pages/TraitsPage";
import { SavedRostersPage } from "./pages/SavedRostersPage";
import { TeamComparePage } from "./pages/TeamComparePage";
import { ComparePage } from "./pages/ComparePage";
import { RosterBuilderPage } from "./pages/RosterBuilderPage";
import { RolesPage } from "./pages/RolesPage";
import { RoleDetailPage } from "./pages/RoleDetailPage";
import { MapDetailPage } from "./pages/MapDetailPage";
import { PlayerDetailPage } from "./pages/PlayerDetailPage";
import { TeamDetailPage } from "./pages/TeamDetailPage";

const views: { path: string; label: string; end?: boolean }[] = [
  { path: "/", label: "Overview", end: true },
  { path: "/players", label: "Players" },
  { path: "/teams", label: "Teams" },
  { path: "/maps", label: "Maps" },
  { path: "/compare", label: "Compare" },
  { path: "/team-compare", label: "Team Compare" },
  { path: "/roster-builder", label: "Roster Builder" },
  { path: "/saved-rosters", label: "Saved Rosters" },
  { path: "/roles", label: "Roles" },
  { path: "/traits", label: "Traits" },
];

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen px-5 py-6 text-slate-100 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Header />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:playerId" element={<PlayerDetailPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamDetailPage />} />
            <Route path="/maps" element={<MapsPage />} />
            <Route path="/maps/:mapId" element={<MapDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/team-compare" element={<TeamComparePage />} />
            <Route path="/roster-builder" element={<RosterBuilderPage />} />
            <Route path="/saved-rosters" element={<SavedRostersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/:roleId" element={<RoleDetailPage />} />
            <Route path="/builder" element={<Navigate to="/roster-builder" replace />} />
            <Route path="/traits" element={<TraitsPage />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

function Header() {
  return (
    <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
          CS2 Analytics
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
          ClutchLab
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Игроки, команды, роли, сравнение и сборка состава. MVP теперь работает
          через нормальные URL.
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

function NotFoundView({
  title = "Page not found",
  description = "Такой страницы нет. Вернись на главную или выбери раздел в навигации.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
        404
      </p>
      <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-slate-400">{description}</p>
      <NavLink
        to="/"
        className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200"
      >
        Back to overview
      </NavLink>
    </section>
  );
}

export default App;
