import { useMemo, useState } from "react";
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
import type { CS2Player, PlayerRole } from "./types";
import { getPlayerImpact, getRosterScore, getRosterWarnings, getTeamName } from "./lib";
import { roleConfigs, type RoleConfig } from "./config/roles";
import { maps, type CS2MapProfile } from "./config/maps";
import { Panel } from "./components/Panel";
import { StatCard } from "./components/StatCard";
import { RoleBadge } from "./components/RoleBadge";
import { Score } from "./components/Score";
import { Metric } from "./components/Metric";
import { Warning } from "./components/Warning";
import { PlayerProfile } from "./components/PlayerProfile";
import { TeamCard } from "./components/TeamCard";
import { HomePage } from "./pages/HomePage";
import { PlayersPage } from "./pages/PlayersPage";

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

type SavedRoster = {
  id: string;
  name: string;
  playerIds: string[];
  createdAt: string;
};

const SAVED_ROSTERS_KEY = "clutchlab.savedRosters";
const ACTIVE_ROSTER_KEY = "clutchlab.activeRoster";

function readSavedRosters(): SavedRoster[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_ROSTERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is SavedRoster => {
      return (
        typeof item?.id === "string" &&
        typeof item?.name === "string" &&
        typeof item?.createdAt === "string" &&
        Array.isArray(item?.playerIds)
      );
    });
  } catch {
    return [];
  }
}

function writeSavedRosters(rosters: SavedRoster[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_ROSTERS_KEY, JSON.stringify(rosters));
}

function readActiveRosterIds() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ACTIVE_ROSTER_KEY);
    if (!raw) return [];

    window.localStorage.removeItem(ACTIVE_ROSTER_KEY);
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id): id is string => {
      return typeof id === "string" && players.some((player) => player.id === id);
    });
  } catch {
    return [];
  }
}

function writeActiveRosterIds(playerIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ROSTER_KEY, JSON.stringify(playerIds));
}

function getRosterPlayers(playerIds: string[]) {
  return playerIds
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter((player): player is CS2Player => Boolean(player));
}

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen px-5 py-6 text-slate-100 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Header />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:playerId" element={<PlayerRoute />} />
            <Route path="/teams" element={<TeamsRoute />} />
            <Route path="/teams/:teamId" element={<TeamRoute />} />
            <Route path="/maps" element={<MapsRoute />} />
            <Route path="/maps/:mapId" element={<MapRoute />} />
            <Route path="/compare" element={<CompareView />} />
            <Route path="/team-compare" element={<TeamCompareView />} />
            <Route path="/roster-builder" element={<RosterBuilderView />} />
            <Route path="/saved-rosters" element={<SavedRostersView />} />
            <Route path="/roles" element={<RolesRoute />} />
            <Route path="/roles/:roleId" element={<RoleRoute />} />
            <Route path="/builder" element={<Navigate to="/roster-builder" replace />} />
            <Route path="/traits" element={<TraitsView />} />
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

function PlayerRoute() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const player = players.find((item) => item.id === playerId);

  if (!player) {
    return (
      <NotFoundView
        title="Player not found"
        description="Такого игрока нет в текущей базе ClutchLab."
      />
    );
  }

  return <PlayerDetailView player={player} onBack={() => navigate("/players")} />;
}

