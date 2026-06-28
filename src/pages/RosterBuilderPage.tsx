import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player, PlayerRole } from "../types";
import { maps, type CS2MapProfile } from "../config/maps";
import { getPlayerImpact, getRosterScore, getRosterWarnings, getTeamName } from "../lib";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { RoleBadge } from "../components/RoleBadge";
import { Metric } from "../components/Metric";
import { Warning } from "../components/Warning";
import { Score } from "../components/Score";

const ROSTER_BUDGET = 25;
const ROSTER_SIZE = 5;

const roleOptions: Array<"All" | PlayerRole> = [
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

const coreRoles: PlayerRole[] = ["AWPer", "Entry", "Star Rifler", "IGL", "Support"];

type SortKey =
  | "fit"
  | "impact"
  | "rating"
  | "price"
  | "value"
  | "opening"
  | "awp"
  | "rifle"
  | "clutch"
  | "consistency";

type SortDirection = "desc" | "asc";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "fit", label: "Builder Fit" },
  { value: "impact", label: "Impact" },
  { value: "rating", label: "Rating" },
  { value: "price", label: "Price" },
  { value: "value", label: "Value / $" },
  { value: "opening", label: "Opening" },
  { value: "awp", label: "AWP" },
  { value: "rifle", label: "Rifle" },
  { value: "clutch", label: "Clutch" },
  { value: "consistency", label: "Consistency" },
];

