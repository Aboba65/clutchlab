import { useNavigate, useParams } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player, PlayerRole } from "../types";
import { getPlayerImpact, getTeamName } from "../lib";
import { maps, type CS2MapProfile } from "../config/maps";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";
import { Metric } from "../components/Metric";

export function PlayerDetailPage() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const player = players.find((item) => item.id === playerId);

  if (!player) {
    return (
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h2 className="text-4xl font-black">Player not found</h2>
        <p className="max-w-2xl text-slate-400">
          Такого игрока нет в текущей базе ClutchLab.
        </p>
        <button
          onClick={() => navigate("/players")}
          className="w-fit rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
        >
          Back to players
        </button>
      </section>
    );
  }

  return <PlayerDetailView player={player} onBack={() => navigate("/players")} />;
}

function PlayerDetailView({
  player,
  onBack,
}: {
  player: CS2Player;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const impact = getPlayerImpact(player);
  const teamName = getTeamName(player.teamId, teams);
  const similarPlayers = getSimilarPlayers(player, 4);
  const roleFit = getRoleFitScore(player);
  const weaponProfile = getPlayerWeaponProfile(player);
  const bestMapFits = getBestMapFits(player, 3);
  const teamFits = getTeamFitSuggestions(player, 3);
  const strengths = getPlayerStrengths(player);
  const weaknesses = getPlayerWeaknesses(player);

  return (
    <section className="grid gap-6">
      <button
        onClick={onBack}
        className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ← Back to players
      </button>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Player Profile 2.0
            </p>

            <h2 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              {player.nickname}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadge role={player.role} />
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {player.country}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                {teamName}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                ${player.price}
              </span>
              <span className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-sm font-semibold text-purple-200">
                {weaponProfile.label}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-slate-300">
              {getPlayerSummary(player)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[18rem] md:grid-cols-1">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-200">
                Impact Index
              </p>
              <div className="mt-2 text-6xl font-black text-cyan-200">
                {impact}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Custom ClutchLab score
              </p>
            </div>

            <div className="rounded-3xl border border-purple-300/20 bg-purple-300/10 p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-purple-200">
                Role Fit
              </p>
              <div className="mt-2 text-5xl font-black text-purple-200">
                {roleFit}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Fit for listed role
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <StatCard
          title="Rating"
          value={player.stats.rating.toFixed(2)}
          subtitle="overall form"
        />
        <StatCard
          title="ADR"
          value={player.stats.adr.toFixed(1)}
          subtitle="damage output"
        />
        <StatCard
          title="K/D"
          value={player.stats.kd.toFixed(2)}
          subtitle="survival value"
        />
        <StatCard
          title="KAST"
          value={`${player.stats.kast.toFixed(1)}%`}
          subtitle="round involvement"
        />
        <StatCard
          title="Weapon"
          value={weaponProfile.primary.toString()}
          subtitle={weaponProfile.label}
        />
        <StatCard
          title="Price"
          value={`$${player.price}`}
          subtitle="builder value"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Performance profile">
          <div className="grid gap-4">
            <Metric label="Impact" value={player.stats.impact} />
            <Metric label="Opening Duels" value={player.stats.opening} />
            <Metric label="Clutch" value={player.stats.clutch} />
            <Metric label="AWP Power" value={player.stats.awp} />
            <Metric label="Rifle Power" value={player.stats.rifle} />
            <Metric label="Consistency" value={player.stats.consistency} />
            <Metric label="Role Fit Score" value={roleFit} />
          </div>
        </Panel>

        <Panel title="Player read">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Role identity
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getRoleRead(player)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Roster builder usage
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getRosterBuilderAdvice(player, roleFit)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                Traits
              </p>
              <div className="flex flex-wrap gap-2">
                {player.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-200"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Strengths / weaknesses">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-black uppercase tracking-wider text-emerald-200">
                Strengths
              </p>
              <div className="mt-3 grid gap-2">
                {strengths.map((item) => (
                  <span key={item} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-emerald-50">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-black uppercase tracking-wider text-amber-200">
                Watch points
              </p>
              <div className="mt-3 grid gap-2">
                {weaknesses.map((item) => (
                  <span key={item} className="rounded-xl bg-black/20 px-3 py-2 text-sm text-amber-50">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Weapon profile">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Primary identity
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {weaponProfile.label}
                  </p>
                </div>
                <Score value={weaponProfile.primary} />
              </div>
            </div>

            <Metric label="AWP Power" value={player.stats.awp} />
            <Metric label="Rifle Power" value={player.stats.rifle} />
            <Metric label="Weapon Balance" value={weaponProfile.balance} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Best map fits">
          <div className="grid gap-3">
            {bestMapFits.map(({ map, score, reason }) => (
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

        <Panel title="Team fit suggestions">
          <div className="grid gap-3">
            {teamFits.map(({ team, score, reason }) => (
              <button
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-purple-300/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{reason}</div>
                  </div>
                  <Score value={score} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Similar players">
        <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">
          Similarity is calculated from role fit, Impact Index, rating, clutch,
          opening pressure, weapon profile, consistency and price. Current values
          are MVP demo scores, not official statistics.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {similarPlayers.map(({ player: similarPlayer, score, reasons }) => (
            <button
              key={similarPlayer.id}
              onClick={() => navigate(`/players/${similarPlayer.id}`)}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">{similarPlayer.nickname}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {similarPlayer.country} · {getTeamName(similarPlayer.teamId, teams)}
                  </p>
                </div>
                <Score value={score} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <RoleBadge role={similarPlayer.role} />
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                  Impact {getPlayerImpact(similarPlayer)}
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-slate-300"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </section>
  );
}

type SimilarPlayerResult = {
  player: CS2Player;
  score: number;
  reasons: string[];
};

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

function weightedScore(entries: Array<[number, number]>) {
  return Math.round(entries.reduce((sum, [value, weight]) => sum + value * weight, 0));
}

function ratingToScore(rating: number) {
  return Math.max(0, Math.min(100, Math.round(((rating - 0.85) / 0.45) * 100)));
}

function getPlayerWeaponProfile(player: CS2Player) {
  const primary = Math.max(player.stats.awp, player.stats.rifle);
  const secondary = Math.min(player.stats.awp, player.stats.rifle);
  const balance = Math.round(100 - Math.min(100, Math.abs(player.stats.awp - player.stats.rifle)));

  if (player.stats.awp >= 72 && player.stats.awp >= player.stats.rifle) {
    return {
      label: "AWP primary",
      primary,
      secondary,
      balance,
    };
  }

  if (player.stats.awp >= 42 && player.stats.rifle >= 70) {
    return {
      label: "Hybrid weapon profile",
      primary,
      secondary,
      balance,
    };
  }

  return {
    label: "Rifle primary",
    primary,
    secondary,
    balance,
  };
}

function getPlayerStrengths(player: CS2Player) {
  const entries = [
    ["High round impact", player.stats.impact],
    ["Strong opening pressure", player.stats.opening],
    ["Late-round clutch value", player.stats.clutch],
    ["Elite AWP profile", player.stats.awp],
    ["Rifle firepower", player.stats.rifle],
    ["Stable consistency", player.stats.consistency],
    ["Strong role fit", getRoleFitScore(player)],
  ] as const;

  return [...entries]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value]) => `${label}: ${Math.round(value)}/100`);
}

function getPlayerWeaknesses(player: CS2Player) {
  const watchPoints: string[] = [];

  if (player.role !== "AWPer" && player.stats.awp < 20) {
    watchPoints.push("Limited secondary AWP value");
  }

  if (player.role === "AWPer" && player.stats.rifle < 55) {
    watchPoints.push("Rifle output may be secondary");
  }

  if (player.stats.opening < 55 && (player.role === "Entry" || player.role === "Star Rifler")) {
    watchPoints.push("Opening pressure needs support");
  }

  if (player.stats.clutch < 65) {
    watchPoints.push("Late-round value is not the main strength");
  }

  if (player.stats.consistency < 72) {
    watchPoints.push("Consistency is the main volatility risk");
  }

  if (player.price >= 8) {
    watchPoints.push("Expensive roster-builder slot");
  }

  if (watchPoints.length === 0) {
    watchPoints.push("No major red flag in current MVP profile");
  }

  return watchPoints.slice(0, 3);
}

function getRosterBuilderAdvice(player: CS2Player, roleFit: number) {
  if (player.price >= 8 && roleFit >= 86) {
    return `${player.nickname} is a premium pick. Use him as a core piece and save budget with IGL/support roles around him.`;
  }

  if (player.role === "AWPer") {
    return `${player.nickname} should be treated as the primary AWP slot. Avoid pairing him with another expensive pure AWPer unless the roster has enough structure.`;
  }

  if (player.role === "Entry") {
    return `${player.nickname} gives the roster opening pressure. Pair him with a strong trader, a structured IGL and at least one stable anchor.`;
  }

  if (player.role === "IGL" || player.role === "Support") {
    return `${player.nickname} is useful when the roster already has star firepower and needs structure, utility discipline and role balance.`;
  }

  if (player.role === "Anchor") {
    return `${player.nickname} improves CT stability. He is a strong fit when the roster already has enough entry and AWP power.`;
  }

  return `${player.nickname} is a flexible roster-builder pick. Use him to complete role balance without sacrificing too much firepower.`;
}

function getBestMapFits(player: CS2Player, limit = 3) {
  return maps
    .map((map) => {
      const roleBonus = map.bestRoles.includes(player.role)
        ? 18
        : map.bestRoles.some((role) => getRoleFamily(role) === getRoleFamily(player.role))
          ? 10
          : 4;

      const score = Math.round(
        map.awpValue * (player.stats.awp / 100) * 0.24 +
          map.entryValue * (player.stats.opening / 100) * 0.2 +
          map.anchorPressure * (getStructureProfileScore(player) / 100) * 0.18 +
          map.ctSideStrength * (player.stats.consistency / 100) * 0.16 +
          map.tSideDifficulty * (player.stats.impact / 100) * 0.14 +
          roleBonus,
      );

      return {
        map,
        score: Math.max(0, Math.min(100, score)),
        reason: getMapFitReason(player, map),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getMapFitReason(player: CS2Player, map: CS2MapProfile) {
  if (map.bestRoles.includes(player.role)) {
    return `${player.role} is one of the best role fits for ${map.name}.`;
  }

  if (player.role === "AWPer" && map.awpValue >= 78) {
    return "High AWP value map with strong angle-control potential.";
  }

  if ((player.role === "Entry" || player.role === "Star Rifler") && map.entryValue >= 76) {
    return "Good map for pressure riflers and opening duels.";
  }

  if ((player.role === "Anchor" || player.role === "Support") && map.anchorPressure >= 76) {
    return "Good fit for stable site play and utility discipline.";
  }

  return `${map.identity}.`;
}

function getStructureProfileScore(player: CS2Player) {
  if (player.role === "IGL" || player.role === "Support" || player.role === "Anchor") {
    return Math.round(player.stats.consistency * 0.65 + player.stats.clutch * 0.35);
  }

  return Math.round(player.stats.consistency * 0.5 + player.stats.rifle * 0.3 + player.stats.clutch * 0.2);
}

function getTeamFitSuggestions(player: CS2Player, limit = 3) {
  return teams
    .map((team) => {
      const roster = players.filter((item) => team.players.includes(item.id));
      const sameRoleCount = roster.filter((item) => item.role === player.role).length;
      const currentTeamBonus = team.id === player.teamId ? 8 : 0;
      const roleNeedBonus = sameRoleCount === 0 ? 18 : sameRoleCount === 1 ? 8 : 1;
      const firepowerNeedBonus = team.scores.firepower < 82 && player.stats.impact >= 82 ? 10 : 0;
      const structureNeedBonus =
        team.scores.structure < 78 && (player.role === "IGL" || player.role === "Support" || player.role === "Anchor") ? 10 : 0;

      const score = Math.round(
        team.scores.form * 0.18 +
          team.scores.structure * 0.2 +
          team.scores.firepower * 0.18 +
          getRoleFitScore(player) * 0.22 +
          getPlayerImpact(player) * 0.12 +
          roleNeedBonus +
          firepowerNeedBonus +
          structureNeedBonus +
          currentTeamBonus,
      );

      return {
        team,
        score: Math.max(0, Math.min(100, score)),
        reason: getTeamFitReason(player, team, sameRoleCount),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getTeamFitReason(player: CS2Player, team: (typeof teams)[number], sameRoleCount: number) {
  if (team.id === player.teamId) {
    return "Current team context with existing role familiarity.";
  }

  if (sameRoleCount === 0) {
    return `Adds a missing ${player.role} profile to the roster.`;
  }

  if (team.scores.firepower < 82 && player.stats.impact >= 82) {
    return "Raises firepower and round impact.";
  }

  if (team.scores.structure < 78 && (player.role === "IGL" || player.role === "Support" || player.role === "Anchor")) {
    return "Improves structure and role discipline.";
  }

  return "Good statistical fit with the team's current profile.";
}

function getSimilarPlayers(player: CS2Player, limit = 4): SimilarPlayerResult[] {
  return players
    .filter((candidate) => candidate.id !== player.id)
    .map((candidate) => ({
      player: candidate,
      score: getPlayerSimilarityScore(player, candidate),
      reasons: getSimilarityReasons(player, candidate),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getPlayerSimilarityScore(base: CS2Player, candidate: CS2Player) {
  const roleScore = base.role === candidate.role ? 100 : getRoleFamily(base.role) === getRoleFamily(candidate.role) ? 74 : 42;
  const impactScore = closeness(getPlayerImpact(base), getPlayerImpact(candidate), 24);
  const ratingScore = closeness(base.stats.rating * 100, candidate.stats.rating * 100, 18);
  const clutchScore = closeness(base.stats.clutch, candidate.stats.clutch, 28);
  const openingScore = closeness(base.stats.opening, candidate.stats.opening, 32);
  const weaponScore = closeness(getWeaponProfileScore(base), getWeaponProfileScore(candidate), 48);
  const consistencyScore = closeness(base.stats.consistency, candidate.stats.consistency, 28);
  const priceScore = closeness(base.price, candidate.price, 6);

  return Math.round(
    roleScore * 0.22 +
      impactScore * 0.18 +
      ratingScore * 0.12 +
      clutchScore * 0.11 +
      openingScore * 0.11 +
      weaponScore * 0.12 +
      consistencyScore * 0.08 +
      priceScore * 0.06,
  );
}

function closeness(left: number, right: number, maxDifference: number) {
  const difference = Math.abs(left - right);
  return Math.max(0, Math.round(100 - (difference / maxDifference) * 100));
}

function getWeaponProfileScore(player: CS2Player) {
  return player.stats.awp * 0.55 + player.stats.rifle * 0.45;
}

function getRoleFamily(role: PlayerRole) {
  if (role === "AWPer") return "awp";
  if (role === "Entry" || role === "Star Rifler") return "aggressive-rifle";
  if (role === "Lurker" || role === "Flex") return "space";
  if (role === "Anchor" || role === "Support" || role === "IGL") return "structure";
  return "other";
}

function getSimilarityReasons(base: CS2Player, candidate: CS2Player) {
  const reasons: string[] = [];

  if (base.role === candidate.role) {
    reasons.push(`Same role: ${candidate.role}`);
  } else if (getRoleFamily(base.role) === getRoleFamily(candidate.role)) {
    reasons.push("Similar role family");
  }

  if (Math.abs(getPlayerImpact(base) - getPlayerImpact(candidate)) <= 8) {
    reasons.push("Close impact level");
  }

  if (Math.abs(base.stats.opening - candidate.stats.opening) <= 10) {
    reasons.push("Similar opening pressure");
  }

  if (Math.abs(base.stats.clutch - candidate.stats.clutch) <= 10) {
    reasons.push("Comparable clutch value");
  }

  if (Math.abs(getWeaponProfileScore(base) - getWeaponProfileScore(candidate)) <= 12) {
    reasons.push("Similar weapon profile");
  }

  if (reasons.length < 3 && Math.abs(base.price - candidate.price) <= 2) {
    reasons.push("Similar roster price");
  }

  if (reasons.length < 3) {
    reasons.push("Comparable statistical shape");
  }

  return reasons.slice(0, 3);
}

function getPlayerSummary(player: CS2Player) {
  if (player.role === "AWPer") {
    return `${player.nickname} — AWP-игрок с высоким влиянием на раунд. Его ценность строится вокруг первого контакта, контроля углов и способности стабилизировать команду в поздних ситуациях.`;
  }

  if (player.role === "Entry") {
    return `${player.nickname} — aggressive entry, который создаёт пространство для команды. Такой игрок может умирать чаще, но его главная задача — ломать структуру защиты и открывать раунд.`;
  }

  if (player.role === "Star Rifler") {
    return `${player.nickname} — главный rifle-керри состава. Он должен стабильно давать урон, выигрывать дуэли и оставаться опасным как на T-side, так и на CT-side.`;
  }

  if (player.role === "Lurker") {
    return `${player.nickname} — lurker с фокусом на поздний раунд, тайминги и наказание ротаций. Его ценность не только во фрагах, но и в давлении на карту.`;
  }

  if (player.role === "Anchor") {
    return `${player.nickname} — anchor, который держит сайт, экономит ресурсы команды и снижает хаос в защите. Это не самая яркая роль, но она критична для структуры.`;
  }

  if (player.role === "Support") {
    return `${player.nickname} — support-игрок, который помогает звёздам раскрыться через utility, trade setup и дисциплину в командной структуре.`;
  }

  if (player.role === "IGL") {
    return `${player.nickname} — IGL. Его ценность не всегда видна в rating, потому что главная работа — структура, mid-round решения и управление темпом команды.`;
  }

  return `${player.nickname} — flex-игрок, который может закрывать несколько задач и адаптироваться под нужды состава.`;
}

function getRoleRead(player: CS2Player) {
  const bestWeaponProfile =
    player.stats.awp > player.stats.rifle ? "AWP" : "rifle";

  return `Основной профиль: ${player.role}. Сильнейшая сторона по данным MVP: ${bestWeaponProfile}. Clutch ${player.stats.clutch}/100, consistency ${player.stats.consistency}/100, opening pressure ${player.stats.opening}/100.`;
}

