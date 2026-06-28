import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact, getRosterScore, getRosterWarnings, getTeamName } from "../lib";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";
import { Warning } from "../components/Warning";

const ROSTER_BUDGET = 25;
const ROSTER_SIZE = 5;

type SavedRoster = {
  id: string;
  name: string;
  playerIds: string[];
  createdAt: string;
};

type RosterStatus = "valid" | "invalid" | "over-budget";

type StatusFilter = "All" | "valid" | "invalid" | "over-budget";

type SortKey =
  | "score"
  | "price"
  | "date"
  | "name"
  | "players"
  | "warnings"
  | "averageImpact"
  | "value";

type SortDirection = "desc" | "asc";

const SAVED_ROSTERS_KEY = "clutchlab.savedRosters";
const ACTIVE_ROSTER_KEY = "clutchlab.activeRoster";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "All", label: "All statuses" },
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Invalid" },
  { value: "over-budget", label: "Over budget" },
];

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "score", label: "Score" },
  { value: "price", label: "Price" },
  { value: "date", label: "Date saved" },
  { value: "name", label: "Name" },
  { value: "players", label: "Player count" },
  { value: "warnings", label: "Warning count" },
  { value: "averageImpact", label: "Average impact" },
  { value: "value", label: "Value / $" },
];

function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}

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

function writeActiveRosterIds(playerIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ROSTER_KEY, JSON.stringify(playerIds));
}

function getRosterPlayers(playerIds: string[]) {
  return playerIds
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter((player): player is CS2Player => Boolean(player));
}

function getRosterPrice(rosterPlayers: CS2Player[]) {
  return rosterPlayers.reduce((sum, player) => sum + player.price, 0);
}

function getAverageImpact(rosterPlayers: CS2Player[]) {
  if (rosterPlayers.length === 0) return 0;

  const total = rosterPlayers.reduce((sum, player) => sum + getPlayerImpact(player), 0);

  return Math.round(total / rosterPlayers.length);
}

function getRosterValue(rosterPlayers: CS2Player[]) {
  if (rosterPlayers.length === 0) return 0;

  const totalPrice = getRosterPrice(rosterPlayers);
  if (totalPrice === 0) return 0;

  return getRosterScore(rosterPlayers).total / totalPrice;
}

function getCreatedTime(roster: SavedRoster) {
  const date = new Date(roster.createdAt);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
}

function getRosterStatus(rosterPlayers: CS2Player[], warnings: string[]): RosterStatus {
  const totalPrice = getRosterPrice(rosterPlayers);

  if (totalPrice > ROSTER_BUDGET) return "over-budget";

  if (rosterPlayers.length === ROSTER_SIZE && warnings.length === 0) {
    return "valid";
  }

  return "invalid";
}

function getRosterStatusLabel(status: RosterStatus) {
  if (status === "valid") return "Valid";
  if (status === "over-budget") return "Over budget";
  return "Invalid";
}

function getRosterStatusClassName(status: RosterStatus) {
  if (status === "valid") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "over-budget") {
    return "border-red-300/30 bg-red-400/10 text-red-200";
  }

  return "border-amber-300/30 bg-amber-300/10 text-amber-200";
}

function getSortValue(roster: SavedRoster, sortBy: SortKey) {
  const rosterPlayers = getRosterPlayers(roster.playerIds);
  const score = getRosterScore(rosterPlayers);
  const warnings = getRosterWarnings(rosterPlayers);

  if (sortBy === "score") return score.total;
  if (sortBy === "price") return getRosterPrice(rosterPlayers);
  if (sortBy === "date") return getCreatedTime(roster);
  if (sortBy === "players") return rosterPlayers.length;
  if (sortBy === "warnings") return warnings.length;
  if (sortBy === "averageImpact") return getAverageImpact(rosterPlayers);
  if (sortBy === "value") return getRosterValue(rosterPlayers);

  return roster.name.toLowerCase();
}

