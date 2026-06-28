import type { CS2Player } from "./types";

export function getTeamName(teamId: string, teams: { id: string; name: string }[]) {
  return teams.find((team) => team.id === teamId)?.name ?? "Free Agent";
}

export function getPlayerImpact(player: CS2Player) {
  const s = player.stats;

  return Math.round(
    s.impact * 0.25 +
      s.opening * 0.2 +
      s.clutch * 0.15 +
      s.consistency * 0.2 +
      Math.max(s.awp, s.rifle) * 0.2,
  );
}

export function getRosterScore(players: CS2Player[]) {
  if (players.length === 0) {
    return {
      firepower: 0,
      awp: 0,
      entry: 0,
      clutch: 0,
      structure: 0,
      total: 0,
    };
  }

  const average = (values: number[]) =>
    Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

  const hasIGL = players.some((player) => player.role === "IGL");
  const hasAWPer = players.some((player) => player.role === "AWPer");
  const hasEntry = players.some((player) => player.role === "Entry");
  const hasSupportOrAnchor = players.some(
    (player) => player.role === "Support" || player.role === "Anchor",
  );

  const firepower = average(
    players.map((player) => Math.max(player.stats.rifle, player.stats.impact)),
  );
  const awp = hasAWPer ? Math.max(...players.map((player) => player.stats.awp)) : 25;
  const entry = hasEntry
    ? Math.max(...players.map((player) => player.stats.opening))
    : 35;
  const clutch = average(players.map((player) => player.stats.clutch));

  let structure = average(players.map((player) => player.stats.consistency));
  if (hasIGL) structure += 8;
  if (hasSupportOrAnchor) structure += 6;
  if (!hasAWPer) structure -= 10;
  if (!hasEntry) structure -= 8;

  structure = Math.max(0, Math.min(100, structure));

  const total = Math.round(
    firepower * 0.3 + awp * 0.18 + entry * 0.18 + clutch * 0.16 + structure * 0.18,
  );

  return {
    firepower,
    awp,
    entry,
    clutch,
    structure,
    total,
  };
}

export function getRosterWarnings(players: CS2Player[]) {
  const warnings: string[] = [];

  if (players.length < 5) {
    warnings.push("Нужно выбрать 5 игроков.");
  }

  if (!players.some((player) => player.role === "AWPer")) {
    warnings.push("Нет основного AWP.");
  }

  if (!players.some((player) => player.role === "Entry")) {
    warnings.push("Нет entry-игрока для создания пространства.");
  }

  if (!players.some((player) => player.role === "IGL")) {
    warnings.push("Нет IGL. Структура состава будет слабее.");
  }

  if (!players.some((player) => player.role === "Support" || player.role === "Anchor")) {
    warnings.push("Нет support/anchor игрока. Состав слишком жадный по ролям.");
  }

  return warnings;
}
