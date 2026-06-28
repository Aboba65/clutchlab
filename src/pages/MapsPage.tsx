import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player, PlayerRole } from "../types";
import { maps, type CS2MapProfile } from "../config/maps";
import { Metric } from "../components/Metric";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";

type SortKey =
  | "overall"
  | "tSideDifficulty"
  | "ctSideStrength"
  | "awpValue"
  | "entryValue"
  | "anchorPressure"
  | "bestTeams"
  | "bestPlayers";

type SortDirection = "desc" | "asc";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "overall", label: "Map Intensity" },
  { value: "tSideDifficulty", label: "T Difficulty" },
  { value: "ctSideStrength", label: "CT Strength" },
  { value: "awpValue", label: "AWP Value" },
  { value: "entryValue", label: "Entry Value" },
  { value: "anchorPressure", label: "Anchor Pressure" },
  { value: "bestTeams", label: "Tagged Teams" },
  { value: "bestPlayers", label: "Best Player Fit" },
];

const sideProfiles: Array<"All" | CS2MapProfile["sideProfile"]> = [
  "All",
  "Balanced",
  "CT-sided",
  "T-sided",
];

const scoreThresholds = [
  { value: "All", label: "Any intensity" },
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

function getMapScore(map: CS2MapProfile) {
  return Math.round(
    map.ctSideStrength * 0.25 +
      map.tSideDifficulty * 0.2 +
      map.awpValue * 0.2 +
      map.entryValue * 0.2 +
      map.anchorPressure * 0.15,
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

function getSortValue(map: CS2MapProfile, sortBy: SortKey) {
  if (sortBy === "overall") return getMapScore(map);
  if (sortBy === "bestTeams") return getBestTeamsForMap(map).length;
  if (sortBy === "bestPlayers") {
    return getMapPlayerScore(getBestPlayersForMap(map)[0], map);
  }

  return map[sortBy];
}

function formatSortValue(map: CS2MapProfile, sortBy: SortKey) {
  const value = getSortValue(map, sortBy);

  if (sortBy === "bestTeams") return `${value} teams`;
  if (sortBy === "bestPlayers") return `${value} fit`;

  return Math.round(value).toString();
}

function getAverageMapScore(items: CS2MapProfile[]) {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, map) => sum + getMapScore(map), 0);
  return Math.round(total / items.length);
}

function getAverageStat(
  items: CS2MapProfile[],
  field: "tSideDifficulty" | "ctSideStrength" | "awpValue" | "entryValue",
) {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, map) => sum + map[field], 0);
  return Math.round(total / items.length);
}