function TeamsRoute() {
  const navigate = useNavigate();

  return <TeamsView onTeamClick={(teamId) => navigate(`/teams/${teamId}`)} />;
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

function MapsRoute() {
  const navigate = useNavigate();

  return <MapsView onMapClick={(mapId) => navigate(`/maps/${mapId}`)} />;
}

function MapRoute() {
  const navigate = useNavigate();
  const { mapId } = useParams();
  const map = maps.find((item) => item.id === mapId);

  if (!map) {
    return (
      <NotFoundView
        title="Map not found"
        description="Такой карты нет в текущей базе ClutchLab."
      />
    );
  }

  return <MapDetailView map={map} onBack={() => navigate("/maps")} />;
}


function RolesRoute() {
  const navigate = useNavigate();
  return <RolesView onRoleClick={(roleId) => navigate(`/roles/${roleId}`)} />;
}

function RoleRoute() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const config = roleConfigs.find((item) => item.id === roleId);

  if (!config) {
    return (
      <NotFoundView
        title="Role not found"
        description="Такой роли нет в текущей модели ClutchLab."
      />
    );
  }

  return <RoleDetailView config={config} onBack={() => navigate("/roles")} />;
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

function TeamsView({
  onTeamClick,
}: {
  onTeamClick: (teamId: string) => void;
}) {
  return (
    <section className="grid gap-6">
      <PageTitle
        title="Teams"
        description="Команды пока демо. Позже здесь будут реальные составы, форма, map pool и role balance."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => {
          const teamPlayers = players.filter((player) => team.players.includes(player.id));

          return (
            <TeamCard
              key={team.id}
              team={team}
              teamPlayers={teamPlayers}
              onClick={() => onTeamClick(team.id)}
            />
          );
        })}
      </div>
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


type TeamCompareRow = {
  label: string;
  left: number;
  right: number;
  winner: "left" | "right" | "tie";
};

function TeamCompareView() {
  const [leftId, setLeftId] = useState(teams[0].id);
  const [rightId, setRightId] = useState(teams[1]?.id ?? teams[0].id);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const left = teams.find((team) => team.id === leftId) ?? teams[0];
  const right = teams.find((team) => team.id === rightId) ?? teams[1] ?? teams[0];
  const rows = getTeamCompareRows(left, right);
  const verdict = getTeamComparisonVerdict(left, right, rows);
  const leftPlayers = getTeamPlayers(left);
  const rightPlayers = getTeamPlayers(right);
  const sharedMaps = left.bestMaps.filter((map) => right.bestMaps.includes(map));

  function swapTeams() {
    setLeftId(right.id);
    setRightId(left.id);
    setLeftSearch("");
    setRightSearch("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Team Compare"
          description="Сравнение команд по firepower, structure, map pool, clutch, form, roster balance и пересечению лучших карт."
        />

        <button
          onClick={swapTeams}
          className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Swap teams
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TeamComparePicker
          title="Left team"
          selectedTeam={left}
          selectedId={leftId}
          searchQuery={leftSearch}
          onSearchChange={setLeftSearch}
          onSelect={(teamId) => {
            setLeftId(teamId);
            setLeftSearch("");
          }}
          blockedTeamId={rightId}
        />

        <TeamComparePicker
          title="Right team"
          selectedTeam={right}
          selectedId={rightId}
          searchQuery={rightSearch}
          onSearchChange={setRightSearch}
          onSelect={(teamId) => {
            setRightId(teamId);
            setRightSearch("");
          }}
          blockedTeamId={leftId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CompareSummaryCard
          title="Overall edge"
          value={verdict.winner}
          subtitle={verdict.summary}
        />
        <CompareSummaryCard
          title={`${left.name} edge`}
          value={verdict.leftWins.toString()}
          subtitle="categories won"
        />
        <CompareSummaryCard
          title={`${right.name} edge`}
          value={verdict.rightWins.toString()}
          subtitle="categories won"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TeamCompareProfile team={left} players={leftPlayers} />
        <TeamCompareProfile team={right} players={rightPlayers} />
      </div>

      <Panel title={`${left.name} vs ${right.name}`}>
        <div className="grid gap-4">
          {rows.map((row) => (
            <TeamCompareMetricDetailed key={row.label} row={row} left={left} right={right} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Roster role balance">
          <div className="grid gap-4 md:grid-cols-2">
            <TeamRoleList team={left} players={leftPlayers} />
            <TeamRoleList team={right} players={rightPlayers} />
          </div>
        </Panel>

        <Panel title="Map overlap">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Shared best maps
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sharedMaps.length > 0 ? (
                  sharedMaps.map((map) => (
                    <span
                      key={map}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-200"
                    >
                      {map}
                    </span>
                  ))
                ) : (
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
                    Нет пересечения по best maps.
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Read
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getTeamCompareRead(left, right, sharedMaps)}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function TeamComparePicker({
  title,
  selectedTeam,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  blockedTeamId,
}: {
  title: string;
  selectedTeam: (typeof teams)[number];
  selectedId: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (teamId: string) => void;
  blockedTeamId: string;
}) {
  const filteredTeams = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return teams
      .filter((team) => {
        const playerNames = getTeamPlayers(team)
          .map((player) => player.nickname)
          .join(" ")
          .toLowerCase();

        return (
          normalizedQuery.length === 0 ||
          team.name.toLowerCase().includes(normalizedQuery) ||
          team.region.toLowerCase().includes(normalizedQuery) ||
          team.bestMaps.join(" ").toLowerCase().includes(normalizedQuery) ||
          playerNames.includes(normalizedQuery)
        );
      })
      .sort((a, b) => getTeamOverallScore(b) - getTeamOverallScore(a));
  }, [searchQuery]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-black">{selectedTeam.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {selectedTeam.region} · {getTeamStrongestArea(selectedTeam)} profile
          </p>
        </div>
        <Score value={getTeamOverallScore(selectedTeam)} />
      </div>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-slate-400">Search team</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Vitality, Spirit, Nuke, donk..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-4 grid max-h-[320px] gap-2 overflow-y-auto pr-1">
        {filteredTeams.map((team) => {
          const isSelected = team.id === selectedId;
          const isBlocked = team.id === blockedTeamId;

          return (
            <button
              key={team.id}
              onClick={() => onSelect(team.id)}
              disabled={isBlocked}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-300/10"
                  : isBlocked
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
              }`}
            >
              <div>
                <div className="font-black text-white">{team.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {team.region} · {team.bestMaps.slice(0, 2).join(", ")}
                </div>
              </div>
              <span className="rounded-xl bg-white/5 px-3 py-2 text-sm font-black text-cyan-300">
                {getTeamOverallScore(team)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TeamCompareProfile({
  team,
  players: teamPlayers,
}: {
  team: (typeof teams)[number];
  players: CS2Player[];
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-3xl font-black">{team.name}</h3>
          <p className="mt-1 text-slate-400">
            {team.region} · {getTeamStrongestArea(team)} / weak: {getTeamWeakestArea(team)}
          </p>
        </div>
        <Score value={getTeamOverallScore(team)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {team.bestMaps.map((map) => (
          <span
            key={map}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200"
          >
            {map}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <Metric label="Firepower" value={team.scores.firepower} />
        <Metric label="Structure" value={team.scores.structure} />
        <Metric label="Map Pool" value={team.scores.mapPool} />
        <Metric label="Clutch" value={team.scores.clutch} />
        <Metric label="Form" value={team.scores.form} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {teamPlayers.map((player) => (
          <span key={player.id} className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
            {player.nickname}
          </span>
        ))}
      </div>
    </article>
  );
}

function TeamCompareMetricDetailed({
  row,
  left,
  right,
}: {
  row: TeamCompareRow;
  left: (typeof teams)[number];
  right: (typeof teams)[number];
}) {
  const maxValue = Math.max(row.left, row.right, 1);
  const leftWidth = Math.max(3, Math.round((row.left / maxValue) * 100));
  const rightWidth = Math.max(3, Math.round((row.right / maxValue) * 100));

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-black text-white">{row.label}</div>
          <div className="mt-1 text-xs text-slate-500">
            {Math.round(row.left)} vs {Math.round(row.right)}
          </div>
        </div>
        <TeamCompareWinnerBadge winner={row.winner} left={left} right={right} />
      </div>

      <div className="grid gap-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{left.name}</span>
            <span>{Math.round(row.left)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${leftWidth}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{right.name}</span>
            <span>{Math.round(row.right)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400" style={{ width: `${rightWidth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCompareWinnerBadge({
  winner,
  left,
  right,
}: {
  winner: TeamCompareRow["winner"];
  left: (typeof teams)[number];
  right: (typeof teams)[number];
}) {
  if (winner === "tie") {
    return (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
        Tie
      </span>
    );
  }

  const winnerName = winner === "left" ? left.name : right.name;
  const className =
    winner === "left"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
      : "border-purple-300/20 bg-purple-300/10 text-purple-200";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${className}`}>
      {winnerName}
    </span>
  );
}

function TeamRoleList({
  team,
  players: teamPlayers,
}: {
  team: (typeof teams)[number];
  players: CS2Player[];
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
        {team.name}
      </p>
      <div className="mt-3 grid gap-2">
        {teamPlayers.map((player) => (
          <div key={player.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-white">{player.nickname}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              {player.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTeamOverallScore(team: (typeof teams)[number]) {
  return Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );
}

function getTeamPlayers(team: (typeof teams)[number]) {
  return players.filter((player) => team.players.includes(player.id));
}

function getTeamAverageImpact(team: (typeof teams)[number]) {
  const teamPlayers = getTeamPlayers(team);

  if (teamPlayers.length === 0) return 0;

  return Math.round(
    teamPlayers.reduce((sum, player) => sum + getPlayerImpact(player), 0) / teamPlayers.length,
  );
}

function getTeamStarPower(team: (typeof teams)[number]) {
  const teamPlayers = getTeamPlayers(team);

  if (teamPlayers.length === 0) return 0;

  return Math.max(...teamPlayers.map((player) => getPlayerImpact(player)));
}

function getTeamRoleBalanceScore(team: (typeof teams)[number]) {
  const teamPlayers = getTeamPlayers(team);
  const rolesInTeam = new Set(teamPlayers.map((player) => player.role));
  let score = rolesInTeam.size * 12;

  if (rolesInTeam.has("AWPer")) score += 10;
  if (rolesInTeam.has("Entry")) score += 10;
  if (rolesInTeam.has("IGL")) score += 10;
  if (rolesInTeam.has("Support") || rolesInTeam.has("Anchor")) score += 8;

  return Math.max(0, Math.min(100, score));
}

function getTeamCompareRows(
  left: (typeof teams)[number],
  right: (typeof teams)[number],
): TeamCompareRow[] {
  const rawRows: Omit<TeamCompareRow, "winner">[] = [
    { label: "Team Score", left: getTeamOverallScore(left), right: getTeamOverallScore(right) },
    { label: "Firepower", left: left.scores.firepower, right: right.scores.firepower },
    { label: "Structure", left: left.scores.structure, right: right.scores.structure },
    { label: "Map Pool", left: left.scores.mapPool, right: right.scores.mapPool },
    { label: "Clutch", left: left.scores.clutch, right: right.scores.clutch },
    { label: "Form", left: left.scores.form, right: right.scores.form },
    { label: "Average Player Impact", left: getTeamAverageImpact(left), right: getTeamAverageImpact(right) },
    { label: "Star Power", left: getTeamStarPower(left), right: getTeamStarPower(right) },
    { label: "Role Balance", left: getTeamRoleBalanceScore(left), right: getTeamRoleBalanceScore(right) },
  ];

  return rawRows.map((row) => ({
    ...row,
    winner: getTeamCompareWinner(row.left, row.right),
  }));
}

function getTeamCompareWinner(left: number, right: number): TeamCompareRow["winner"] {
  const diff = Math.abs(left - right);

  if (diff < 1) return "tie";
  return left > right ? "left" : "right";
}

function getTeamComparisonVerdict(
  left: (typeof teams)[number],
  right: (typeof teams)[number],
  rows: TeamCompareRow[],
) {
  const leftWins = rows.filter((row) => row.winner === "left").length;
  const rightWins = rows.filter((row) => row.winner === "right").length;
  const winner =
    leftWins === rightWins ? "Even" : leftWins > rightWins ? left.name : right.name;

  const summary =
    winner === "Even"
      ? "matchup is close by MVP categories"
      : `${winner} leads by ${Math.abs(leftWins - rightWins)} categories`;

  return { winner, leftWins, rightWins, summary };
}

function getTeamCompareRead(
  left: (typeof teams)[number],
  right: (typeof teams)[number],
  sharedMaps: string[],
) {
  const leftStrong = getTeamStrongestArea(left);
  const rightStrong = getTeamStrongestArea(right);
  const overlapText =
    sharedMaps.length > 0
      ? `Общие сильные карты: ${sharedMaps.join(", ")}.`
      : "По best maps нет прямого пересечения.";

  return `${left.name} опирается на ${leftStrong}, ${right.name} — на ${rightStrong}. ${overlapText} В MVP-логике это помогает быстро понять, где матчап будет решаться: в огневой мощи, структуре, clutch-ситуациях или глубине map pool.`;
}


function MapsView({
  onMapClick,
}: {
  onMapClick: (mapId: string) => void;
}) {
  return (
    <section className="grid gap-6">
      <PageTitle
        title="Maps"
        description="Карта как аналитический профиль: стиль, сторона, ценность AWP, entry и anchor-ролей."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {maps.map((map) => {
          const bestTeams = getBestTeamsForMap(map).slice(0, 3);
          const bestPlayers = getBestPlayersForMap(map).slice(0, 3);

          return (
            <button
              key={map.id}
              onClick={() => onMapClick(map.id)}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-black">{map.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{map.identity}</p>
                </div>

                <span className="rounded-2xl bg-cyan-300 px-3 py-2 text-sm font-black text-slate-950">
                  {map.sideProfile}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <Metric label="T-side difficulty" value={map.tSideDifficulty} />
                <Metric label="CT-side strength" value={map.ctSideStrength} />
                <Metric label="AWP value" value={map.awpValue} />
                <Metric label="Entry value" value={map.entryValue} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best teams
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bestTeams.length > 0 ? (
                    bestTeams.map((team) => (
                      <span
                        key={team.id}
                        className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300"
                      >
                        {team.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No team tags yet</span>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best player fits
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bestPlayers.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200"
                    >
                      {player.nickname}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MapDetailView({
  map,
  onBack,
}: {
  map: CS2MapProfile;
  onBack: () => void;
}) {
  const bestTeams = getBestTeamsForMap(map);
  const bestPlayers = getBestPlayersForMap(map).slice(0, 8);
  const mapScore = Math.round(
    map.ctSideStrength * 0.25 +
      map.tSideDifficulty * 0.2 +
      map.awpValue * 0.2 +
      map.entryValue * 0.2 +
      map.anchorPressure * 0.15,
  );

  return (
    <section className="grid gap-6">
      <button
        onClick={onBack}
        className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ← Back to maps
      </button>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Map Profile
            </p>

            <h2 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              {map.name}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                {map.sideProfile}
              </span>
              {map.bestRoles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">{map.summary}</p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
              Map Intensity
            </p>
            <div className="mt-2 text-6xl font-black text-cyan-200">
              {mapScore}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Custom ClutchLab score
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="T Difficulty"
          value={map.tSideDifficulty.toString()}
          subtitle="attack pressure"
        />
        <StatCard
          title="CT Strength"
          value={map.ctSideStrength.toString()}
          subtitle="defense value"
        />
        <StatCard
          title="AWP Value"
          value={map.awpValue.toString()}
          subtitle="angle control"
        />
        <StatCard
          title="Entry Value"
          value={map.entryValue.toString()}
          subtitle="space creation"
        />
        <StatCard
          title="Anchor Pressure"
          value={map.anchorPressure.toString()}
          subtitle="site defense"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Map profile">
          <div className="grid gap-4">
            <Metric label="T-side difficulty" value={map.tSideDifficulty} />
            <Metric label="CT-side strength" value={map.ctSideStrength} />
            <Metric label="AWP value" value={map.awpValue} />
            <Metric label="Entry value" value={map.entryValue} />
            <Metric label="Anchor pressure" value={map.anchorPressure} />
          </div>

          <div className="mt-5 rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Read
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getMapRead(map)}
            </p>
          </div>
        </Panel>

        <Panel title="Best teams on this map">
          <div className="grid gap-3">
            {bestTeams.length > 0 ? (
              bestTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
                >
                  <div>
                    <div className="font-black">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {team.region} · map pool {team.scores.mapPool}/100
                    </div>
                  </div>
                  <Score value={team.scores.mapPool} />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                Пока ни одна команда не отмечена как сильная на этой карте.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Best player fits">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bestPlayers.map((player) => (
            <div
              key={player.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-black">{player.nickname}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {player.role} · {getTeamName(player.teamId, teams)}
                  </div>
                </div>
                <Score value={getMapPlayerScore(player, map)} />
              </div>

              <div className="mt-4 grid gap-2">
                <Metric label="Opening" value={player.stats.opening} />
                <Metric label="AWP" value={player.stats.awp} />
                <Metric label="Rifle" value={player.stats.rifle} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function getBestTeamsForMap(map: CS2MapProfile) {
  return teams
    .filter((team) => team.bestMaps.includes(map.name))
    .sort((a, b) => b.scores.mapPool - a.scores.mapPool);
}

function getBestPlayersForMap(map: CS2MapProfile) {
  return [...players].sort(
    (a, b) => getMapPlayerScore(b, map) - getMapPlayerScore(a, map),
  );
}

function getMapPlayerScore(player: CS2Player, map: CS2MapProfile) {
  let score =
    player.stats.impact * 0.22 +
    player.stats.consistency * 0.16 +
    player.stats.clutch * 0.14 +
    player.stats.opening * (map.entryValue / 100) * 0.18 +
    player.stats.awp * (map.awpValue / 100) * 0.14 +
    player.stats.rifle * 0.16;

  if (map.bestRoles.includes(player.role)) score += 5;
  if (player.role === "Anchor") score += map.anchorPressure * 0.04;
  if (player.role === "Entry") score += map.entryValue * 0.03;
  if (player.role === "AWPer") score += map.awpValue * 0.03;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function getMapRead(map: CS2MapProfile) {
  const roleText = map.bestRoles.join(", ");

  return `${map.name} — ${map.sideProfile.toLowerCase()} map. Главные роли: ${roleText}. AWP value ${map.awpValue}/100, entry value ${map.entryValue}/100, anchor pressure ${map.anchorPressure}/100. Сейчас это MVP-оценка, позже её можно связать с реальными map stats.`;
}

function CompareView() {
  const [leftId, setLeftId] = useState(players[0].id);
  const [rightId, setRightId] = useState(players[1]?.id ?? players[0].id);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const left = players.find((player) => player.id === leftId) ?? players[0];
  const right = players.find((player) => player.id === rightId) ?? players[1] ?? players[0];
  const rows = getCompareRows(left, right);
  const verdict = getComparisonVerdict(left, right, rows);

  function swapPlayers() {
    setLeftId(right.id);
    setRightId(left.id);
    setLeftSearch("");
    setRightSearch("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Compare"
          description="Сравнение игроков 2.0: поиск, swap, победитель по категориям и итоговый аналитический вывод."
        />

        <button
          onClick={swapPlayers}
          className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Swap players
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ComparePlayerPicker
          title="Left player"
          selectedPlayer={left}
          selectedId={leftId}
          searchQuery={leftSearch}
          onSearchChange={setLeftSearch}
          onSelect={(playerId) => {
            setLeftId(playerId);
            setLeftSearch("");
          }}
          blockedPlayerId={rightId}
        />

        <ComparePlayerPicker
          title="Right player"
          selectedPlayer={right}
          selectedId={rightId}
          searchQuery={rightSearch}
          onSearchChange={setRightSearch}
          onSelect={(playerId) => {
            setRightId(playerId);
            setRightSearch("");
          }}
          blockedPlayerId={leftId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CompareSummaryCard
          title="Overall edge"
          value={verdict.winner}
          subtitle={verdict.summary}
        />
        <CompareSummaryCard
          title={`${left.nickname} edge`}
          value={verdict.leftWins.toString()}
          subtitle="categories won"
        />
        <CompareSummaryCard
          title={`${right.nickname} edge`}
          value={verdict.rightWins.toString()}
          subtitle="categories won"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerProfile player={left} />
        <PlayerProfile player={right} />
      </div>

      <Panel title={`${left.nickname} vs ${right.nickname}`}>
        <div className="grid gap-4">
          {rows.map((row) => (
            <CompareMetricDetailed key={row.label} row={row} left={left} right={right} />
          ))}
        </div>
      </Panel>

      <Panel title="Category winners">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">{left.nickname}</th>
                <th className="px-3 py-3">{right.nickname}</th>
                <th className="px-3 py-3">Edge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/10">
                  <td className="px-3 py-3 font-bold text-white">{row.label}</td>
                  <td className="px-3 py-3 text-slate-300">{formatCompareValue(row.left, row.kind)}</td>
                  <td className="px-3 py-3 text-slate-300">{formatCompareValue(row.right, row.kind)}</td>
                  <td className="px-3 py-3">
                    <CompareWinnerBadge winner={row.winner} left={left} right={right} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Analytical read">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              {left.nickname}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getPlayerCompareRead(left, right)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-purple-300">
              {right.nickname}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getPlayerCompareRead(right, left)}
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}

type CompareRow = {
  label: string;
  left: number;
  right: number;
  kind: "score" | "rating" | "adr" | "kd" | "kast" | "price";
  winner: "left" | "right" | "tie";
};

function ComparePlayerPicker({
  title,
  selectedPlayer,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  blockedPlayerId,
}: {
  title: string;
  selectedPlayer: CS2Player;
  selectedId: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (playerId: string) => void;
  blockedPlayerId: string;
}) {
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        const teamName = getTeamName(player.teamId, teams);
        return (
          normalizedQuery.length === 0 ||
          player.nickname.toLowerCase().includes(normalizedQuery) ||
          player.country.toLowerCase().includes(normalizedQuery) ||
          player.role.toLowerCase().includes(normalizedQuery) ||
          teamName.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
      .slice(0, 8);
  }, [searchQuery]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-black">{selectedPlayer.nickname}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {getTeamName(selectedPlayer.teamId, teams)} · {selectedPlayer.role}
          </p>
        </div>
        <Score value={getPlayerImpact(selectedPlayer)} />
      </div>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-slate-400">Search player</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="m0NESY, donk, Vitality, AWPer..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-4 grid max-h-[360px] gap-2 overflow-y-auto pr-1">
        {filteredPlayers.map((player) => {
          const isSelected = player.id === selectedId;
          const isBlocked = player.id === blockedPlayerId;

          return (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              disabled={isBlocked}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-300/10"
                  : isBlocked
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                    : "border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.06]"
              }`}
            >
              <div>
                <div className="font-black text-white">{player.nickname}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {getTeamName(player.teamId, teams)} · {player.country} · {player.role}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-cyan-300">{getPlayerImpact(player)}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {isBlocked ? "selected" : `$${player.price}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CompareSummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function CompareMetricDetailed({
  row,
  left,
  right,
}: {
  row: CompareRow;
  left: CS2Player;
  right: CS2Player;
}) {
  const maxValue = Math.max(row.left, row.right, 1);
  const leftWidth = Math.max(3, Math.round((row.left / maxValue) * 100));
  const rightWidth = Math.max(3, Math.round((row.right / maxValue) * 100));

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-black text-white">{row.label}</div>
          <div className="mt-1 text-xs text-slate-500">
            {formatCompareValue(row.left, row.kind)} vs {formatCompareValue(row.right, row.kind)}
          </div>
        </div>
        <CompareWinnerBadge winner={row.winner} left={left} right={right} />
      </div>

      <div className="grid gap-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{left.nickname}</span>
            <span>{formatCompareValue(row.left, row.kind)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${leftWidth}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{right.nickname}</span>
            <span>{formatCompareValue(row.right, row.kind)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400" style={{ width: `${rightWidth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareWinnerBadge({
  winner,
  left,
  right,
}: {
  winner: CompareRow["winner"];
  left: CS2Player;
  right: CS2Player;
}) {
  if (winner === "tie") {
    return (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
        Tie
      </span>
    );
  }

  const winnerName = winner === "left" ? left.nickname : right.nickname;
  const className =
    winner === "left"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
      : "border-purple-300/20 bg-purple-300/10 text-purple-200";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${className}`}>
      {winnerName}
    </span>
  );
}

function getCompareRows(left: CS2Player, right: CS2Player): CompareRow[] {
  const rawRows: Omit<CompareRow, "winner">[] = [
    { label: "Impact Index", left: getPlayerImpact(left), right: getPlayerImpact(right), kind: "score" },
    { label: "Rating", left: left.stats.rating, right: right.stats.rating, kind: "rating" },
    { label: "ADR", left: left.stats.adr, right: right.stats.adr, kind: "adr" },
    { label: "K/D", left: left.stats.kd, right: right.stats.kd, kind: "kd" },
    { label: "KAST", left: left.stats.kast, right: right.stats.kast, kind: "kast" },
    { label: "Opening", left: left.stats.opening, right: right.stats.opening, kind: "score" },
    { label: "Clutch", left: left.stats.clutch, right: right.stats.clutch, kind: "score" },
    { label: "AWP Power", left: left.stats.awp, right: right.stats.awp, kind: "score" },
    { label: "Rifle Power", left: left.stats.rifle, right: right.stats.rifle, kind: "score" },
    { label: "Consistency", left: left.stats.consistency, right: right.stats.consistency, kind: "score" },
    { label: "Roster Price", left: left.price, right: right.price, kind: "price" },
  ];

  return rawRows.map((row) => ({
    ...row,
    winner: getRowWinner(row.left, row.right, row.kind),
  }));
}

function getRowWinner(left: number, right: number, kind: CompareRow["kind"]): CompareRow["winner"] {
  const tolerance = kind === "rating" || kind === "kd" ? 0.01 : 1;

  if (Math.abs(left - right) <= tolerance) {
    return "tie";
  }

  return left > right ? "left" : "right";
}

function getComparisonVerdict(left: CS2Player, right: CS2Player, rows: CompareRow[]) {
  const leftWins = rows.filter((row) => row.winner === "left").length;
  const rightWins = rows.filter((row) => row.winner === "right").length;
  const impactDiff = getPlayerImpact(left) - getPlayerImpact(right);

  if (leftWins === rightWins || Math.abs(impactDiff) <= 2) {
    return {
      winner: "Even",
      leftWins,
      rightWins,
      summary: "very close profile",
    };
  }

  if (leftWins > rightWins) {
    return {
      winner: left.nickname,
      leftWins,
      rightWins,
      summary: `edge by ${leftWins - rightWins} categories`,
    };
  }

  return {
    winner: right.nickname,
    leftWins,
    rightWins,
    summary: `edge by ${rightWins - leftWins} categories`,
  };
}

function getPlayerCompareRead(player: CS2Player, opponent: CS2Player) {
  const playerImpact = getPlayerImpact(player);
  const opponentImpact = getPlayerImpact(opponent);
  const impactText =
    playerImpact > opponentImpact + 2
      ? "имеет преимущество по общему impact"
      : playerImpact < opponentImpact - 2
        ? "уступает по общему impact"
        : "примерно равен сопернику по общему impact";

  const strongestArea = getPlayerStrongestCompareArea(player);
  const roleContext =
    player.role === opponent.role
      ? `Это прямое сравнение внутри роли ${player.role}.`
      : `Сравнение разных ролей: ${player.role} против ${opponent.role}.`;

  return `${roleContext} ${player.nickname} ${impactText}. Главная сильная зона: ${strongestArea}. Цена в билдере: $${player.price}.`;
}

function getPlayerStrongestCompareArea(player: CS2Player) {
  const entries = [
    ["opening pressure", player.stats.opening],
    ["clutch", player.stats.clutch],
    ["AWP power", player.stats.awp],
    ["rifle power", player.stats.rifle],
    ["consistency", player.stats.consistency],
  ] as const;

  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}

function formatCompareValue(value: number, kind: CompareRow["kind"]) {
  if (kind === "rating" || kind === "kd") return value.toFixed(2);
  if (kind === "adr") return value.toFixed(1);
  if (kind === "kast") return `${value.toFixed(1)}%`;
  if (kind === "price") return `$${value}`;
  return Math.round(value).toString();
}

function RosterBuilderView() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => readActiveRosterIds());
  const [rosterName, setRosterName] = useState("");

  const selectedPlayers = players.filter((player) => selectedIds.includes(player.id));
  const totalPrice = selectedPlayers.reduce((sum, player) => sum + player.price, 0);
  const remainingBudget = 25 - totalPrice;
  const score = getRosterScore(selectedPlayers);
  const warnings = getRosterWarnings(selectedPlayers);
  const isOverBudget = totalPrice > 25;
  const rosterStatus = getRosterStatus(selectedPlayers, isOverBudget, warnings);
  const rosterRead = getRosterRead(selectedPlayers, score, warnings, isOverBudget);

  function togglePlayer(player: CS2Player) {
    setSelectedIds((current) => {
      const alreadySelected = current.includes(player.id);

      if (alreadySelected) {
        return current.filter((id) => id !== player.id);
      }

      const currentPlayers = players.filter((item) => current.includes(item.id));
      const currentPrice = currentPlayers.reduce((sum, item) => sum + item.price, 0);
      const wouldExceedBudget = currentPrice + player.price > 25;
      const wouldExceedSlots = current.length >= 5;

      if (wouldExceedBudget || wouldExceedSlots) {
        return current;
      }

      return [...current, player.id];
    });
  }

  function clearRoster() {
    setSelectedIds([]);
  }

  function saveRoster() {
    if (selectedPlayers.length !== 5 || isOverBudget) return;

    const name = rosterName.trim() || `Roster ${new Date().toLocaleString()}`;
    const savedRoster: SavedRoster = {
      id: `roster-${Date.now()}`,
      name,
      playerIds: selectedIds,
      createdAt: new Date().toISOString(),
    };

    const nextRosters = [savedRoster, ...readSavedRosters()].slice(0, 30);
    writeSavedRosters(nextRosters);
    setRosterName("");
    navigate("/saved-rosters");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Roster Builder"
          description="Собери состав из 5 игроков за бюджет $25. Теперь билдер блокирует невалидные выборы и даёт аналитический вывод."
        />

        <div className="flex flex-wrap gap-2">
          <RosterStatusBadge status={rosterStatus} />
          <button
            onClick={clearRoster}
            disabled={selectedPlayers.length === 0}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear roster
          </button>
          <NavLink
            to="/saved-rosters"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Saved rosters
          </NavLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Selected" value={`${selectedPlayers.length}/5`} subtitle="players" />
        <StatCard
          title="Budget"
          value={`$${totalPrice}/25`}
          subtitle={`remaining $${Math.max(remainingBudget, 0)}`}
          danger={isOverBudget}
        />
        <StatCard title="Firepower" value={score.firepower.toString()} subtitle="rifle + impact" />
        <StatCard title="Structure" value={score.structure.toString()} subtitle="roles + consistency" />
        <StatCard title="Total" value={score.total.toString()} subtitle="roster score" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Panel title="Available players">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            Карточки автоматически блокируются, если игрок не помещается в бюджет или в составе уже 5 человек. Выбранного игрока можно нажать повторно, чтобы убрать.
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {players.map((player) => {
              const selected = selectedIds.includes(player.id);
              const wouldExceedBudget = !selected && totalPrice + player.price > 25;
              const rosterIsFull = !selected && selectedPlayers.length >= 5;
              const disabled = wouldExceedBudget || rosterIsFull;
              const budgetAfterPick = totalPrice + player.price;

              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player)}
                  disabled={disabled}
                  className={`rounded-3xl border p-4 text-left transition ${
                    selected
                      ? "border-cyan-300 bg-cyan-300/10"
                      : disabled
                        ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-45"
                        : "border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black">{player.nickname}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {player.country} · {getTeamName(player.teamId, teams)}
                      </div>
                    </div>
                    <div className="text-xl font-black text-cyan-300">${player.price}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <RoleBadge role={player.role} />
                    <span className="text-sm font-semibold text-slate-300">
                      Impact {getPlayerImpact(player)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                    {selected && (
                      <span className="rounded-full bg-cyan-300 px-3 py-1 text-slate-950">
                        Selected
                      </span>
                    )}

                    {!selected && !disabled && (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                        After pick: ${budgetAfterPick}/25
                      </span>
                    )}

                    {wouldExceedBudget && (
                      <span className="rounded-full bg-red-400/15 px-3 py-1 text-red-200">
                        Over budget
                      </span>
                    )}

                    {rosterIsFull && (
                      <span className="rounded-full bg-amber-300/15 px-3 py-1 text-amber-200">
                        Roster full
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Your roster">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-2xl font-black text-white">{rosterStatus.label}</p>
              </div>
              <RosterStatusBadge status={rosterStatus} />
            </div>
            <p className="text-sm text-slate-300">{rosterRead}</p>
          </div>

          <div className="grid gap-3">
            {selectedPlayers.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                Выбери игроков слева.
              </div>
            )}

            {selectedPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => togglePlayer(player)}
                className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
              >
                <div>
                  <div className="font-black">{player.nickname}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {player.role} · Impact {getPlayerImpact(player)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-cyan-300">${player.price}</div>
                  <div className="mt-1 text-xs text-slate-500">remove</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Save roster
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={rosterName}
                onChange={(event) => setRosterName(event.target.value)}
                placeholder="Roster name, например: Dream five"
                className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
              />
              <button
                onClick={saveRoster}
                disabled={selectedPlayers.length !== 5 || isOverBudget}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Сохранение доступно для состава 5/5 в рамках бюджета. Данные хранятся в браузере через localStorage.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <Metric label="AWP Power" value={score.awp} />
            <Metric label="Entry Pressure" value={score.entry} />
            <Metric label="Clutch" value={score.clutch} />
            <Metric label="Structure" value={score.structure} />
          </div>

          <div className="mt-5 grid gap-2">
            {(isOverBudget || warnings.length > 0) && (
              <p className="text-sm font-bold uppercase tracking-wider text-amber-300">
                Проверка состава
              </p>
            )}

            {isOverBudget && (
              <Warning text="Бюджет превышен. Нужно убрать дорогого игрока." />
            )}

            {warnings.map((warning) => (
              <Warning key={warning} text={warning} />
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}


function SavedRostersView() {
  const navigate = useNavigate();
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>(() => readSavedRosters());

  function deleteRoster(rosterId: string) {
    const nextRosters = savedRosters.filter((roster) => roster.id !== rosterId);
    setSavedRosters(nextRosters);
    writeSavedRosters(nextRosters);
  }

  function loadRoster(roster: SavedRoster) {
    writeActiveRosterIds(roster.playerIds);
    navigate("/roster-builder");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Saved Rosters"
          description="Сохранённые составы из Roster Builder. Они хранятся локально в браузере, без аккаунта и backend."
        />

        <NavLink
          to="/roster-builder"
          className="w-fit rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
        >
          Build new roster
        </NavLink>
      </div>

      {savedRosters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-2xl font-black text-white">Пока нет сохранённых составов</p>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Собери валидный ростер 5/5 в рамках бюджета, задай название и нажми Save. После этого он появится здесь.
          </p>
          <NavLink
            to="/roster-builder"
            className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200"
          >
            Go to Roster Builder
          </NavLink>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {savedRosters.map((roster) => {
            const rosterPlayers = getRosterPlayers(roster.playerIds);
            const totalPrice = rosterPlayers.reduce((sum, player) => sum + player.price, 0);
            const score = getRosterScore(rosterPlayers);
            const warnings = getRosterWarnings(rosterPlayers);
            const createdAt = new Date(roster.createdAt);

            return (
              <article
                key={roster.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">{roster.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {Number.isNaN(createdAt.getTime())
                        ? "Saved roster"
                        : createdAt.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Score value={score.total} />
                    <span className="inline-flex h-11 items-center rounded-2xl bg-white/5 px-3 text-sm font-black text-cyan-300">
                      ${totalPrice}/25
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {rosterPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
                    >
                      <div>
                        <div className="font-black">{player.nickname}</div>
                        <div className="mt-1 text-sm text-slate-400">
                          {player.role} · {getTeamName(player.teamId, teams)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-cyan-300">${player.price}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Impact {getPlayerImpact(player)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <MiniMetric title="Firepower" value={score.firepower} />
                  <MiniMetric title="AWP" value={score.awp} />
                  <MiniMetric title="Entry" value={score.entry} />
                  <MiniMetric title="Structure" value={score.structure} />
                </div>

                {warnings.length > 0 && (
                  <div className="mt-5 grid gap-2">
                    {warnings.map((warning) => (
                      <Warning key={warning} text={warning} />
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => loadRoster(roster)}
                    className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                  >
                    Load in builder
                  </button>
                  <button
                    onClick={() => deleteRoster(roster.id)}
                    className="rounded-full border border-red-300/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-400/15"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getRosterStatus(
  selectedPlayers: CS2Player[],
  isOverBudget: boolean,
  warnings: string[],
) {
  if (isOverBudget || selectedPlayers.length === 0) {
    return {
      label: "Invalid",
      className: "border-red-400/30 bg-red-500/10 text-red-200",
    };
  }

  if (selectedPlayers.length === 5 && warnings.length === 0) {
    return {
      label: "Valid",
      className: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  return {
    label: "Almost ready",
    className: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  };
}

function getRosterRead(
  selectedPlayers: CS2Player[],
  score: ReturnType<typeof getRosterScore>,
  warnings: string[],
  isOverBudget: boolean,
) {
  if (selectedPlayers.length === 0) {
    return "Состав пустой. Начни с AWP или entry-игрока, а затем добавь IGL/support для структуры.";
  }

  if (isOverBudget) {
    return "Состав невалиден по бюджету. Снизь стоимость ростера, убрав одного дорогого игрока.";
  }

  if (selectedPlayers.length < 5) {
    return `Состав ещё не готов: выбрано ${selectedPlayers.length}/5. Текущий профиль: firepower ${score.firepower}, structure ${score.structure}, clutch ${score.clutch}.`;
  }

  if (warnings.length > 0) {
    return `Состав собран, но есть проблемы по ролям: ${warnings.join(" ")}`;
  }

  const bestArea = [
    ["firepower", score.firepower],
    ["AWP power", score.awp],
    ["entry pressure", score.entry],
    ["clutch", score.clutch],
    ["structure", score.structure],
  ] as const;

  const strongest = [...bestArea].sort((a, b) => b[1] - a[1])[0][0];

  return `Валидный состав. Главная сила — ${strongest}. Общий рейтинг ${score.total}/100, при этом структура ${score.structure}/100 и clutch ${score.clutch}/100.`;
}

function RosterStatusBadge({
  status,
}: {
  status: ReturnType<typeof getRosterStatus>;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-black ${status.className}`}
    >
      {status.label}
    </span>
  );
}

function RolesView({
  onRoleClick,
}: {
  onRoleClick: (roleId: string) => void;
}) {
  return (
    <section className="grid gap-6">
      <PageTitle
        title="Roles"
        description="Ролевые страницы связывают игроков, карты и roster builder: кто лучший в роли, какие карты подходят и как использовать роль в составе."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleConfigs.map((config) => {
          const rolePlayers = getRolePlayers(config.role);
          const bestPlayers = getBestPlayersForRole(config.role, 3);
          const average = getAverageRoleProfile(config.role);
          const bestMap = getBestMapsForRole(config.role, 1)[0];

          return (
            <button
              key={config.id}
              onClick={() => onRoleClick(config.id)}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black">{config.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{config.identity}</p>
                </div>
                <Score value={average.roleFit} />
              </div>

              <div className="mt-5 grid gap-3">
                <MiniMetric title="Players" value={rolePlayers.length} />
                <Metric label="Avg Impact" value={average.impact} />
                <Metric label="Avg Role Fit" value={average.roleFit} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Top players
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bestPlayers.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300"
                    >
                      {player.nickname}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best map fit
                </p>
                <span className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                  {bestMap?.map.name ?? "No map"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoleDetailView({
  config,
  onBack,
}: {
  config: RoleConfig;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const rolePlayers = getRolePlayers(config.role);
  const topPlayers = getBestPlayersForRole(config.role, 8);
  const average = getAverageRoleProfile(config.role);
  const bestMaps = getBestMapsForRole(config.role, 5);
  const similarRoles = getSimilarRoles(config.role);

  return (
    <section className="grid gap-6">
      <button
        onClick={onBack}
        className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ← Back to roles
      </button>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Role Profile
            </p>

            <h2 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              {config.title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadge role={config.role} />
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {rolePlayers.length} players
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {config.identity}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">{config.description}</p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
              Avg Role Fit
            </p>
            <div className="mt-2 text-6xl font-black text-cyan-200">
              {average.roleFit}
            </div>
            <p className="mt-2 text-sm text-slate-400">Current MVP role pool</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Players" value={rolePlayers.length.toString()} subtitle="in database" />
        <StatCard title="Impact" value={average.impact.toString()} subtitle="avg index" />
        <StatCard title="Opening" value={average.opening.toString()} subtitle="pressure" />
        <StatCard title="Clutch" value={average.clutch.toString()} subtitle="late round" />
        <StatCard title="Price" value={`$${average.price}`} subtitle="avg budget" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title={`Top ${config.title}s`}>
          <div className="grid gap-3">
            {topPlayers.length > 0 ? (
              topPlayers.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => navigate(`/players/${player.id}`)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-black">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-black">{player.nickname}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {player.country} · {getTeamName(player.teamId, teams)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-sm font-semibold text-slate-400 md:inline">
                      Role Fit {getRoleFitScore(player)}
                    </span>
                    <Score value={getPlayerImpact(player)} />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                No players for this role yet.
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Role model">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                What this role needs
              </p>
              <div className="mt-3 grid gap-2">
                {config.needs.map((item) => (
                  <span key={item} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Roster builder advice
              </p>
              <p className="mt-2 text-sm text-slate-300">{config.rosterAdvice}</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Average profile">
          <div className="grid gap-4">
            <Metric label="Role Fit" value={average.roleFit} />
            <Metric label="Impact" value={average.impact} />
            <Metric label="Opening" value={average.opening} />
            <Metric label="Clutch" value={average.clutch} />
            <Metric label="AWP Power" value={average.awp} />
            <Metric label="Rifle Power" value={average.rifle} />
            <Metric label="Consistency" value={average.consistency} />
          </div>
        </Panel>

        <Panel title="Best map fits">
          <div className="grid gap-3">
            {bestMaps.map(({ map, score, reason }) => (
              <button
                key={map.id}
                onClick={() => navigate(`/maps/${map.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{map.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{reason}</div>
                  </div>
                  <Score value={score} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Best use cases">
          <div className="grid gap-2">
            {config.bestUse.map((item) => (
              <div key={item} className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Similar roles">
          <div className="grid gap-3">
            {similarRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => navigate(`/roles/${role.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{role.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{role.identity}</div>
                  </div>
                  <RoleBadge role={role.role} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function getRolePlayers(role: PlayerRole) {
  return players.filter((player) => player.role === role);
}

function getBestPlayersForRole(role: PlayerRole, limit = 5) {
  return getRolePlayers(role)
    .sort((a, b) => {
      const roleFitDifference = getRoleFitScore(b) - getRoleFitScore(a);
      if (roleFitDifference !== 0) return roleFitDifference;
      return getPlayerImpact(b) - getPlayerImpact(a);
    })
    .slice(0, limit);
}

function getAverageRoleProfile(role: PlayerRole) {
  const rolePlayers = getRolePlayers(role);

  return {
    roleFit: average(rolePlayers.map((player) => getRoleFitScore(player))),
    impact: average(rolePlayers.map((player) => getPlayerImpact(player))),
    rating: average(rolePlayers.map((player) => ratingToScore(player.stats.rating))),
    opening: average(rolePlayers.map((player) => player.stats.opening)),
    clutch: average(rolePlayers.map((player) => player.stats.clutch)),
    awp: average(rolePlayers.map((player) => player.stats.awp)),
    rifle: average(rolePlayers.map((player) => player.stats.rifle)),
    consistency: average(rolePlayers.map((player) => player.stats.consistency)),
    price: average(rolePlayers.map((player) => player.price)),
  };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getBestMapsForRole(role: PlayerRole, limit = 5) {
  return maps
    .map((map) => ({
      map,
      score: getRoleMapScore(role, map),
      reason: getRoleMapReason(role, map),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getRoleMapScore(role: PlayerRole, map: CS2MapProfile) {
  const directRoleBonus = map.bestRoles.includes(role) ? 18 : 0;
  const familyBonus = map.bestRoles.some((item) => getRoleFamily(item) === getRoleFamily(role)) ? 8 : 0;

  if (role === "AWPer") {
    return Math.min(100, Math.round(map.awpValue * 0.68 + map.ctSideStrength * 0.18 + directRoleBonus + familyBonus));
  }

  if (role === "Entry" || role === "Star Rifler") {
    return Math.min(100, Math.round(map.entryValue * 0.55 + map.tSideDifficulty * 0.18 + map.ctSideStrength * 0.12 + directRoleBonus + familyBonus));
  }

  if (role === "Anchor" || role === "Support" || role === "IGL") {
    return Math.min(100, Math.round(map.anchorPressure * 0.46 + map.ctSideStrength * 0.24 + map.tSideDifficulty * 0.12 + directRoleBonus + familyBonus));
  }

  return Math.min(100, Math.round(map.entryValue * 0.26 + map.anchorPressure * 0.24 + map.ctSideStrength * 0.18 + map.awpValue * 0.12 + directRoleBonus + familyBonus));
}

function getRoleMapReason(role: PlayerRole, map: CS2MapProfile) {
  if (map.bestRoles.includes(role)) {
    return `${role} is listed as a primary role fit on ${map.name}.`;
  }

  if (role === "AWPer" && map.awpValue >= 80) {
    return "High AWP value map with long-angle control.";
  }

  if ((role === "Entry" || role === "Star Rifler") && map.entryValue >= 80) {
    return "Strong map for opening duels and rifle pressure.";
  }

  if ((role === "Anchor" || role === "Support" || role === "IGL") && map.anchorPressure >= 82) {
    return "High structure and site-defense value.";
  }

  return map.identity;
}

function getSimilarRoles(role: PlayerRole) {
  return roleConfigs
    .filter((config) => config.role !== role)
    .map((config) => ({
      ...config,
      score: getRoleFamily(config.role) === getRoleFamily(role) ? 100 : 65,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function TraitsView() {
  const topImpact = [...players].sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a)).slice(0, 5);
  const topClutch = [...players].sort((a, b) => b.stats.clutch - a.stats.clutch).slice(0, 5);
  const topAWP = [...players].sort((a, b) => b.stats.awp - a.stats.awp).slice(0, 5);
  const topEntry = [...players].sort((a, b) => b.stats.opening - a.stats.opening).slice(0, 5);

  return (
    <section className="grid gap-6">
      <PageTitle
        title="Traits"
        description="Рейтинги по типам игроков: impact, clutch, AWP и entry pressure."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TraitList title="Highest Impact" players={topImpact} value={(p) => getPlayerImpact(p)} />
        <TraitList title="Best Clutch" players={topClutch} value={(p) => p.stats.clutch} />
        <TraitList title="Best AWPers" players={topAWP} value={(p) => p.stats.awp} />
        <TraitList title="Best Entry Pressure" players={topEntry} value={(p) => p.stats.opening} />
      </div>
    </section>
  );
}

function PlayerDetailView({
  player,
  onBack,
}: {
  player: CS2Player;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const impact = getPlayerImpact(player);
  const teamName = getTeamName(player.teamId, teams);
  const similarPlayers = getSimilarPlayers(player, 4);
  const roleFit = getRoleFitScore(player);
  const weaponProfile = getPlayerWeaponProfile(player);
  const bestMapFits = getBestMapFits(player, 3);
  const teamFits = getTeamFitSuggestions(player, 3);
  const strengths = getPlayerStrengths(player);
  const weaknesses = getPlayerWeaknesses(player);

  return (
    <section className="grid gap-6">
      <button
        onClick={onBack}
        className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ← Back to players
      </button>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Player Profile 2.0
            </p>

            <h2 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              {player.nickname}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadge role={player.role} />
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {player.country}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {teamName}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                ${player.price}
              </span>
              <span className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-sm font-semibold text-purple-200">
                {weaponProfile.label}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">
              {getPlayerSummary(player)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[18rem] md:grid-cols-1">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
                Impact Index
              </p>
              <div className="mt-2 text-6xl font-black text-cyan-200">
                {impact}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Custom ClutchLab score
              </p>
            </div>

            <div className="rounded-3xl border border-purple-300/20 bg-purple-300/10 p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-purple-200">
                Role Fit
              </p>
              <div className="mt-2 text-5xl font-black text-purple-200">
                {roleFit}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Fit for listed role
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <StatCard
          title="Rating"
          value={player.stats.rating.toFixed(2)}
          subtitle="overall form"
        />
        <StatCard
          title="ADR"
          value={player.stats.adr.toFixed(1)}
          subtitle="damage output"
        />
        <StatCard
          title="K/D"
          value={player.stats.kd.toFixed(2)}
          subtitle="survival value"
        />
        <StatCard
          title="KAST"
          value={`${player.stats.kast.toFixed(1)}%`}
          subtitle="round involvement"
        />
        <StatCard
          title="Weapon"
          value={weaponProfile.primary.toString()}
          subtitle={weaponProfile.label}
        />
        <StatCard
          title="Price"
          value={`$${player.price}`}
          subtitle="builder value"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Performance profile">
          <div className="grid gap-4">
            <Metric label="Impact" value={player.stats.impact} />
            <Metric label="Opening Duels" value={player.stats.opening} />
            <Metric label="Clutch" value={player.stats.clutch} />
            <Metric label="AWP Power" value={player.stats.awp} />
            <Metric label="Rifle Power" value={player.stats.rifle} />
            <Metric label="Consistency" value={player.stats.consistency} />
            <Metric label="Role Fit Score" value={roleFit} />
          </div>
        </Panel>

        <Panel title="Player read">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Role identity
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getRoleRead(player)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Roster builder usage
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getRosterBuilderAdvice(player, roleFit)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                Traits
              </p>
              <div className="flex flex-wrap gap-2">
                {player.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-200"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Strengths / weaknesses">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-black uppercase tracking-wider text-emerald-200">
                Strengths
              </p>
              <div className="mt-3 grid gap-2">
                {strengths.map((item) => (
                  <span key={item} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-emerald-50">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-black uppercase tracking-wider text-amber-200">
                Watch points
              </p>
              <div className="mt-3 grid gap-2">
                {weaknesses.map((item) => (
                  <span key={item} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-amber-50">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Weapon profile">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Primary identity
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weaponProfile.label}
                  </p>
                </div>
                <Score value={weaponProfile.primary} />
              </div>
            </div>

            <Metric label="AWP Power" value={player.stats.awp} />
            <Metric label="Rifle Power" value={player.stats.rifle} />
            <Metric label="Weapon Balance" value={weaponProfile.balance} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Best map fits">
          <div className="grid gap-3">
            {bestMapFits.map(({ map, score, reason }) => (
              <button
                key={map.id}
                onClick={() => navigate(`/maps/${map.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{map.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{reason}</div>
                  </div>
                  <Score value={score} />
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Team fit suggestions">
          <div className="grid gap-3">
            {teamFits.map(({ team, score, reason }) => (
              <button
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{reason}</div>
                  </div>
                  <Score value={score} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Similar players">
        <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">
          Similarity is calculated from role fit, Impact Index, rating, clutch,
          opening pressure, weapon profile, consistency and price. Current values
          are MVP demo scores, not official statistics.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {similarPlayers.map(({ player: similarPlayer, score, reasons }) => (
            <button
              key={similarPlayer.id}
              onClick={() => navigate(`/players/${similarPlayer.id}`)}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">{similarPlayer.nickname}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {similarPlayer.country} · {getTeamName(similarPlayer.teamId, teams)}
                  </p>
                </div>
                <Score value={score} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <RoleBadge role={similarPlayer.role} />
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                  Impact {getPlayerImpact(similarPlayer)}
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-slate-300"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function getRoleFitScore(player: CS2Player) {
  const ratingScore = ratingToScore(player.stats.rating);

  if (player.role === "AWPer") {
    return weightedScore([
      [player.stats.awp, 0.34],
      [player.stats.impact, 0.18],
      [ratingScore, 0.18],
      [player.stats.clutch, 0.14],
      [player.stats.consistency, 0.16],
    ]);
  }

  if (player.role === "Entry") {
    return weightedScore([
      [player.stats.opening, 0.34],
      [player.stats.impact, 0.24],
      [player.stats.rifle, 0.18],
      [ratingScore, 0.12],
      [player.stats.consistency, 0.12],
    ]);
  }

  if (player.role === "Star Rifler") {
    return weightedScore([
      [player.stats.rifle, 0.28],
      [player.stats.impact, 0.24],
      [ratingScore, 0.2],
      [player.stats.opening, 0.14],
      [player.stats.clutch, 0.14],
    ]);
  }

  if (player.role === "Lurker") {
    return weightedScore([
      [player.stats.clutch, 0.24],
      [player.stats.consistency, 0.22],
      [player.stats.rifle, 0.2],
      [ratingScore, 0.18],
      [player.stats.impact, 0.16],
    ]);
  }

  if (player.role === "Anchor") {
    return weightedScore([
      [player.stats.consistency, 0.3],
      [player.stats.clutch, 0.2],
      [player.stats.rifle, 0.18],
      [ratingScore, 0.16],
      [player.stats.impact, 0.16],
    ]);
  }

  if (player.role === "Support" || player.role === "IGL") {
    return weightedScore([
      [player.stats.consistency, 0.3],
      [player.stats.kast, 0.22],
      [player.stats.clutch, 0.18],
      [ratingScore, 0.14],
      [player.stats.impact, 0.16],
    ]);
  }

  return weightedScore([
    [player.stats.consistency, 0.24],
    [player.stats.rifle, 0.2],
    [player.stats.impact, 0.2],
    [player.stats.clutch, 0.18],
    [ratingScore, 0.18],
  ]);
}

function weightedScore(entries: Array<[number, number]>) {
  return Math.round(entries.reduce((sum, [value, weight]) => sum + value * weight, 0));
}

function ratingToScore(rating: number) {
  return Math.max(0, Math.min(100, Math.round(((rating - 0.85) / 0.45) * 100)));
}

function getPlayerWeaponProfile(player: CS2Player) {
  const primary = Math.max(player.stats.awp, player.stats.rifle);
  const secondary = Math.min(player.stats.awp, player.stats.rifle);
  const balance = Math.round(100 - Math.min(100, Math.abs(player.stats.awp - player.stats.rifle)));

  if (player.stats.awp >= 72 && player.stats.awp >= player.stats.rifle) {
    return {
      label: "AWP primary",
      primary,
      secondary,
      balance,
    };
  }

  if (player.stats.awp >= 42 && player.stats.rifle >= 70) {
    return {
      label: "Hybrid weapon profile",
      primary,
      secondary,
      balance,
    };
  }

  return {
    label: "Rifle primary",
    primary,
    secondary,
    balance,
  };
}

function getPlayerStrengths(player: CS2Player) {
  const entries = [
    ["High round impact", player.stats.impact],
    ["Strong opening pressure", player.stats.opening],
    ["Late-round clutch value", player.stats.clutch],
    ["Elite AWP profile", player.stats.awp],
    ["Rifle firepower", player.stats.rifle],
    ["Stable consistency", player.stats.consistency],
    ["Strong role fit", getRoleFitScore(player)],
  ] as const;

  return [...entries]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value]) => `${label}: ${Math.round(value)}/100`);
}

function getPlayerWeaknesses(player: CS2Player) {
  const watchPoints: string[] = [];

  if (player.role !== "AWPer" && player.stats.awp < 20) {
    watchPoints.push("Limited secondary AWP value");
  }

  if (player.role === "AWPer" && player.stats.rifle < 55) {
    watchPoints.push("Rifle output may be secondary");
  }

  if (player.stats.opening < 55 && (player.role === "Entry" || player.role === "Star Rifler")) {
    watchPoints.push("Opening pressure needs support");
  }

  if (player.stats.clutch < 65) {
    watchPoints.push("Late-round value is not the main strength");
  }

  if (player.stats.consistency < 72) {
    watchPoints.push("Consistency is the main volatility risk");
  }

  if (player.price >= 8) {
    watchPoints.push("Expensive roster-builder slot");
  }

  if (watchPoints.length === 0) {
    watchPoints.push("No major red flag in current MVP profile");
  }

  return watchPoints.slice(0, 3);
}

function getRosterBuilderAdvice(player: CS2Player, roleFit: number) {
  if (player.price >= 8 && roleFit >= 86) {
    return `${player.nickname} is a premium pick. Use him as a core piece and save budget with IGL/support roles around him.`;
  }

  if (player.role === "AWPer") {
    return `${player.nickname} should be treated as the primary AWP slot. Avoid pairing him with another expensive pure AWPer unless the roster has enough structure.`;
  }

  if (player.role === "Entry") {
    return `${player.nickname} gives the roster opening pressure. Pair him with a strong trader, a structured IGL and at least one stable anchor.`;
  }

  if (player.role === "IGL" || player.role === "Support") {
    return `${player.nickname} is useful when the roster already has star firepower and needs structure, utility discipline and role balance.`;
  }

  if (player.role === "Anchor") {
    return `${player.nickname} improves CT stability. He is a strong fit when the roster already has enough entry and AWP power.`;
  }

  return `${player.nickname} is a flexible roster-builder pick. Use him to complete role balance without sacrificing too much firepower.`;
}

function getBestMapFits(player: CS2Player, limit = 3) {
  return maps
    .map((map) => {
      const roleBonus = map.bestRoles.includes(player.role)
        ? 18
        : map.bestRoles.some((role) => getRoleFamily(role) === getRoleFamily(player.role))
          ? 10
          : 4;

      const score = Math.round(
        map.awpValue * (player.stats.awp / 100) * 0.24 +
          map.entryValue * (player.stats.opening / 100) * 0.2 +
          map.anchorPressure * (getStructureProfileScore(player) / 100) * 0.18 +
          map.ctSideStrength * (player.stats.consistency / 100) * 0.16 +
          map.tSideDifficulty * (player.stats.impact / 100) * 0.14 +
          roleBonus,
      );

      return {
        map,
        score: Math.max(0, Math.min(100, score)),
        reason: getMapFitReason(player, map),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getMapFitReason(player: CS2Player, map: CS2MapProfile) {
  if (map.bestRoles.includes(player.role)) {
    return `${player.role} is one of the best role fits for ${map.name}.`;
  }

  if (player.role === "AWPer" && map.awpValue >= 78) {
    return "High AWP value map with strong angle-control potential.";
  }

  if ((player.role === "Entry" || player.role === "Star Rifler") && map.entryValue >= 76) {
    return "Good map for pressure riflers and opening duels.";
  }

  if ((player.role === "Anchor" || player.role === "Support") && map.anchorPressure >= 76) {
    return "Good fit for stable site play and utility discipline.";
  }

  return `${map.identity}.`;
}

function getStructureProfileScore(player: CS2Player) {
  if (player.role === "IGL" || player.role === "Support" || player.role === "Anchor") {
    return Math.round(player.stats.consistency * 0.65 + player.stats.clutch * 0.35);
  }

  return Math.round(player.stats.consistency * 0.5 + player.stats.rifle * 0.3 + player.stats.clutch * 0.2);
}

function getTeamFitSuggestions(player: CS2Player, limit = 3) {
  return teams
    .map((team) => {
      const roster = players.filter((item) => team.players.includes(item.id));
      const sameRoleCount = roster.filter((item) => item.role === player.role).length;
      const currentTeamBonus = team.id === player.teamId ? 8 : 0;
      const roleNeedBonus = sameRoleCount === 0 ? 18 : sameRoleCount === 1 ? 8 : 1;
      const firepowerNeedBonus = team.scores.firepower < 82 && player.stats.impact >= 82 ? 10 : 0;
      const structureNeedBonus =
        team.scores.structure < 78 && (player.role === "IGL" || player.role === "Support" || player.role === "Anchor") ? 10 : 0;

      const score = Math.round(
        team.scores.form * 0.18 +
          team.scores.structure * 0.2 +
          team.scores.firepower * 0.18 +
          getRoleFitScore(player) * 0.22 +
          getPlayerImpact(player) * 0.12 +
          roleNeedBonus +
          firepowerNeedBonus +
          structureNeedBonus +
          currentTeamBonus,
      );

      return {
        team,
        score: Math.max(0, Math.min(100, score)),
        reason: getTeamFitReason(player, team, sameRoleCount),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getTeamFitReason(player: CS2Player, team: (typeof teams)[number], sameRoleCount: number) {
  if (team.id === player.teamId) {
    return "Current team context with existing role familiarity.";
  }

  if (sameRoleCount === 0) {
    return `Adds a missing ${player.role} profile to the roster.`;
  }

  if (team.scores.firepower < 82 && player.stats.impact >= 82) {
    return "Raises firepower and round impact.";
  }

  if (team.scores.structure < 78 && (player.role === "IGL" || player.role === "Support" || player.role === "Anchor")) {
    return "Improves structure and role discipline.";
  }

  return "Good statistical fit with the team's current profile.";
}

type SimilarPlayerResult = {
  player: CS2Player;
  score: number;
  reasons: string[];
};

function getSimilarPlayers(player: CS2Player, limit = 4): SimilarPlayerResult[] {
  return players
    .filter((candidate) => candidate.id !== player.id)
    .map((candidate) => ({
      player: candidate,
      score: getPlayerSimilarityScore(player, candidate),
      reasons: getSimilarityReasons(player, candidate),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getPlayerSimilarityScore(base: CS2Player, candidate: CS2Player) {
  const roleScore = base.role === candidate.role ? 100 : getRoleFamily(base.role) === getRoleFamily(candidate.role) ? 74 : 42;
  const impactScore = closeness(getPlayerImpact(base), getPlayerImpact(candidate), 24);
  const ratingScore = closeness(base.stats.rating * 100, candidate.stats.rating * 100, 18);
  const clutchScore = closeness(base.stats.clutch, candidate.stats.clutch, 28);
  const openingScore = closeness(base.stats.opening, candidate.stats.opening, 32);
  const weaponScore = closeness(getWeaponProfileScore(base), getWeaponProfileScore(candidate), 48);
  const consistencyScore = closeness(base.stats.consistency, candidate.stats.consistency, 28);
  const priceScore = closeness(base.price, candidate.price, 6);

  return Math.round(
    roleScore * 0.22 +
      impactScore * 0.18 +
      ratingScore * 0.12 +
      clutchScore * 0.11 +
      openingScore * 0.11 +
      weaponScore * 0.12 +
      consistencyScore * 0.08 +
      priceScore * 0.06,
  );
}

function closeness(left: number, right: number, maxDifference: number) {
  const difference = Math.abs(left - right);
  return Math.max(0, Math.round(100 - (difference / maxDifference) * 100));
}

function getWeaponProfileScore(player: CS2Player) {
  return player.stats.awp * 0.55 + player.stats.rifle * 0.45;
}

function getRoleFamily(role: PlayerRole) {
  if (role === "AWPer") return "awp";
  if (role === "Entry" || role === "Star Rifler") return "aggressive-rifle";
  if (role === "Lurker" || role === "Flex") return "space";
  if (role === "Anchor" || role === "Support" || role === "IGL") return "structure";
  return "other";
}

function getSimilarityReasons(base: CS2Player, candidate: CS2Player) {
  const reasons: string[] = [];

  if (base.role === candidate.role) {
    reasons.push(`Same role: ${candidate.role}`);
  } else if (getRoleFamily(base.role) === getRoleFamily(candidate.role)) {
    reasons.push("Similar role family");
  }

  if (Math.abs(getPlayerImpact(base) - getPlayerImpact(candidate)) <= 8) {
    reasons.push("Close impact level");
  }

  if (Math.abs(base.stats.opening - candidate.stats.opening) <= 10) {
    reasons.push("Similar opening pressure");
  }

  if (Math.abs(base.stats.clutch - candidate.stats.clutch) <= 10) {
    reasons.push("Comparable clutch value");
  }

  if (Math.abs(getWeaponProfileScore(base) - getWeaponProfileScore(candidate)) <= 12) {
    reasons.push("Similar weapon profile");
  }

  if (reasons.length < 3 && Math.abs(base.price - candidate.price) <= 2) {
    reasons.push("Similar roster price");
  }

  if (reasons.length < 3) {
    reasons.push("Comparable statistical shape");
  }

  return reasons.slice(0, 3);
}

function getPlayerSummary(player: CS2Player) {
  if (player.role === "AWPer") {
    return `${player.nickname} — AWP-игрок с высоким влиянием на раунд. Его ценность строится вокруг первого контакта, контроля углов и способности стабилизировать команду в поздних ситуациях.`;
  }

  if (player.role === "Entry") {
    return `${player.nickname} — aggressive entry, который создаёт пространство для команды. Такой игрок может умирать чаще, но его главная задача — ломать структуру защиты и открывать раунд.`;
  }

  if (player.role === "Star Rifler") {
    return `${player.nickname} — главный rifle-керри состава. Он должен стабильно давать урон, выигрывать дуэли и оставаться опасным как на T-side, так и на CT-side.`;
  }

  if (player.role === "Lurker") {
    return `${player.nickname} — lurker с фокусом на поздний раунд, тайминги и наказание ротаций. Его ценность не только во фрагах, но и в давлении на карту.`;
  }

  if (player.role === "Anchor") {
    return `${player.nickname} — anchor, который держит сайт, экономит ресурсы команды и снижает хаос в защите. Это не самая яркая роль, но она критична для структуры.`;
  }

  if (player.role === "Support") {
    return `${player.nickname} — support-игрок, который помогает звёздам раскрыться через utility, trade setup и дисциплину в командной структуре.`;
  }

  if (player.role === "IGL") {
    return `${player.nickname} — IGL. Его ценность не всегда видна в rating, потому что главная работа — структура, mid-round решения и управление темпом команды.`;
  }

  return `${player.nickname} — flex-игрок, который может закрывать несколько задач и адаптироваться под нужды состава.`;
}

function getRoleRead(player: CS2Player) {
  const bestWeaponProfile =
    player.stats.awp > player.stats.rifle ? "AWP" : "rifle";

  return `Основной профиль: ${player.role}. Сильнейшая сторона по данным MVP: ${bestWeaponProfile}. Clutch ${player.stats.clutch}/100, consistency ${player.stats.consistency}/100, opening pressure ${player.stats.opening}/100.`;
}

function TraitList({
  title,
  players,
  value,
}: {
  title: string;
  players: CS2Player[];
  value: (player: CS2Player) => number;
}) {
  return (
    <Panel title={title}>
      <div className="grid gap-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-black">
                {index + 1}
              </div>
              <div>
                <div className="font-black">{player.nickname}</div>
                <div className="text-sm text-slate-400">{player.role}</div>
              </div>
            </div>
            <Score value={Math.round(value(player))} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}

function MiniMetric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default App;