const priceCaps = [
  { value: "All", label: "Any price" },
  { value: "4", label: "$4 or less" },
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

export function RosterBuilderPage() {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<string[]>(() => readActiveRosterIds());
  const [rosterName, setRosterName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | PlayerRole>("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("fit");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showOnlyAffordable, setShowOnlyAffordable] = useState(true);

  const selectedPlayers = useMemo(() => {
    return players.filter((player) => selectedIds.includes(player.id));
  }, [selectedIds]);

  const totalPrice = selectedPlayers.reduce((sum, player) => sum + player.price, 0);
  const remainingBudget = ROSTER_BUDGET - totalPrice;
  const averageImpact = getAverageImpact(selectedPlayers);
  const score = getRosterScore(selectedPlayers);
  const baseWarnings = getRosterWarnings(selectedPlayers);
  const missingCoreRoles = getMissingCoreRoles(selectedPlayers);
  const isOverBudget = totalPrice > ROSTER_BUDGET;
  const builderWarnings = getBuilderWarnings(
    selectedPlayers,
    baseWarnings,
    missingCoreRoles,
    isOverBudget,
  );
  const rosterStatus = getRosterStatus(selectedPlayers, isOverBudget, builderWarnings);
  const bestMapFits = getRosterMapFits(selectedPlayers).slice(0, 3);
  const rosterRead = getRosterRead(
    selectedPlayers,
    score,
    builderWarnings,
    isOverBudget,
    missingCoreRoles,
    bestMapFits,
  );

  const teamOptions = useMemo(() => {
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const roleBalanceScore = getRoleBalanceScore(selectedPlayers);
  const valueScore = getRosterValueScore(selectedPlayers, score.total);
  const bestValuePick = getBestValuePick(selectedPlayers);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        const selected = selectedIds.includes(player.id);
        const teamName = getTeamName(player.teamId, teams);
        const affordable = selected || totalPrice + player.price <= ROSTER_BUDGET;
        const rosterHasSlot = selected || selectedPlayers.length < ROSTER_SIZE;

        const matchesSearch =
          normalizedQuery.length === 0 ||
          player.nickname.toLowerCase().includes(normalizedQuery) ||
          player.country.toLowerCase().includes(normalizedQuery) ||
          player.role.toLowerCase().includes(normalizedQuery) ||
          teamName.toLowerCase().includes(normalizedQuery) ||
          player.traits.some((trait) => trait.toLowerCase().includes(normalizedQuery));

        const matchesRole = roleFilter === "All" || player.role === roleFilter;
        const matchesTeam = teamFilter === "All" || player.teamId === teamFilter;
        const matchesPrice = maxPrice === "All" || player.price <= Number(maxPrice);
        const matchesAffordable =
          !showOnlyAffordable || selected || (affordable && rosterHasSlot);

        return (
          matchesSearch && matchesRole && matchesTeam && matchesPrice && matchesAffordable
        );
      })
      .sort((a, b) => {
        const aValue = getSortValue(a, sortBy, selectedPlayers);
        const bValue = getSortValue(b, sortBy, selectedPlayers);
        const directionMultiplier = sortDirection === "desc" ? -1 : 1;

        if (aValue !== bValue) {
          return (aValue - bValue) * directionMultiplier;
        }

        return a.nickname.localeCompare(b.nickname);
      });
  }, [
    searchQuery,
    roleFilter,
    teamFilter,
    maxPrice,
    sortBy,
    sortDirection,
    showOnlyAffordable,
    selectedIds,
    selectedPlayers,
    totalPrice,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    roleFilter !== "All" ||
    teamFilter !== "All" ||
    maxPrice !== "All" ||
    sortBy !== "fit" ||
    sortDirection !== "desc" ||
    !showOnlyAffordable;

  function togglePlayer(player: CS2Player) {
    setSelectedIds((current) => {
      const alreadySelected = current.includes(player.id);

      if (alreadySelected) {
        return current.filter((id) => id !== player.id);
      }

      const currentPlayers = players.filter((item) => current.includes(item.id));
      const currentPrice = currentPlayers.reduce((sum, item) => sum + item.price, 0);
      const wouldExceedBudget = currentPrice + player.price > ROSTER_BUDGET;
      const wouldExceedSlots = current.length >= ROSTER_SIZE;

      if (wouldExceedBudget || wouldExceedSlots) {
        return current;
      }

      return [...current, player.id];
    });
  }

  function addBestForRole(role: PlayerRole) {
    const bestPlayer = getBestAvailableForRole(
      role,
      selectedIds,
      selectedPlayers,
      totalPrice,
    );

    if (bestPlayer) {
      togglePlayer(bestPlayer);
    }
  }

  function clearRoster() {
    setSelectedIds([]);
  }

  function resetFilters() {
    setSearchQuery("");
    setRoleFilter("All");
    setTeamFilter("All");
    setMaxPrice("All");
    setSortBy("fit");
    setSortDirection("desc");
    setShowOnlyAffordable(true);
  }

  function saveRoster() {
    if (selectedPlayers.length !== ROSTER_SIZE || isOverBudget) return;

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
          description="Собери состав из 5 игроков за бюджет $25. Теперь билдер умеет фильтровать кандидатов, сортировать по fit/value и быстро закрывать недостающие роли."
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
        <StatCard
          title="Selected"
          value={`${selectedPlayers.length}/${ROSTER_SIZE}`}
          subtitle="players"
        />
        <StatCard
          title="Budget"
          value={`$${totalPrice}/${ROSTER_BUDGET}`}
          subtitle={`remaining $${Math.max(remainingBudget, 0)}`}
          danger={isOverBudget}
        />
        <StatCard
          title="Role Balance"
          value={roleBalanceScore.toString()}
          subtitle={`${ROSTER_SIZE - missingCoreRoles.length}/${ROSTER_SIZE} core roles`}
        />
        <StatCard
          title="Value"
          value={valueScore.toString()}
          subtitle="score per budget"
        />
        <StatCard title="Total" value={score.total.toString()} subtitle="roster score" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel title="Available players">
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_1fr_0.8fr_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-400">Search</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="donk, AWPer, NAVI, Clutch..."
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-400">Role</span>
                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value as "All" | PlayerRole)
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role === "All" ? "All roles" : role}
                    </option>
                  ))}
                </select>
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
                <span className="text-sm font-semibold text-slate-400">Price</span>
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
                  onChange={(event) =>
                    setSortDirection(event.target.value as SortDirection)
                  }
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

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showOnlyAffordable}
                onChange={(event) => setShowOnlyAffordable(event.target.checked)}
                className="h-4 w-4"
              />
              Show only affordable players with available roster slots
            </label>

            <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
                Quick role fill
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {coreRoles.map((role) => {
                  const alreadyCovered = selectedPlayers.some(
                    (player) => player.role === role,
                  );
                  const bestPlayer = getBestAvailableForRole(
                    role,
                    selectedIds,
                    selectedPlayers,
                    totalPrice,
                  );

                  return (
                    <button
                      key={role}
                      onClick={() => addBestForRole(role)}
                      disabled={alreadyCovered || !bestPlayer}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {alreadyCovered
                        ? `${role}: covered`
                        : bestPlayer
                          ? `Add ${role}: ${bestPlayer.nickname}`
                          : `${role}: no fit`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>
                Showing{" "}
                <span className="font-bold text-white">{filteredPlayers.length}</span>{" "}
                candidates sorted by{" "}
                <span className="font-bold text-cyan-200">
                  {sortOptions.find((item) => item.value === sortBy)?.label}
                </span>
              </span>

              {bestValuePick ? (
                <span>
                  Best selected value:{" "}
                  <span className="font-bold text-cyan-200">
                    {bestValuePick.nickname}
                  </span>
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => {
                  const selected = selectedIds.includes(player.id);
                  const wouldExceedBudget =
                    !selected && totalPrice + player.price > ROSTER_BUDGET;
                  const rosterIsFull = !selected && selectedPlayers.length >= ROSTER_SIZE;
                  const disabled = wouldExceedBudget || rosterIsFull;
                  const budgetAfterPick = totalPrice + player.price;
                  const sortValue = formatSortValue(player, sortBy, selectedPlayers);

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

                        <div className="grid gap-2 text-right">
                          <div className="text-xl font-black text-cyan-300">
                            ${player.price}
                          </div>
                          <Score value={getPlayerImpact(player)} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <RoleBadge role={player.role} />
                        <span className="text-sm font-semibold text-slate-300">
                          Sort: {sortValue}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <Metric label="Opening" value={player.stats.opening} />
                        <Metric label="AWP" value={player.stats.awp} />
                        <Metric label="Clutch" value={player.stats.clutch} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                        {selected && (
                          <span className="rounded-full bg-cyan-300 px-3 py-1 text-slate-950">
                            Selected
                          </span>
                        )}

                        {!selected && !disabled && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                            After pick: ${budgetAfterPick}/{ROSTER_BUDGET}
                          </span>
                        )}

                        {missingCoreRoles.includes(player.role) && !selected && (
                          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">
                            Fills missing role
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
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-500 md:col-span-2">
                  Ничего не найдено. Сбрось фильтры или измени запрос.
                </div>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Your roster">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {rosterStatus.label}
                </p>
              </div>
              <RosterStatusBadge status={rosterStatus} />
            </div>
            <p className="text-sm text-slate-300">{rosterRead}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Avg Impact
              </p>
              <p className="mt-2 text-3xl font-black text-cyan-200">{averageImpact}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Remaining
              </p>
              <p className="mt-2 text-3xl font-black text-cyan-200">
                ${Math.max(remainingBudget, 0)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
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
              Role coverage
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {coreRoles.map((role) => {
                const covered = selectedPlayers.some((player) => player.role === role);

                return (
                  <span
                    key={role}
                    className={`rounded-full border px-3 py-1 text-sm font-bold ${
                      covered
                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                        : "border-amber-300/30 bg-amber-300/10 text-amber-200"
                    }`}
                  >
                    {covered ? `${role}: yes` : `${role}: missing`}
                  </span>
                );
              })}
            </div>
          </div>

          {bestMapFits.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Best map fit
              </p>

              <div className="mt-3 grid gap-2">
                {bestMapFits.map((mapFit) => (
                  <div
                    key={mapFit.map.id}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3"
                  >
                    <div>
                      <div className="font-bold">{mapFit.map.name}</div>
                      <div className="text-xs text-slate-500">
                        {mapFit.map.sideProfile}
                      </div>
                    </div>
                    <Score value={mapFit.score} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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
                disabled={selectedPlayers.length !== ROSTER_SIZE || isOverBudget}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Сохранение доступно для состава 5/5 в рамках бюджета. Данные хранятся в
              браузере через localStorage.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <Metric label="Firepower" value={score.firepower} />
            <Metric label="AWP Power" value={score.awp} />
            <Metric label="Entry Pressure" value={score.entry} />
            <Metric label="Clutch" value={score.clutch} />
            <Metric label="Structure" value={score.structure} />
          </div>

          <div className="mt-5 grid gap-2">
            {(isOverBudget || builderWarnings.length > 0) && (
              <p className="text-sm font-bold uppercase tracking-wider text-amber-300">
                Проверка состава
              </p>
            )}

            {isOverBudget && (
              <Warning text="Бюджет превышен. Нужно убрать дорогого игрока." />
            )}

            {builderWarnings.map((warning) => (
              <Warning key={warning} text={warning} />
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function getSortValue(player: CS2Player, sortBy: SortKey, selectedPlayers: CS2Player[]) {
  if (sortBy === "fit") return getCandidateFitScore(player, selectedPlayers);
  if (sortBy === "impact") return getPlayerImpact(player);
  if (sortBy === "rating") return player.stats.rating;
  if (sortBy === "price") return player.price;
  if (sortBy === "value") return getPlayerValueScore(player);
  if (sortBy === "opening") return player.stats.opening;
  if (sortBy === "awp") return player.stats.awp;
  if (sortBy === "rifle") return player.stats.rifle;
  if (sortBy === "clutch") return player.stats.clutch;
  return player.stats.consistency;
}

function formatSortValue(
  player: CS2Player,
  sortBy: SortKey,
  selectedPlayers: CS2Player[],
) {
  const value = getSortValue(player, sortBy, selectedPlayers);

  if (sortBy === "rating") return value.toFixed(2);
  if (sortBy === "price") return `$${value}`;
  if (sortBy === "value") return value.toFixed(1);

  return Math.round(value).toString();
}

function getCandidateFitScore(player: CS2Player, selectedPlayers: CS2Player[]) {
  const roleAlreadyCovered = selectedPlayers.some((item) => item.role === player.role);
  const selectedRoles = new Set(selectedPlayers.map((item) => item.role));
  const fillsCoreRole =
    coreRoles.includes(player.role) && !selectedRoles.has(player.role);

  const impactScore = getPlayerImpact(player) * 0.45;
  const consistencyScore = player.stats.consistency * 0.15;
  const clutchScore = player.stats.clutch * 0.12;
  const valueScore = getPlayerValueScore(player) * 0.16;
  const roleBonus = fillsCoreRole ? 10 : roleAlreadyCovered ? -5 : 2;

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        impactScore + consistencyScore + clutchScore + valueScore + roleBonus,
      ),
    ),
  );
}

function getPlayerValueScore(player: CS2Player) {
  return getPlayerImpact(player) / Math.max(player.price, 1);
}

function getAverageImpact(selectedPlayers: CS2Player[]) {
  if (selectedPlayers.length === 0) return 0;

  const total = selectedPlayers.reduce((sum, player) => sum + getPlayerImpact(player), 0);

  return Math.round(total / selectedPlayers.length);
}

function getMissingCoreRoles(selectedPlayers: CS2Player[]) {
  return coreRoles.filter((role) => {
    return !selectedPlayers.some((player) => player.role === role);
  });
}

function getRoleBalanceScore(selectedPlayers: CS2Player[]) {
  if (selectedPlayers.length === 0) return 0;

  const coveredCoreRoles = coreRoles.length - getMissingCoreRoles(selectedPlayers).length;
  const uniqueRoles = new Set(selectedPlayers.map((player) => player.role)).size;

  return Math.round(
    Math.min(100, coveredCoreRoles * 16 + uniqueRoles * 4 + selectedPlayers.length * 2),
  );
}

function getRosterValueScore(selectedPlayers: CS2Player[], rosterTotalScore: number) {
  if (selectedPlayers.length === 0) return 0;

  const totalPrice = selectedPlayers.reduce((sum, player) => sum + player.price, 0);
  if (totalPrice === 0) return 0;

  return Math.round(Math.min(100, (rosterTotalScore / totalPrice) * 10));
}

function getBestValuePick(selectedPlayers: CS2Player[]) {
  if (selectedPlayers.length === 0) return null;

  return [...selectedPlayers].sort(
    (a, b) => getPlayerValueScore(b) - getPlayerValueScore(a),
  )[0];
}

function getBestAvailableForRole(
  role: PlayerRole,
  selectedIds: string[],
  selectedPlayers: CS2Player[],
  totalPrice: number,
) {
  if (selectedPlayers.length >= ROSTER_SIZE) return null;

  return (
    players
      .filter((player) => {
        return (
          player.role === role &&
          !selectedIds.includes(player.id) &&
          totalPrice + player.price <= ROSTER_BUDGET
        );
      })
      .sort(
        (a, b) =>
          getCandidateFitScore(b, selectedPlayers) -
          getCandidateFitScore(a, selectedPlayers),
      )[0] ?? null
  );
}

function getBuilderWarnings(
  selectedPlayers: CS2Player[],
  baseWarnings: string[],
  missingCoreRoles: PlayerRole[],
  isOverBudget: boolean,
) {
  const warnings = [...baseWarnings];

  if (selectedPlayers.length > 0 && selectedPlayers.length < ROSTER_SIZE) {
    warnings.push(`Состав неполный: ${selectedPlayers.length}/${ROSTER_SIZE}.`);
  }

  if (!isOverBudget && selectedPlayers.length >= 3 && missingCoreRoles.length > 0) {
    warnings.push(`Не закрыты core roles: ${missingCoreRoles.join(", ")}.`);
  }

  return [...new Set(warnings)];
}

function getRosterMapFits(selectedPlayers: CS2Player[]) {
  if (selectedPlayers.length === 0) return [];

  return maps
    .map((map) => {
      const playerFitTotal = selectedPlayers.reduce((sum, player) => {
        return sum + getPlayerMapFit(player, map);
      }, 0);

      return {
        map,
        score: Math.round(playerFitTotal / selectedPlayers.length),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function getPlayerMapFit(player: CS2Player, map: CS2MapProfile) {
  let score =
    player.stats.impact * 0.2 +
    player.stats.consistency * 0.16 +
    player.stats.clutch * 0.14 +
    player.stats.opening * (map.entryValue / 100) * 0.18 +
    player.stats.awp * (map.awpValue / 100) * 0.14 +
    player.stats.rifle * 0.18;

  if (map.bestRoles.includes(player.role)) score += 6;
  if (player.role === "Anchor") score += map.anchorPressure * 0.04;
  if (player.role === "Entry") score += map.entryValue * 0.03;
  if (player.role === "AWPer") score += map.awpValue * 0.03;

  return Math.round(Math.max(0, Math.min(100, score)));
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

  if (selectedPlayers.length === ROSTER_SIZE && warnings.length === 0) {
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
  missingCoreRoles: PlayerRole[],
  bestMapFits: Array<{ map: CS2MapProfile; score: number }>,
) {
  if (selectedPlayers.length === 0) {
    return "Состав пустой. Начни с AWP или entry-игрока, а затем добавь IGL/support для структуры.";
  }

  if (isOverBudget) {
    return "Состав невалиден по бюджету. Снизь стоимость ростера, убрав одного дорогого игрока.";
  }

  if (selectedPlayers.length < ROSTER_SIZE) {
    return `Состав ещё не готов: выбрано ${selectedPlayers.length}/${ROSTER_SIZE}. Не закрыты: ${
      missingCoreRoles.length > 0 ? missingCoreRoles.join(", ") : "core roles закрыты"
    }.`;
  }

  if (warnings.length > 0) {
    return `Состав собран, но есть проблемы: ${warnings.join(" ")}`;
  }

  const bestArea = [
    ["firepower", score.firepower],
    ["AWP power", score.awp],
    ["entry pressure", score.entry],
    ["clutch", score.clutch],
    ["structure", score.structure],
  ] as const;

  const strongest = [...bestArea].sort((a, b) => b[1] - a[1])[0][0];
  const bestMap = bestMapFits[0];

  return `Валидный состав. Главная сила — ${strongest}. Общий рейтинг ${score.total}/100. Лучший map fit: ${
    bestMap ? `${bestMap.map.name} (${bestMap.score}/100)` : "пока не рассчитан"
  }.`;
}

function RosterStatusBadge({ status }: { status: ReturnType<typeof getRosterStatus> }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-black ${status.className}`}
    >
      {status.label}
    </span>
  );
}