function formatSortValue(roster: SavedRoster, sortBy: SortKey) {
  const rosterPlayers = getRosterPlayers(roster.playerIds);
  const value = getSortValue(roster, sortBy);

  if (sortBy === "name") return roster.name;
  if (sortBy === "price") return `$${getRosterPrice(rosterPlayers)}`;
  if (sortBy === "date") {
    const date = new Date(roster.createdAt);
    return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString();
  }
  if (sortBy === "players") return `${rosterPlayers.length}/${ROSTER_SIZE}`;
  if (sortBy === "warnings") return `${value} warnings`;
  if (sortBy === "value") return Number(value).toFixed(1);

  return Math.round(Number(value)).toString();
}

function getRosterSearchText(roster: SavedRoster) {
  const rosterPlayers = getRosterPlayers(roster.playerIds);

  return [
    roster.name,
    ...rosterPlayers.map((player) => player.nickname),
    ...rosterPlayers.map((player) => player.country),
    ...rosterPlayers.map((player) => player.role),
    ...rosterPlayers.map((player) => getTeamName(player.teamId, teams)),
  ]
    .join(" ")
    .toLowerCase();
}

function getSummary(rosters: SavedRoster[]) {
  const hydrated = rosters.map((roster) => {
    const rosterPlayers = getRosterPlayers(roster.playerIds);
    const score = getRosterScore(rosterPlayers);
    const warnings = getRosterWarnings(rosterPlayers);
    const status = getRosterStatus(rosterPlayers, warnings);

    return { roster, rosterPlayers, score, warnings, status };
  });

  const validCount = hydrated.filter((item) => item.status === "valid").length;
  const overBudgetCount = hydrated.filter((item) => item.status === "over-budget").length;

  const averageScore =
    hydrated.length === 0
      ? 0
      : Math.round(
          hydrated.reduce((sum, item) => sum + item.score.total, 0) / hydrated.length,
        );

  const bestScore =
    hydrated.length === 0 ? 0 : Math.max(...hydrated.map((item) => item.score.total));

  return {
    validCount,
    overBudgetCount,
    averageScore,
    bestScore,
  };
}

