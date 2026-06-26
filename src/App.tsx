import { useMemo, useState, type ReactNode } from "react";
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

type View =
  | "home"
  | "players"
  | "teams"
  | "compare"
  | "teamCompare"
  | "builder"
  | "traits"
  | "maps"
  | "player"
  | "team"
  | "map";

const views: { path: string; label: string; end?: boolean }[] = [
  { path: "/", label: "Overview", end: true },
  { path: "/players", label: "Players" },
  { path: "/teams", label: "Teams" },
  { path: "/maps", label: "Maps" },
  { path: "/compare", label: "Compare" },
  { path: "/team-compare", label: "Team Compare" },
  { path: "/roster-builder", label: "Roster Builder" },
  { path: "/traits", label: "Traits" },
];

const roles: Array<"All" | PlayerRole> = [
  "All",
  "AWPer",
  "Entry",
  "Star Rifler",
  "Lurker",
  "Anchor",
  "Support",
  "IGL",
  "Flex",
];

type CS2MapProfile = {
  id: string;
  name: string;
  identity: string;
  sideProfile: "CT-sided" | "T-sided" | "Balanced";
  tSideDifficulty: number;
  ctSideStrength: number;
  awpValue: number;
  entryValue: number;
  anchorPressure: number;
  bestRoles: PlayerRole[];
  summary: string;
};

const maps: CS2MapProfile[] = [
  {
    id: "mirage",
    name: "Mirage",
    identity: "default-heavy, mid-control, aim-duel map",
    sideProfile: "Balanced",
    tSideDifficulty: 66,
    ctSideStrength: 68,
    awpValue: 82,
    entryValue: 78,
    anchorPressure: 70,
    bestRoles: ["AWPer", "Entry", "Star Rifler"],
    summary:
      "Mirage rewards mid control, AWP presence and strong trading. It is the easiest map to understand visually, but elite teams separate themselves through timings, connector control and late-round discipline.",
  },
  {
    id: "nuke",
    name: "Nuke",
    identity: "rotation-heavy, vertical, CT-structure map",
    sideProfile: "CT-sided",
    tSideDifficulty: 84,
    ctSideStrength: 90,
    awpValue: 74,
    entryValue: 72,
    anchorPressure: 91,
    bestRoles: ["Anchor", "IGL", "AWPer"],
    summary:
      "Nuke is built around rotations, information denial and layered CT setups. Teams need structure, disciplined anchors and confident ramp/outside protocols.",
  },
  {
    id: "inferno",
    name: "Inferno",
    identity: "utility-heavy, banana-control, late-round map",
    sideProfile: "Balanced",
    tSideDifficulty: 78,
    ctSideStrength: 80,
    awpValue: 68,
    entryValue: 75,
    anchorPressure: 88,
    bestRoles: ["Support", "Anchor", "IGL"],
    summary:
      "Inferno is utility economy, banana control and late-round spacing. It punishes impatient entries and rewards support players who create clean executes.",
  },
  {
    id: "ancient",
    name: "Ancient",
    identity: "mid pressure, fast trades, compact rotations",
    sideProfile: "CT-sided",
    tSideDifficulty: 80,
    ctSideStrength: 86,
    awpValue: 76,
    entryValue: 83,
    anchorPressure: 84,
    bestRoles: ["Entry", "Anchor", "Star Rifler"],
    summary:
      "Ancient emphasizes mid pressure, cave control and fast trading. Teams with explosive riflers can create strong T-side pressure despite CT-favored zones.",
  },
  {
    id: "anubis",
    name: "Anubis",
    identity: "T-pressure, canal fights, retake-heavy sites",
    sideProfile: "T-sided",
    tSideDifficulty: 58,
    ctSideStrength: 64,
    awpValue: 70,
    entryValue: 86,
    anchorPressure: 82,
    bestRoles: ["Entry", "Star Rifler", "Support"],
    summary:
      "Anubis gives attackers many pressure points and rewards proactive entries. CT sides need retake structure, strong utility and anchors who survive first contact.",
  },
  {
    id: "dust2",
    name: "Dust2",
    identity: "long-range duels, AWP control, simple spacing",
    sideProfile: "Balanced",
    tSideDifficulty: 63,
    ctSideStrength: 67,
    awpValue: 91,
    entryValue: 82,
    anchorPressure: 72,
    bestRoles: ["AWPer", "Entry", "Star Rifler"],
    summary:
      "Dust2 is the classic duel map. AWP control, long fights and clean trading matter more than complex macro layers.",
  },
  {
    id: "train",
    name: "Train",
    identity: "long angles, utility layering, site anchors",
    sideProfile: "CT-sided",
    tSideDifficulty: 86,
    ctSideStrength: 88,
    awpValue: 88,
    entryValue: 70,
    anchorPressure: 90,
    bestRoles: ["AWPer", "Anchor", "IGL"],
    summary:
      "Train rewards long-angle discipline, strong AWP protocols and precise utility. T sides need patience and well-timed site splits.",
  },
];

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen px-5 py-6 text-slate-100 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Header />

          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/players" element={<PlayersRoute />} />
            <Route path="/players/:playerId" element={<PlayerRoute />} />
            <Route path="/teams" element={<TeamsRoute />} />
            <Route path="/teams/:teamId" element={<TeamRoute />} />
            <Route path="/maps" element={<MapsRoute />} />
            <Route path="/maps/:mapId" element={<MapRoute />} />
            <Route path="/compare" element={<CompareView />} />
            <Route path="/team-compare" element={<TeamCompareView />} />
            <Route path="/roster-builder" element={<RosterBuilderView />} />
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

