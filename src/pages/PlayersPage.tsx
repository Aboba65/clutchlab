import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player, PlayerRole } from "../types";
import { getPlayerImpact, getTeamName } from "../lib";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";

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

type SortKey =
  | "impact"
  | "rating"
  | "adr"
  | "kd"
  | "kast"
  | "clutch"
  | "opening"
  | "awp"
  | "rifle"
  | "consistency"
  | "price"
  | "age";

type SortDirection = "desc" | "asc";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "impact", label: "ClutchLab Impact" },
  { value: "rating", label: "Rating" },
  { value: "adr", label: "ADR" },
  { value: "kd", label: "K/D" },
  { value: "kast", label: "KAST" },
  { value: "clutch", label: "Clutch" },
  { value: "opening", label: "Opening" },
  { value: "awp", label: "AWP" },
  { value: "rifle", label: "Rifle" },
  { value: "consistency", label: "Consistency" },
  { value: "price", label: "Price" },
  { value: "age", label: "Age" },
];

const impactThresholds = [
  { value: "All", label: "Any impact" },
  { value: "60", label: "60+" },
  { value: "70", label: "70+" },
  { value: "80", label: "80+" },
  { value: "90", label: "90+" },
] as const;

const priceCaps = [
  { value: "All", label: "Any price" },
  { value: "5", label: "$5 or less" },
  { value: "6", label: "$6 or less" },
  { value: "7", label: "$7 or less" },
  { value: "8", label: "$8 or less" },
] as const;

function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}

function getSortValue(player: CS2Player, sortBy: SortKey) {
  if (sortBy === "impact") return getPlayerImpact(player);
  if (sortBy === "rating") return player.stats.rating;
  if (sortBy === "adr") return player.stats.adr;
  if (sortBy === "kd") return player.stats.kd;
  if (sortBy === "kast") return player.stats.kast;
  if (sortBy === "clutch") return player.stats.clutch;
  if (sortBy === "opening") return player.stats.opening;
  if (sortBy === "awp") return player.stats.awp;
  if (sortBy === "rifle") return player.stats.rifle;
  if (sortBy === "consistency") return player.stats.consistency;
  if (sortBy === "price") return player.price;
  return player.age;
}

function formatSortValue(player: CS2Player, sortBy: SortKey) {
  const value = getSortValue(player, sortBy);

  if (sortBy === "rating" || sortBy === "kd") return value.toFixed(2);
  if (sortBy === "adr" || sortBy === "kast") return value.toFixed(1);
  if (sortBy === "price") return `$${value}`;

  return Math.round(value).toString();
}

function getAverageImpact(items: CS2Player[]) {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, player) => sum + getPlayerImpact(player), 0);
  return Math.round(total / items.length);
}

function getAveragePrice(items: CS2Player[]) {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, player) => sum + player.price, 0);
  return Number((total / items.length).toFixed(1));
}