export function SavedRostersPage() {
  const navigate = useNavigate();
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>(() =>
    readSavedRosters(),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredRosters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return savedRosters
      .filter((roster) => {
        const rosterPlayers = getRosterPlayers(roster.playerIds);
        const warnings = getRosterWarnings(rosterPlayers);
        const status = getRosterStatus(rosterPlayers, warnings);

        const matchesSearch =
          normalizedQuery.length === 0 ||
          getRosterSearchText(roster).includes(normalizedQuery);

        const matchesStatus = statusFilter === "All" || status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = getSortValue(a, sortBy);
        const bValue = getSortValue(b, sortBy);
        const directionMultiplier = sortDirection === "desc" ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue) * directionMultiplier;
        }

        if (aValue !== bValue) {
          return (Number(aValue) - Number(bValue)) * directionMultiplier;
        }

        return a.name.localeCompare(b.name);
      });
  }, [savedRosters, searchQuery, statusFilter, sortBy, sortDirection]);

  const summary = useMemo(() => getSummary(savedRosters), [savedRosters]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "All" ||
    sortBy !== "date" ||
    sortDirection !== "desc";

  function deleteRoster(rosterId: string) {
    const nextRosters = savedRosters.filter((roster) => roster.id !== rosterId);
    setSavedRosters(nextRosters);
    writeSavedRosters(nextRosters);
  }

  function clearAllRosters() {
    const confirmed = window.confirm("Delete all saved rosters?");
    if (!confirmed) return;

    setSavedRosters([]);
    writeSavedRosters([]);
  }

  function loadRoster(roster: SavedRoster) {
    writeActiveRosterIds(roster.playerIds);
    navigate("/roster-builder");
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("All");
    setSortBy("date");
    setSortDirection("desc");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Saved Rosters"
          description="Менеджер сохранённых составов из Roster Builder: поиск, статусы, сортировки, загрузка обратно в билдер и удаление."
        />

        <div className="flex flex-wrap gap-2">
          <NavLink
            to="/roster-builder"
            className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
          >
            Build new roster
          </NavLink>

          <button
            onClick={clearAllRosters}
            disabled={savedRosters.length === 0}
            className="rounded-full border border-red-300/20 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard title="Saved" value={savedRosters.length.toString()} />
        <SummaryCard title="Valid" value={summary.validCount.toString()} />
        <SummaryCard title="Avg Score" value={summary.averageScore.toString()} />
        <SummaryCard title="Best Score" value={summary.bestScore.toString()} />
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_0.8fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Roster name, ZywOo, NAVI, AWPer..."
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-400">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              {statusOptions.map((item) => (
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

        <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-3 text-sm text-slate-300">
          Showing <span className="font-bold text-white">{filteredRosters.length}</span>{" "}
          of <span className="font-bold text-white">{savedRosters.length}</span> saved
          rosters. Over budget:{" "}
          <span className="font-bold text-red-200">{summary.overBudgetCount}</span>.
        </div>
      </div>

      {savedRosters.length === 0 ? (
        <EmptyState />
      ) : filteredRosters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-500">
          Ничего не найдено. Сбрось фильтры или измени запрос.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredRosters.map((roster) => {
            const rosterPlayers = getRosterPlayers(roster.playerIds);
            const totalPrice = getRosterPrice(rosterPlayers);
            const score = getRosterScore(rosterPlayers);
            const warnings = getRosterWarnings(rosterPlayers);
            const status = getRosterStatus(rosterPlayers, warnings);
            const createdAt = new Date(roster.createdAt);
            const averageImpact = getAverageImpact(rosterPlayers);

            return (
              <article
                key={roster.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black text-white">{roster.name}</h3>
                      <RosterStatusBadge status={status} />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {Number.isNaN(createdAt.getTime())
                        ? "Saved roster"
                        : createdAt.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Score value={score.total} />
                    <span
                      className={`inline-flex h-11 items-center rounded-2xl px-3 text-sm font-black ${
                        totalPrice > ROSTER_BUDGET
                          ? "bg-red-400/10 text-red-200"
                          : "bg-white/5 text-cyan-300"
                      }`}
                    >
                      ${totalPrice}/{ROSTER_BUDGET}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Current sort value
                  </p>
                  <p className="mt-1 text-xl font-black text-cyan-200">
                    {formatSortValue(roster, sortBy)}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {rosterPlayers.length > 0 ? (
                    rosterPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
                      >
                        <div>
                          <div className="font-black">{player.nickname}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                            <RoleBadge role={player.role} />
                            <span>{getTeamName(player.teamId, teams)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-cyan-300">${player.price}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Impact {getPlayerImpact(player)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                      В этом сохранении нет валидных игроков из текущей базы.
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <MiniMetric title="Firepower" value={score.firepower} />
                  <MiniMetric title="AWP" value={score.awp} />
                  <MiniMetric title="Entry" value={score.entry} />
                  <MiniMetric title="Structure" value={score.structure} />
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  <MiniMetric title="Clutch" value={score.clutch} />
                  <MiniMetric title="Players" value={rosterPlayers.length} />
                  <MiniMetric title="Avg Impact" value={averageImpact} />
                  <MiniMetric
                    title="Value/$"
                    value={Number(getRosterValue(rosterPlayers).toFixed(1))}
                  />
                </div>

                {warnings.length > 0 && (
                  <div className="mt-5 grid gap-2">
                    {warnings.map((warning) => (
                      <Warning key={warning} text={warning} />
                    ))}
                  </div>
                )}

                {rosterPlayers.length !== ROSTER_SIZE && (
                  <div className="mt-5">
                    <Warning
                      text={`Состав неполный: ${rosterPlayers.length}/${ROSTER_SIZE}.`}
                    />
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => loadRoster(roster)}
                    className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                  >
                    Load to Builder
                  </button>
                  <button
                    onClick={() => deleteRoster(roster.id)}
                    className="rounded-full border border-red-300/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-400/15"
                  >
                    Delete roster
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

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <p className="text-2xl font-black text-white">Пока нет сохранённых составов</p>
      <p className="mx-auto mt-3 max-w-2xl text-slate-400">
        Собери валидный ростер 5/5 в рамках бюджета, задай название и нажми Save. После
        этого он появится здесь.
      </p>
      <NavLink
        to="/roster-builder"
        className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200"
      >
        Go to Roster Builder
      </NavLink>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-cyan-200">{value}</p>
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

function RosterStatusBadge({ status }: { status: RosterStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getRosterStatusClassName(
        status,
      )}`}
    >
      {getRosterStatusLabel(status)}
    </span>
  );
}