export function MapsPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [sideProfileFilter, setSideProfileFilter] =
    useState<"All" | CS2MapProfile["sideProfile"]>("All");
  const [bestRoleFilter, setBestRoleFilter] = useState<"All" | PlayerRole>("All");
  const [minIntensity, setMinIntensity] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("overall");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const roleOptions = useMemo(() => {
    return [...new Set(maps.flatMap((map) => map.bestRoles))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, []);

  const filteredMaps = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return maps
      .filter((map) => {
        const bestTeams = getBestTeamsForMap(map);
        const bestPlayers = getBestPlayersForMap(map).slice(0, 5);
        const intensity = getMapScore(map);

        const matchesSearch =
          normalizedQuery.length === 0 ||
          map.name.toLowerCase().includes(normalizedQuery) ||
          map.identity.toLowerCase().includes(normalizedQuery) ||
          map.summary.toLowerCase().includes(normalizedQuery) ||
          map.sideProfile.toLowerCase().includes(normalizedQuery) ||
          map.bestRoles.some((role) => role.toLowerCase().includes(normalizedQuery)) ||
          bestTeams.some((team) => team.name.toLowerCase().includes(normalizedQuery)) ||
          bestPlayers.some((player) =>
            player.nickname.toLowerCase().includes(normalizedQuery),
          );

        const matchesSideProfile =
          sideProfileFilter === "All" || map.sideProfile === sideProfileFilter;
        const matchesBestRole =
          bestRoleFilter === "All" || map.bestRoles.includes(bestRoleFilter);
        const matchesIntensity =
          minIntensity === "All" || intensity >= Number(minIntensity);

        return (
          matchesSearch &&
          matchesSideProfile &&
          matchesBestRole &&
          matchesIntensity
        );
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
  }, [searchQuery, sideProfileFilter, bestRoleFilter, minIntensity, sortBy, sortDirection]);

  const averageIntensity = useMemo(
    () => getAverageMapScore(filteredMaps),
    [filteredMaps],
  );
  const averageTDifficulty = useMemo(
    () => getAverageStat(filteredMaps, "tSideDifficulty"),
    [filteredMaps],
  );
  const averageAwpValue = useMemo(
    () => getAverageStat(filteredMaps, "awpValue"),
    [filteredMaps],
  );
  const averageEntryValue = useMemo(
    () => getAverageStat(filteredMaps, "entryValue"),
    [filteredMaps],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    sideProfileFilter !== "All" ||
    bestRoleFilter !== "All" ||
    minIntensity !== "All" ||
    sortBy !== "overall" ||
    sortDirection !== "desc";

  function resetFilters() {
    setSearchQuery("");
    setSideProfileFilter("All");
    setBestRoleFilter("All");
    setMinIntensity("All");
    setSortBy("overall");
    setSortDirection("desc");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Maps"
          description="Карта как аналитический профиль: side profile, сложность T-side, сила CT-side, ценность AWP, entry и anchor-ролей."
        />

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Found
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {filteredMaps.length}/{maps.length}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Intensity
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {averageIntensity}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg T Difficulty
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {averageTDifficulty}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg AWP Value
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {averageAwpValue}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Entry Value
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">
            {averageEntryValue}
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
              placeholder="Mirage, CT-sided, AWPer, Vitality, ZywOo..."
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Side profile</span>
            <select
              value={sideProfileFilter}
              onChange={(event) =>
                setSideProfileFilter(
                  event.target.value as "All" | CS2MapProfile["sideProfile"],
                )
              }
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {sideProfiles.map((profile) => (
                <option key={profile} value={profile}>
                  {profile === "All" ? "All profiles" : profile}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Best role</span>
            <select
              value={bestRoleFilter}
              onChange={(event) =>
                setBestRoleFilter(event.target.value as "All" | PlayerRole)
              }
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="All">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Intensity</span>
            <select
              value={minIntensity}
              onChange={(event) => setMinIntensity(event.target.value)}
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
            Active view: {filteredMaps.length} maps sorted by{" "}
            <span className="font-bold text-cyan-200">
              {sortOptions.find((item) => item.value === sortBy)?.label}
            </span>{" "}
            ({sortDirection === "desc" ? "high to low" : "low to high"}).
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMaps.length > 0 ? (
          filteredMaps.map((map, index) => {
            const bestTeams = getBestTeamsForMap(map).slice(0, 3);
            const bestPlayers = getBestPlayersForMap(map).slice(0, 3);

            return (
              <button
                key={map.id}
                onClick={() => navigate(`/maps/${map.id}`)}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      #{index + 1} · {map.sideProfile}
                    </p>
                    <h3 className="mt-2 text-3xl font-black">{map.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{map.identity}</p>
                  </div>

                  <Score value={getMapScore(map)} />
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Current sort value
                  </p>
                  <p className="mt-1 text-xl font-black text-cyan-200">
                    {formatSortValue(map, sortBy)}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <Metric label="T-side difficulty" value={map.tSideDifficulty} />
                  <Metric label="CT-side strength" value={map.ctSideStrength} />
                  <Metric label="AWP value" value={map.awpValue} />
                  <Metric label="Entry value" value={map.entryValue} />
                  <Metric label="Anchor pressure" value={map.anchorPressure} />
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Best roles
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {map.bestRoles.map((role) => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </div>
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