export function PlayersPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState<"All" | PlayerRole>("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [minImpact, setMinImpact] = useState("All");
  const [maxPrice, setMaxPrice] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("impact");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const teamOptions = useMemo(() => {
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

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
        const impact = getPlayerImpact(player);

        const matchesSearch =
          normalizedQuery.length === 0 ||
          player.nickname.toLowerCase().includes(normalizedQuery) ||
          player.country.toLowerCase().includes(normalizedQuery) ||
          player.role.toLowerCase().includes(normalizedQuery) ||
          teamName.toLowerCase().includes(normalizedQuery) ||
          player.traits.some((trait) => trait.toLowerCase().includes(normalizedQuery));

        const matchesRole = role === "All" || player.role === role;
        const matchesTeam = teamFilter === "All" || player.teamId === teamFilter;
        const matchesCountry =
          countryFilter === "All" || player.country === countryFilter;
        const matchesImpact = minImpact === "All" || impact >= Number(minImpact);
        const matchesPrice = maxPrice === "All" || player.price <= Number(maxPrice);

        return (
          matchesSearch &&
          matchesRole &&
          matchesTeam &&
          matchesCountry &&
          matchesImpact &&
          matchesPrice
        );
      })
      .sort((a, b) => {
        const aValue = getSortValue(a, sortBy);
        const bValue = getSortValue(b, sortBy);
        const directionMultiplier = sortDirection === "desc" ? -1 : 1;

        if (aValue !== bValue) {
          return (aValue - bValue) * directionMultiplier;
        }

        return a.nickname.localeCompare(b.nickname);
      });
  }, [
    searchQuery,
    role,
    teamFilter,
    countryFilter,
    minImpact,
    maxPrice,
    sortBy,
    sortDirection,
  ]);

  const activeTeamCount = useMemo(() => {
    return new Set(filteredPlayers.map((player) => player.teamId)).size;
  }, [filteredPlayers]);

  const activeCountryCount = useMemo(() => {
    return new Set(filteredPlayers.map((player) => player.country)).size;
  }, [filteredPlayers]);

  const averageImpact = useMemo(
    () => getAverageImpact(filteredPlayers),
    [filteredPlayers],
  );
  const averagePrice = useMemo(() => getAveragePrice(filteredPlayers), [filteredPlayers]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    role !== "All" ||
    teamFilter !== "All" ||
    countryFilter !== "All" ||
    minImpact !== "All" ||
    maxPrice !== "All" ||
    sortBy !== "impact" ||
    sortDirection !== "desc";

  function resetFilters() {
    setSearchQuery("");
    setRole("All");
    setTeamFilter("All");
    setCountryFilter("All");
    setMinImpact("All");
    setMaxPrice("All");
    setSortBy("impact");
    setSortDirection("desc");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Players"
          description="Каталог игроков с расширенными фильтрами, сортировкой по ключевым метрикам и быстрым поиском по никнейму, роли, команде, стране и traits."
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

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Impact
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">{averageImpact}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Price
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">${averagePrice}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Teams
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">{activeTeamCount}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Countries
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-200">{activeCountryCount}</p>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr_1fr_0.8fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="donk, ZywOo, NAVI, AWPer, Clutch..."
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
              {teamOptions.map((team) => (
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
            <span className="text-sm font-semibold text-slate-400">Impact</span>
            <select
              value={minImpact}
              onChange={(event) => setMinImpact(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {impactThresholds.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Price cap</span>
            <select
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {priceCaps.map((item) => (
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

        {hasActiveFilters ? (
          <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-3 text-sm text-slate-300">
            Active view: {filteredPlayers.length} players sorted by{" "}
            <span className="font-bold text-cyan-200">
              {sortOptions.find((item) => item.value === sortBy)?.label}
            </span>{" "}
            ({sortDirection === "desc" ? "high to low" : "low to high"}).
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.04]">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">Player</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Rating</th>
              <th className="px-4 py-4">ADR</th>
              <th className="px-4 py-4">K/D</th>
              <th className="px-4 py-4">KAST</th>
              <th className="px-4 py-4">Impact</th>
              <th className="px-4 py-4">Sort Value</th>
              <th className="px-4 py-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  onClick={() => navigate(`/players/${player.id}`)}
                  className="cursor-pointer border-t border-white/10 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4 text-slate-500">{index + 1}</td>
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
                  <td className="px-4 py-4 font-semibold">
                    {player.stats.rating.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">{player.stats.adr.toFixed(1)}</td>
                  <td className="px-4 py-4">{player.stats.kd.toFixed(2)}</td>
                  <td className="px-4 py-4">{player.stats.kast.toFixed(1)}%</td>
                  <td className="px-4 py-4">
                    <Score value={getPlayerImpact(player)} />
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-200">
                    {formatSortValue(player, sortBy)}
                  </td>
                  <td className="px-4 py-4 font-bold text-cyan-300">${player.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="border-t border-white/10 px-4 py-10 text-center text-slate-500"
                >
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
