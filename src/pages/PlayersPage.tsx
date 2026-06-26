import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { PlayerRole } from "../types";
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

export function PlayersPage() {
  const navigate = useNavigate();

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
                  onClick={() => navigate(`/players/${player.id}`)}
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
