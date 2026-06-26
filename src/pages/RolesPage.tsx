import { useNavigate } from "react-router-dom";
import { players } from "../data";
import type { CS2Player, PlayerRole } from "../types";
import { getPlayerImpact } from "../lib";
import { roleConfigs } from "../config/roles";
import { maps, type CS2MapProfile } from "../config/maps";
import { Score } from "../components/Score";
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

function MiniMetric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
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

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getRoleFamily(role: PlayerRole) {
  if (role === "AWPer") return "awp";
  if (role === "Entry" || role === "Star Rifler") return "aggressive-rifle";
  if (role === "Lurker" || role === "Flex") return "space";
  if (role === "Anchor" || role === "Support" || role === "IGL") return "structure";
  return "other";
}

export function RolesPage() {
  const navigate = useNavigate();

  return (
    <section className="grid gap-6">
      <PageTitle
        title="Roles"
        description="Ролевые страницы связывают игроков, карты и roster builder: кто лучший в роли, какие карты подходят и как использовать роль в составе."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleConfigs.map((config) => {
          const rolePlayers = getRolePlayers(config.role);
          const bestPlayers = getBestPlayersForRole(config.role, 3);
          const average = getAverageRoleProfile(config.role);
          const bestMap = getBestMapsForRole(config.role, 1)[0];

          return (
            <button
              key={config.id}
              onClick={() => navigate(`/roles/${config.id}`)}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black">{config.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{config.identity}</p>
                </div>
                <Score value={average.roleFit} />
              </div>

              <div className="mt-5 grid gap-3">
                <MiniMetric title="Players" value={rolePlayers.length} />
                <Metric label="Avg Impact" value={average.impact} />
                <Metric label="Avg Role Fit" value={average.roleFit} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Top players
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bestPlayers.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300"
                    >
                      {player.nickname}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best map fit
                </p>
                <span className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                  {bestMap?.map.name ?? "No map"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
