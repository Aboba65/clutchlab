import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { players, teams } from "./data";
import { getPlayerImpact } from "./lib";
import { Panel } from "./components/Panel";
import { StatCard } from "./components/StatCard";
import { Score } from "./components/Score";
import { Metric } from "./components/Metric";
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
            <Route path="/teams/:teamId" element={<TeamRoute />} />
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

function TeamRoute() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const team = teams.find((item) => item.id === teamId);

  if (!team) {
    return (
      <NotFoundView
        title="Team not found"
        description="Такой команды нет в текущей базе ClutchLab."
      />
    );
  }

  return <TeamDetailView team={team} onBack={() => navigate("/teams")} />;
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

function TeamDetailView({
  team,
  onBack,
}: {
  team: (typeof teams)[number];
  onBack: () => void;
}) {
  const teamPlayers = players.filter((player) => team.players.includes(player.id));

  const teamScore = Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );

  const strongestArea = getTeamStrongestArea(team);
  const weakestArea = getTeamWeakestArea(team);

  return (
    <section className="grid gap-6">
      <button
        onClick={onBack}
        className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ← Back to teams
      </button>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/15 via-white/[0.04] to-cyan-400/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Team Profile
            </p>

            <h2 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              {team.name}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                {team.region}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {teamPlayers.length} demo players
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                Best area: {strongestArea}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">
              {getTeamSummary(team, teamPlayers.length)}
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
              Team Score
            </p>
            <div className="mt-2 text-6xl font-black text-cyan-200">
              {teamScore}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Custom ClutchLab score
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="Firepower"
          value={team.scores.firepower.toString()}
          subtitle="duel pressure"
        />
        <StatCard
          title="Structure"
          value={team.scores.structure.toString()}
          subtitle="system quality"
        />
        <StatCard
          title="Map Pool"
          value={team.scores.mapPool.toString()}
          subtitle="map depth"
        />
        <StatCard
          title="Clutch"
          value={team.scores.clutch.toString()}
          subtitle="late rounds"
        />
        <StatCard
          title="Form"
          value={team.scores.form.toString()}
          subtitle="current level"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Team profile">
          <div className="grid gap-4">
            <Metric label="Firepower" value={team.scores.firepower} />
            <Metric label="Structure" value={team.scores.structure} />
            <Metric label="Map Pool" value={team.scores.mapPool} />
            <Metric label="Clutch" value={team.scores.clutch} />
            <Metric label="Form" value={team.scores.form} />
          </div>

          <div className="mt-5 rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Read
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Сильнейшая зона команды: {strongestArea}. Самая уязвимая зона:{" "}
              {weakestArea}. Это пока демо-оценка, но позже такую логику можно
              связать с реальными матчами, картами и формой.
            </p>
          </div>
        </Panel>

        <Panel title="Roster">
          <div className="grid gap-3">
            {teamPlayers.length > 0 ? (
              teamPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
                >
                  <div>
                    <div className="font-black">{player.nickname}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {player.country} · {player.role}
                    </div>
                  </div>

                  <Score value={getPlayerImpact(player)} />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                Для этой команды пока нет игроков в демо-базе.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Best maps">
        <div className="flex flex-wrap gap-2">
          {team.bestMaps.map((map) => (
            <span
              key={map}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200"
            >
              {map}
            </span>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function getTeamStrongestArea(team: (typeof teams)[number]) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}

function getTeamWeakestArea(team: (typeof teams)[number]) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => a[1] - b[1])[0][0];
}

function getTeamSummary(team: (typeof teams)[number], playerCount: number) {
  const strongestArea = getTeamStrongestArea(team);
  const weakestArea = getTeamWeakestArea(team);

  return `${team.name} — ${team.region}-команда с профилем ${strongestArea}. В текущей демо-базе у неё ${playerCount} игрока. Главная слабая зона по MVP-оценке: ${weakestArea}.`;
}

export default App;
