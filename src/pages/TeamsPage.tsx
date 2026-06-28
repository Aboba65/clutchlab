import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Team } from "../types";
import { Metric } from "../components/Metric";
import { Score } from "../components/Score";

type SortKey =
  | "overall"
  | "firepower"
  | "structure"
  | "mapPool"
  | "clutch"
  | "form"
  | "players";

type SortDirection = "desc" | "asc";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "overall", label: "Overall" },
  { value: "firepower", label: "Firepower" },
  { value: "structure", label: "Structure" },
  { value: "mapPool", label: "Map Pool" },
  { value: "clutch", label: "Clutch" },
  { value: "form", label: "Form" },
  { value: "players", label: "Demo players" },
];

const scoreThresholds = [
  { value: "All", label: "Any score" },
  { value: "60", label: "60+" },
  { value: "70", label: "70+" },
  { value: "80", label: "80+" },
  { value: "90", label: "90+" },
] as const;

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

function getTeamScore(team: CS2Team) {
  return Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );
}

function getTeamPlayers(team: CS2Team) {
  return players.filter((player) => team.players.includes(player.id));
}

function getSortValue(team: CS2Team, sortBy: SortKey) {
  if (sortBy === "overall") return getTeamScore(team);
  if (sortBy === "players") return getTeamPlayers(team).length;

  return team.scores[sortBy];
}

function formatSortValue(team: CS2Team, sortBy: SortKey) {
  const value = getSortValue(team, sortBy);

  if (sortBy === "players") return `${value} players`;

  return Math.round(value).toString();
}

function getAverageScore(items: CS2Team[]) {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, team) => sum + getTeamScore(team), 0);
  return Math.round(total / items.length);
}

function getAverageMapPool(items: CS2Team[]) {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, team) => sum + team.scores.mapPool, 0);
  return Math.round(total / items.length);
}

function getBestArea(team: CS2Team) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}

export function TeamsPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [mapFilter, setMapFilter] = useState("All");
  const [minScore, setMinScore] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("overall");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const regionOptions = useMemo(() => {
    return [...new Set(teams.map((team) => team.region))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, []);

  const mapOptions = useMemo(() => {
    return [...new Set(teams.flatMap((team) => team.bestMaps))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, []);

  const filteredTeams = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return teams
      .filter((team) => {
        const teamPlayers = getTeamPlayers(team);
        const teamScore = getTeamScore(team);

        const matchesSearch =
          normalizedQuery.length === 0 ||
          team.name.toLowerCase().includes(normalizedQuery) ||
          team.region.toLowerCase().includes(normalizedQuery) ||
          team.bestMaps.some((map) => map.toLowerCase().includes(normalizedQuery)) ||
          teamPlayers.some((player) =>
            player.nickname.toLowerCase().includes(normalizedQuery),
          );

        const matchesRegion =
          regionFilter === "All" || team.region === regionFilter;
        const matchesMap = mapFilter === "All" || team.bestMaps.includes(mapFilter);
        const matchesScore = minScore === "All" || teamScore >= Number(minScore);

        return matchesSearch && matchesRegion && matchesMap && matchesScore;
      })
      .sort((a, b) => {
        const aValue = getSortValue(a, sortBy);
        const bValue = getSortValue(b, sortBy);
        const directionMultiplier = sortDirection === "desc" ? -1 : 1;

        if (aValue !== bValue) {
          return (aValue - bValue) * directionMultiplier;
        }

        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, regionFilter, mapFilter, minScore, sortBy, sortDirection]);

  const averageScore = useMemo(() => getAverageScore(filteredTeams), [filteredTeams]);
  const averageMapPool = useMemo(
    () => getAverageMapPool(filteredTeams),
    [filteredTeams],
  );

  const activeRegionCount = useMemo(() => {
    return new Set(filteredTeams.map((team) => team.region)).size;
  }, [filteredTeams]);

  const activePlayerCount = useMemo(() => {
    return filteredTeams.reduce((sum, team) => sum + getTeamPlayers(team).length, 0);
  }, [filteredTeams]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    regionFilter !== "All" ||
    mapFilter !== "All" ||
    minScore !== "All" ||
    sortBy !== "overall" ||
    sortDirection !== "desc";

  function resetFilters() {
    setSearchQuery("");
    setRegionFilter("All");
    setMapFilter("All");
    setMinScore("All");
    setSortBy("overall");
    setSortDirection("desc");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Teams"
          description="Команды с фильтрами по региону, карте, score threshold и сортировкой по firepower, structure, map pool, clutch и форме."
        />

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Found
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {filteredTeams.length}/{teams.length}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Overall
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {averageScore}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Map Pool
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {averageMapPool}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Regions
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {activeRegionCount}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Demo Players
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {activePlayerCount}
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_0.9fr_1fr_0.8fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Vitality, NAVI, Europe, Mirage, donk..."
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Region</span>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="All">All regions</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Best map</span>
            <select
              value={mapFilter}
              onChange={(event) => setMapFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="All">All maps</option>
              {mapOptions.map((map) => (
                <option key={map} value={map}>
                  {map}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Score</span>
            <select
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {scoreThresholds.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {sortOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Direction</span>
            <select
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value as SortDirection)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="desc">High to low</option>
              <option value="asc">Low to high</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 xl:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-3 text-sm text-slate-300">
            Active view: {filteredTeams.length} teams sorted by{" "}
            <span className="font-bold text-cyan-200">
              {sortOptions.find((item) => item.value === sortBy)?.label}
            </span>{" "}
            ({sortDirection === "desc" ? "high to low" : "low to high"}).
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team, index) => {
            const teamPlayers = getTeamPlayers(team);

            return (
              <button
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      #{index + 1} · {team.region}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{team.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Best area: {getBestArea(team)}
                    </p>
                  </div>

                  <Score value={getTeamScore(team)} />
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Current sort value
                  </p>
                  <p className="mt-1 text-xl font-black text-cyan-200">
                    {formatSortValue(team, sortBy)}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <Metric label="Firepower" value={team.scores.firepower} />
                  <Metric label="Structure" value={team.scores.structure} />
                  <Metric label="Map Pool" value={team.scores.mapPool} />
                  <Metric label="Clutch" value={team.scores.clutch} />
                  <Metric label="Form" value={team.scores.form} />
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
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-slate-500 md:col-span-2 xl:col-span-3">
            Ничего не найдено. Сбрось фильтры или измени запрос.
          </div>
        )}
      </div>
    </section>
  );
}
