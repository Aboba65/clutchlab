import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact, getRosterScore, getRosterWarnings, getTeamName } from "../lib";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { RoleBadge } from "../components/RoleBadge";
import { Metric } from "../components/Metric";
import { Warning } from "../components/Warning";

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
