import { useNavigate, useParams } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getTeamName } from "../lib";
import { maps, type CS2MapProfile } from "../config/maps";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";
import { Metric } from "../components/Metric";

export function MapDetailPage() {
  const navigate = useNavigate();
  const { mapId } = useParams();
  const map = maps.find((item) => item.id === mapId);

  if (!map) {
    return (
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h2 className="text-4xl font-black">Map not found</h2>
        <p className="max-w-2xl text-slate-400">
          Такой карты нет в текущей базе ClutchLab.
        </p>
        <button
          onClick={() => navigate("/maps")}
          className="w-fit rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
        >
          Back to maps
        </button>
      </section>
    );
  }

  return <MapDetailView map={map} onBack={() => navigate("/maps")} />;
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