function HomeRoute() {
  const navigate = useNavigate();

  function setView(view: View) {
    navigate(getPathForView(view));
  }

  return (
    <HomeView
      setView={setView}
      onPlayerClick={(playerId) => navigate(`/players/${playerId}`)}
    />
  );
}

function PlayersRoute() {
  const navigate = useNavigate();

  return <PlayersView onPlayerClick={(playerId) => navigate(`/players/${playerId}`)} />;
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

function getPathForView(view: View) {
  const paths: Record<View, string> = {
    home: "/",
    players: "/players",
    teams: "/teams",
    maps: "/maps",
    compare: "/compare",
    teamCompare: "/team-compare",
    builder: "/roster-builder",
    traits: "/traits",
    player: "/players",
    team: "/teams",
    map: "/maps",
  };

  return paths[view];
}

function HomeView({
  setView,
  onPlayerClick,
}: {
  setView: (view: View) => void;
  onPlayerClick: (playerId: string) => void;
}) {
  const topPlayers = [...players]
    .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
    .slice(0, 4);

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Product MVP
        </p>
        <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
          Собери CS2-команду, сравни игроков и найди сильные роли.
        </h2>
        <p className="mt-4 max-w-3xl text-slate-300">
          Это первый каркас сайта. Мы не копируем HLTV и не используем чужие
          рейтинги. Здесь будут собственные индексы: Impact, Role Fit, Roster
          Balance и Clutch Value.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setView("builder")}
            className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200"
          >
            Собрать ростер
          </button>
          <button
            onClick={() => setView("players")}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
          >
            Смотреть игроков
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Players" value={players.length.toString()} subtitle="demo database" />
        <StatCard title="Teams" value={teams.length.toString()} subtitle="demo teams" />
        <StatCard title="Roles" value="8" subtitle="role model" />
        <StatCard title="Budget" value="$25" subtitle="builder limit" />
      </div>

      <Panel title="Top impact players">
        <div className="grid gap-4 md:grid-cols-4">
          {topPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => onPlayerClick(player.id)}
            />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function PlayersView({
  onPlayerClick,
}: {
  onPlayerClick: (playerId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState<"All" | PlayerRole>("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"impact" | "rating" | "adr" | "clutch" | "price">("impact");

  const countryOptions = useMemo(() => {
    return [...new Set(players.map((player) => player.country))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, []);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        const teamName = getTeamName(player.teamId, teams);
        const matchesSearch =
          normalizedQuery.length === 0 ||
          player.nickname.toLowerCase().includes(normalizedQuery) ||
          player.country.toLowerCase().includes(normalizedQuery) ||
          player.role.toLowerCase().includes(normalizedQuery) ||
          teamName.toLowerCase().includes(normalizedQuery);

        const matchesRole = role === "All" || player.role === role;
        const matchesTeam = teamFilter === "All" || player.teamId === teamFilter;
        const matchesCountry =
          countryFilter === "All" || player.country === countryFilter;

        return matchesSearch && matchesRole && matchesTeam && matchesCountry;
      })
      .sort((a, b) => {
        if (sortBy === "impact") return getPlayerImpact(b) - getPlayerImpact(a);
        if (sortBy === "rating") return b.stats.rating - a.stats.rating;
        if (sortBy === "adr") return b.stats.adr - a.stats.adr;
        if (sortBy === "price") return b.price - a.price;
        return b.stats.clutch - a.stats.clutch;
      });
  }, [searchQuery, role, teamFilter, countryFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    role !== "All" ||
    teamFilter !== "All" ||
    countryFilter !== "All" ||
    sortBy !== "impact";

  function resetFilters() {
    setSearchQuery("");
    setRole("All");
    setTeamFilter("All");
    setCountryFilter("All");
    setSortBy("impact");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Players"
          description="Каталог игроков с поиском, фильтрами по роли, команде и стране. Клик по строке открывает профиль игрока."
        />

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Found
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {filteredPlayers.length}/{players.length}
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="donk, ZywOo, NAVI, AWPer..."
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Team</span>
            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="All">All teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Country</span>
            <select
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="All">All countries</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="impact">Impact</option>
              <option value="rating">Rating</option>
              <option value="adr">ADR</option>
              <option value="clutch">Clutch</option>
              <option value="price">Price</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((item) => (
            <button
              key={item}
              onClick={() => setRole(item)}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${
                role === item
                  ? "bg-cyan-300 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.04]">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-4">Player</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Rating</th>
              <th className="px-4 py-4">ADR</th>
              <th className="px-4 py-4">K/D</th>
              <th className="px-4 py-4">KAST</th>
              <th className="px-4 py-4">Impact</th>
              <th className="px-4 py-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  onClick={() => onPlayerClick(player.id)}
                  className="cursor-pointer border-t border-white/10 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{player.nickname}</div>
                    <div className="text-xs text-slate-500">
                      {player.country}, {player.age}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {getTeamName(player.teamId, teams)}
                  </td>
                  <td className="px-4 py-4">
                    <RoleBadge role={player.role} />
                  </td>
                  <td className="px-4 py-4 font-semibold">{player.stats.rating.toFixed(2)}</td>
                  <td className="px-4 py-4">{player.stats.adr.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.stats.kd.toFixed(2)}</td>
                  <td className="px-4 py-4">{player.stats.kast.toFixed(1)}%</td>
                  <td className="px-4 py-4">
                    <Score value={getPlayerImpact(player)} />
                  </td>
                  <td className="px-4 py-4 font-bold text-cyan-300">${player.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="border-t border-white/10 px-4 py-10 text-center text-slate-500">
                  Ничего не найдено. Сбрось фильтры или измени запрос.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
            <button
              key={team.id}
              onClick={() => onTeamClick(team.id)}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black">{team.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{team.region}</p>
                </div>
                <Score value={team.scores.form} />
              </div>

              <div className="mt-5 grid gap-3">
                <Metric label="Firepower" value={team.scores.firepower} />
                <Metric label="Structure" value={team.scores.structure} />
                <Metric label="Map Pool" value={team.scores.mapPool} />
                <Metric label="Clutch" value={team.scores.clutch} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Players
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teamPlayers.length > 0 ? (
                    teamPlayers.map((player) => (
                      <span
                        key={player.id}
                        className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300"
                      >
                        {player.nickname}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No demo players</span>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best maps
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {team.bestMaps.map((map) => (
                    <span
                      key={map}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200"
                    >
                      {map}
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  const impact = getPlayerImpact(player);
  const teamName = getTeamName(player.teamId, teams);

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
              Player Profile
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
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">
              {getPlayerSummary(player)}
            </p>
          </div>

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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
          </div>
        </Panel>

        <Panel title="Traits">
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

          <div className="mt-5 rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Role read
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getRoleRead(player)}
            </p>
          </div>
        </Panel>
      </div>
    </section>
  );
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

function PlayerCard({
  player,
  onClick,
}: {
  player: CS2Player;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-black">{player.nickname}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {player.country} · {player.age}
          </p>
        </div>
        <Score value={getPlayerImpact(player)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={player.role} />
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
          ${player.price}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <Metric label="Rating" value={Math.round(player.stats.rating * 100)} />
        <Metric label="ADR" value={Math.round(player.stats.adr)} />
        <Metric label="Clutch" value={player.stats.clutch} />
      </div>
    </button>
  );
}

function PlayerProfile({ player }: { player: CS2Player }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-3xl font-black">{player.nickname}</h3>
          <p className="mt-1 text-slate-400">
            {player.country} · {getTeamName(player.teamId, teams)}
          </p>
        </div>
        <Score value={getPlayerImpact(player)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={player.role} />
        {player.traits.map((trait) => (
          <span key={trait} className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
            {trait}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <Metric label="Impact" value={getPlayerImpact(player)} />
        <Metric label="Opening" value={player.stats.opening} />
        <Metric label="Clutch" value={player.stats.clutch} />
        <Metric label="AWP" value={player.stats.awp} />
        <Metric label="Rifle" value={player.stats.rifle} />
      </div>
    </article>
  );
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="mb-4 text-xl font-black">{title}</h3>
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  danger = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        danger
          ? "border-red-400/30 bg-red-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className={`mt-2 text-3xl font-black ${danger ? "text-red-300" : "text-white"}`}>
        {value}
      </div>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: PlayerRole }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
      {role}
    </span>
  );
}

function Score({ value }: { value: number }) {
  return (
    <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-cyan-300 px-3 text-sm font-black text-slate-950">
      {value}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-300" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
      {text}
    </div>
  );
}

export default App;
