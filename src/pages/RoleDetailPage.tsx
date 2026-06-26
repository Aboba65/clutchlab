import { useNavigate, useParams } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player, PlayerRole } from "../types";
import { getPlayerImpact, getTeamName } from "../lib";
import { roleConfigs, type RoleConfig } from "../config/roles";
import { maps, type CS2MapProfile } from "../config/maps";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";
import { Metric } from "../components/Metric";

export function RoleDetailPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const config = roleConfigs.find((item) => item.id === roleId);

  if (!config) {
    return (
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h2 className="text-4xl font-black">Role not found</h2>
        <p className="max-w-2xl text-slate-400">
          Такой роли нет в текущей модели ClutchLab.
        </p>
        <button
          onClick={() => navigate("/roles")}
          className="w-fit rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
        >
          Back to roles
        </button>
      </section>
    );
  }

  return <RoleDetailView config={config} onBack={() => navigate("/roles")} />;
}

function RoleDetailView({
  config,
  onBack,
}: {
  config: RoleConfig;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const rolePlayers = getRolePlayers(config.role);
  const topPlayers = getBestPlayersForRole(config.role, 8);
  const average = getAverageRoleProfile(config.role);
  const bestMaps = getBestMapsForRole(config.role, 5);
  const similarRoles = getSimilarRoles(config.role);

  return (
    <section className="grid gap-6">
      <button
        onClick={onBack}
        className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ← Back to roles
      </button>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Role Profile
            </p>

            <h2 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              {config.title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadge role={config.role} />
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {rolePlayers.length} players
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {config.identity}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">{config.description}</p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
              Avg Role Fit
            </p>
            <div className="mt-2 text-6xl font-black text-cyan-200">
              {average.roleFit}
            </div>
            <p className="mt-2 text-sm text-slate-400">Current MVP role pool</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Players" value={rolePlayers.length.toString()} subtitle="in database" />
        <StatCard title="Impact" value={average.impact.toString()} subtitle="avg index" />
        <StatCard title="Opening" value={average.opening.toString()} subtitle="pressure" />
        <StatCard title="Clutch" value={average.clutch.toString()} subtitle="late round" />
        <StatCard title="Price" value={`$${average.price}`} subtitle="avg budget" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title={`Top ${config.title}s`}>
          <div className="grid gap-3">
            {topPlayers.length > 0 ? (
              topPlayers.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => navigate(`/players/${player.id}`)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-black">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-black">{player.nickname}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {player.country} · {getTeamName(player.teamId, teams)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-sm font-semibold text-slate-400 md:inline">
                      Role Fit {getRoleFitScore(player)}
                    </span>
                    <Score value={getPlayerImpact(player)} />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">
                No players for this role yet.
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Role model">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                What this role needs
              </p>
              <div className="mt-3 grid gap-2">
                {config.needs.map((item) => (
                  <span key={item} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Roster builder advice
              </p>
              <p className="mt-2 text-sm text-slate-300">{config.rosterAdvice}</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Average profile">
          <div className="grid gap-4">
            <Metric label="Role Fit" value={average.roleFit} />
            <Metric label="Impact" value={average.impact} />
            <Metric label="Opening" value={average.opening} />
            <Metric label="Clutch" value={average.clutch} />
            <Metric label="AWP Power" value={average.awp} />
            <Metric label="Rifle Power" value={average.rifle} />
            <Metric label="Consistency" value={average.consistency} />
          </div>
        </Panel>

        <Panel title="Best map fits">
          <div className="grid gap-3">
            {bestMaps.map(({ map, score, reason }) => (
              <button
                key={map.id}
                onClick={() => navigate(`/maps/${map.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{map.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{reason}</div>
                  </div>
                  <Score value={score} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Best use cases">
          <div className="grid gap-2">
            {config.bestUse.map((item) => (
              <div key={item} className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Similar roles">
          <div className="grid gap-3">
            {similarRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => navigate(`/roles/${role.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{role.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{role.identity}</div>
                  </div>
                  <RoleBadge role={role.role} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function getRolePlayers(role: PlayerRole) {
  return players.filter((player) => player.role === role);
}

function getBestPlayersForRole(role: PlayerRole, limit = 5) {
  return getRolePlayers(role)
    .sort((a, b) => {
      const roleFitDifference = getRoleFitScore(b) - getRoleFitScore(a);
      if (roleFitDifference !== 0) return roleFitDifference;
      return getPlayerImpact(b) - getPlayerImpact(a);
    })
    .slice(0, limit);
}

function getAverageRoleProfile(role: PlayerRole) {
  const rolePlayers = getRolePlayers(role);

  return {
    roleFit: average(rolePlayers.map((player) => getRoleFitScore(player))),
    impact: average(rolePlayers.map((player) => getPlayerImpact(player))),
    rating: average(rolePlayers.map((player) => ratingToScore(player.stats.rating))),
    opening: average(rolePlayers.map((player) => player.stats.opening)),
    clutch: average(rolePlayers.map((player) => player.stats.clutch)),
    awp: average(rolePlayers.map((player) => player.stats.awp)),
    rifle: average(rolePlayers.map((player) => player.stats.rifle)),
    consistency: average(rolePlayers.map((player) => player.stats.consistency)),
    price: average(rolePlayers.map((player) => player.price)),
  };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getBestMapsForRole(role: PlayerRole, limit = 5) {
  return maps
    .map((map) => ({
      map,
      score: getRoleMapScore(role, map),
      reason: getRoleMapReason(role, map),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getRoleMapScore(role: PlayerRole, map: CS2MapProfile) {
  const directRoleBonus = map.bestRoles.includes(role) ? 18 : 0;
  const familyBonus = map.bestRoles.some((item) => getRoleFamily(item) === getRoleFamily(role)) ? 8 : 0;

  if (role === "AWPer") {
    return Math.min(100, Math.round(map.awpValue * 0.68 + map.ctSideStrength * 0.18 + directRoleBonus + familyBonus));
  }

  if (role === "Entry" || role === "Star Rifler") {
    return Math.min(100, Math.round(map.entryValue * 0.55 + map.tSideDifficulty * 0.18 + map.ctSideStrength * 0.12 + directRoleBonus + familyBonus));
  }

  if (role === "Anchor" || role === "Support" || role === "IGL") {
    return Math.min(100, Math.round(map.anchorPressure * 0.46 + map.ctSideStrength * 0.24 + map.tSideDifficulty * 0.12 + directRoleBonus + familyBonus));
  }

  return Math.min(100, Math.round(map.entryValue * 0.26 + map.anchorPressure * 0.24 + map.ctSideStrength * 0.18 + map.awpValue * 0.12 + directRoleBonus + familyBonus));
}

function getRoleMapReason(role: PlayerRole, map: CS2MapProfile) {
  if (map.bestRoles.includes(role)) {
    return `${role} is listed as a primary role fit on ${map.name}.`;
  }

  if (role === "AWPer" && map.awpValue >= 80) {
    return "High AWP value map with long-angle control.";
  }

  if ((role === "Entry" || role === "Star Rifler") && map.entryValue >= 80) {
    return "Strong map for opening duels and rifle pressure.";
  }

  if ((role === "Anchor" || role === "Support" || role === "IGL") && map.anchorPressure >= 82) {
    return "High structure and site-defense value.";
  }

  return map.identity;
}

function getSimilarRoles(role: PlayerRole) {
  return roleConfigs
    .filter((config) => config.role !== role)
    .map((config) => ({
      ...config,
      score: getRoleFamily(config.role) === getRoleFamily(role) ? 100 : 65,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function getRoleFitScore(player: CS2Player) {
  const ratingScore = ratingToScore(player.stats.rating);

  if (player.role === "AWPer") {
    return weightedScore([
      [player.stats.awp, 0.34],
      [player.stats.impact, 0.18],
      [ratingScore, 0.18],
      [player.stats.clutch, 0.14],
      [player.stats.consistency, 0.16],
    ]);
  }

  if (player.role === "Entry") {
    return weightedScore([
      [player.stats.opening, 0.34],
      [player.stats.impact, 0.24],
      [player.stats.rifle, 0.18],
      [ratingScore, 0.12],
      [player.stats.consistency, 0.12],
    ]);
  }

  if (player.role === "Star Rifler") {
    return weightedScore([
      [player.stats.rifle, 0.28],
      [player.stats.impact, 0.24],
      [ratingScore, 0.2],
      [player.stats.opening, 0.14],
      [player.stats.clutch, 0.14],
    ]);
  }

  if (player.role === "Lurker") {
    return weightedScore([
      [player.stats.clutch, 0.24],
      [player.stats.consistency, 0.22],
      [player.stats.rifle, 0.2],
      [ratingScore, 0.18],
      [player.stats.impact, 0.16],
    ]);
  }

  if (player.role === "Anchor") {
    return weightedScore([
      [player.stats.consistency, 0.3],
      [player.stats.clutch, 0.2],
      [player.stats.rifle, 0.18],
      [ratingScore, 0.16],
      [player.stats.impact, 0.16],
    ]);
  }

  if (player.role === "Support" || player.role === "IGL") {
    return weightedScore([
      [player.stats.consistency, 0.3],
      [player.stats.kast, 0.22],
      [player.stats.clutch, 0.18],
      [ratingScore, 0.14],
      [player.stats.impact, 0.16],
    ]);
  }

  return weightedScore([
    [player.stats.consistency, 0.24],
    [player.stats.rifle, 0.2],
    [player.stats.impact, 0.2],
    [player.stats.clutch, 0.18],
    [ratingScore, 0.18],
  ]);
}

function ratingToScore(rating: number) {
  return Math.max(0, Math.min(100, Math.round(((rating - 0.85) / 0.45) * 100)));
}

function weightedScore(entries: Array<[number, number]>) {
  return Math.round(entries.reduce((sum, [value, weight]) => sum + value * weight, 0));
}

function getRoleFamily(role: PlayerRole) {
  if (role === "AWPer") return "awp";
  if (role === "Entry" || role === "Star Rifler") return "aggressive-rifle";
  if (role === "Lurker" || role === "Flex") return "space";
  if (role === "Anchor" || role === "Support" || role === "IGL") return "structure";
  return "other";
}

