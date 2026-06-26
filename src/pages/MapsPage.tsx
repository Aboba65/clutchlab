import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { maps, type CS2MapProfile } from "../config/maps";
import { Metric } from "../components/Metric";

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

export function MapsPage() {
  const navigate = useNavigate();

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
              onClick={() => navigate(`/maps/${map.id}`)}
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
