import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact, getRosterScore, getRosterWarnings, getTeamName } from "../lib";
import { Score } from "../components/Score";
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

function writeActiveRosterIds(playerIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ROSTER_KEY, JSON.stringify(playerIds));
}

function getRosterPlayers(playerIds: string[]) {
  return playerIds
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter((player): player is CS2Player => Boolean(player));
}

export function SavedRostersPage() {
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


function MiniMetric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

