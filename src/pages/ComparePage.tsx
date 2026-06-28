import { useMemo, useState } from "react";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact, getTeamName } from "../lib";
import { Panel } from "../components/Panel";
import { RoleBadge } from "../components/RoleBadge";
import { Score } from "../components/Score";
import { PlayerProfile } from "../components/PlayerProfile";

type CompareDirection = "higher" | "lower";

type CompareKind =
  | "score"
  | "rating"
  | "adr"
  | "kd"
  | "kast"
  | "price"
  | "value";

type CompareWinner = "left" | "right" | "tie";

type CompareRow = {
  label: string;
  description: string;
  left: number;
  right: number;
  kind: CompareKind;
  direction: CompareDirection;
  winner: CompareWinner;
};

type ComparePreset = {
  id: string;
  label: string;
  description: string;
  leftId: string;
  rightId: string;
};

type CompareDimension = {
  label: string;
  description: string;
  left: number;
  right: number;
  winner: CompareWinner;
};

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

export function ComparePage() {
  const initialLeft = players[0];
  const initialRight = players[1] ?? players[0];

  const [leftId, setLeftId] = useState(initialLeft.id);
  const [rightId, setRightId] = useState(initialRight.id);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const left = players.find((player) => player.id === leftId) ?? initialLeft;
  const right =
    players.find((player) => player.id === rightId) ?? players[1] ?? initialLeft;

  const rows = useMemo(() => getCompareRows(left, right), [left, right]);
  const dimensions = useMemo(() => getCompareDimensions(left, right), [left, right]);
  const verdict = useMemo(
    () => getComparisonVerdict(left, right, rows, dimensions),
    [left, right, rows, dimensions],
  );
  const presets = useMemo(() => getComparePresets(), []);

  function swapPlayers() {
    setLeftId(right.id);
    setRightId(left.id);
    setLeftSearch("");
    setRightSearch("");
  }

  function applyPreset(preset: ComparePreset) {
    setLeftId(preset.leftId);
    setRightId(preset.rightId);
    setLeftSearch("");
    setRightSearch("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Compare"
          description="Сравнение игроков: поиск, быстрые пресеты, победитель по каждой метрике, профильные категории и итоговый аналитический вывод."
        />

        <button
          onClick={swapPlayers}
          className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Swap players
        </button>
      </div>

      <Panel title="Quick presets">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <p className="text-sm font-black text-white">{preset.label}</p>
              <p className="mt-1 text-xs text-slate-500">{preset.description}</p>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <ComparePlayerPicker
          title="Left player"
          selectedPlayer={left}
          selectedId={leftId}
          searchQuery={leftSearch}
          onSearchChange={setLeftSearch}
          onSelect={(playerId) => {
            setLeftId(playerId);
            setLeftSearch("");
          }}
          blockedPlayerId={rightId}
        />

        <ComparePlayerPicker
          title="Right player"
          selectedPlayer={right}
          selectedId={rightId}
          searchQuery={rightSearch}
          onSearchChange={setRightSearch}
          onSelect={(playerId) => {
            setRightId(playerId);
            setRightSearch("");
          }}
          blockedPlayerId={leftId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <CompareSummaryCard
          title="Overall edge"
          value={verdict.winner}
          subtitle={verdict.summary}
        />
        <CompareSummaryCard
          title={`${left.nickname} wins`}
          value={verdict.leftWins.toString()}
          subtitle="metric rows"
        />
        <CompareSummaryCard
          title={`${right.nickname} wins`}
          value={verdict.rightWins.toString()}
          subtitle="metric rows"
        />
        <CompareSummaryCard
          title="Closest area"
          value={verdict.closestMetric}
          subtitle="smallest gap"
        />
      </div>

      <Panel title="Profile summary">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {dimensions.map((dimension) => (
            <DimensionCard
              key={dimension.label}
              dimension={dimension}
              left={left}
              right={right}
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerProfile player={left} />
        <PlayerProfile player={right} />
      </div>

      <Panel title={`${left.nickname} vs ${right.nickname}`}>
        <div className="grid gap-4">
          {rows.map((row) => (
            <CompareMetricDetailed
              key={row.label}
              row={row}
              left={left}
              right={right}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Comparison table">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-3">Metric</th>
                <th className="px-3 py-3">{left.nickname}</th>
                <th className="px-3 py-3">{right.nickname}</th>
                <th className="px-3 py-3">Delta</th>
                <th className="px-3 py-3">Better</th>
                <th className="px-3 py-3">Edge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <div className="font-bold text-white">{row.label}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.description}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {formatCompareValue(row.left, row.kind)}
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {formatCompareValue(row.right, row.kind)}
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-200">
                    {formatDelta(row)}
                  </td>
                  <td className="px-3 py-3 text-slate-400">
                    {row.direction === "higher" ? "higher" : "lower"}
                  </td>
                  <td className="px-3 py-3">
                    <CompareWinnerBadge winner={row.winner} left={left} right={right} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Analytical read">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.04] p-4 md:col-span-1">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              Verdict
            </p>
            <p className="mt-2 text-sm text-slate-300">{verdict.read}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              {left.nickname}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getPlayerCompareRead(left, right, dimensions)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-purple-300">
              {right.nickname}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getPlayerCompareRead(right, left, dimensions)}
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}

function ComparePlayerPicker({
  title,
  selectedPlayer,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  blockedPlayerId,
}: {
  title: string;
  selectedPlayer: CS2Player;
  selectedId: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (playerId: string) => void;
  blockedPlayerId: string;
}) {
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        const teamName = getTeamName(player.teamId, teams);

        return (
          normalizedQuery.length === 0 ||
          player.nickname.toLowerCase().includes(normalizedQuery) ||
          player.country.toLowerCase().includes(normalizedQuery) ||
          player.role.toLowerCase().includes(normalizedQuery) ||
          teamName.toLowerCase().includes(normalizedQuery) ||
          player.traits.some((trait) => trait.toLowerCase().includes(normalizedQuery))
        );
      })
      .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
      .slice(0, 10);
  }, [searchQuery]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-black">{selectedPlayer.nickname}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {getTeamName(selectedPlayer.teamId, teams)} · {selectedPlayer.country}
          </p>
        </div>
        <Score value={getPlayerImpact(selectedPlayer)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={selectedPlayer.role} />
        {selectedPlayer.traits.slice(0, 3).map((trait) => (
          <span
            key={trait}
            className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300"
          >
            {trait}
          </span>
        ))}
      </div>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-slate-400">Search player</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="m0NESY, donk, Vitality, AWPer, Clutch..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-4 grid max-h-[390px] gap-2 overflow-y-auto pr-1">
        {filteredPlayers.map((player) => {
          const isSelected = player.id === selectedId;
          const isBlocked = player.id === blockedPlayerId;

          return (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              disabled={isBlocked}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-300/10"
                  : isBlocked
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                    : "border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.06]"
              }`}
            >
              <div>
                <div className="font-black text-white">{player.nickname}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {getTeamName(player.teamId, teams)} · {player.country} ·{" "}
                  {player.role}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-cyan-300">
                  {getPlayerImpact(player)}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {isBlocked ? "selected" : `$${player.price}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DimensionCard({
  dimension,
  left,
  right,
}: {
  dimension: CompareDimension;
  left: CS2Player;
  right: CS2Player;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {dimension.label}
      </p>
      <p className="mt-1 text-xs text-slate-500">{dimension.description}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-cyan-200">{left.nickname}</div>
          <div className="text-2xl font-black">{dimension.left}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-purple-200">{right.nickname}</div>
          <div className="text-2xl font-black">{dimension.right}</div>
        </div>
      </div>

      <div className="mt-3">
        <CompareWinnerBadge winner={dimension.winner} left={left} right={right} />
      </div>
    </div>
  );
}

function CompareMetricDetailed({
  row,
  left,
  right,
}: {
  row: CompareRow;
  left: CS2Player;
  right: CS2Player;
}) {
  const leftScore = getNormalizedBarValue(row.left, row);
  const rightScore = getNormalizedBarValue(row.right, row);
  const maxValue = Math.max(leftScore, rightScore, 1);
  const leftWidth = Math.max(3, Math.round((leftScore / maxValue) * 100));
  const rightWidth = Math.max(3, Math.round((rightScore / maxValue) * 100));

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-black text-white">{row.label}</div>
          <div className="mt-1 text-xs text-slate-500">
            {row.description} · {formatCompareValue(row.left, row.kind)} vs{" "}
            {formatCompareValue(row.right, row.kind)}
          </div>
        </div>
        <CompareWinnerBadge winner={row.winner} left={left} right={right} />
      </div>

      <div className="grid gap-2">
        <MetricBar
          label={left.nickname}
          value={formatCompareValue(row.left, row.kind)}
          width={leftWidth}
          tone="cyan"
        />
        <MetricBar
          label={right.nickname}
          value={formatCompareValue(row.right, row.kind)}
          width={rightWidth}
          tone="purple"
        />
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: string;
  width: number;
  tone: "cyan" | "purple";
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${
            tone === "cyan" ? "bg-cyan-300" : "bg-purple-400"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function CompareWinnerBadge({
  winner,
  left,
  right,
}: {
  winner: CompareWinner;
  left: CS2Player;
  right: CS2Player;
}) {
  if (winner === "tie") {
    return (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
        Tie
      </span>
    );
  }

  const winnerName = winner === "left" ? left.nickname : right.nickname;
  const className =
    winner === "left"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
      : "border-purple-300/20 bg-purple-300/10 text-purple-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${className}`}
    >
      {winnerName}
    </span>
  );
}

function CompareSummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function getCompareRows(left: CS2Player, right: CS2Player): CompareRow[] {
  const rawRows: Omit<CompareRow, "winner">[] = [
    {
      label: "Impact Index",
      description: "custom ClutchLab impact",
      left: getPlayerImpact(left),
      right: getPlayerImpact(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Rating",
      description: "overall statistical level",
      left: left.stats.rating,
      right: right.stats.rating,
      kind: "rating",
      direction: "higher",
    },
    {
      label: "ADR",
      description: "damage output",
      left: left.stats.adr,
      right: right.stats.adr,
      kind: "adr",
      direction: "higher",
    },
    {
      label: "K/D",
      description: "fragging efficiency",
      left: left.stats.kd,
      right: right.stats.kd,
      kind: "kd",
      direction: "higher",
    },
    {
      label: "KAST",
      description: "round participation stability",
      left: left.stats.kast,
      right: right.stats.kast,
      kind: "kast",
      direction: "higher",
    },
    {
      label: "Opening",
      description: "entry and first-contact value",
      left: left.stats.opening,
      right: right.stats.opening,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Clutch",
      description: "late-round conversion",
      left: left.stats.clutch,
      right: right.stats.clutch,
      kind: "score",
      direction: "higher",
    },
    {
      label: "AWP Power",
      description: "sniping value",
      left: left.stats.awp,
      right: right.stats.awp,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Rifle Power",
      description: "rifle duel value",
      left: left.stats.rifle,
      right: right.stats.rifle,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Consistency",
      description: "floor and repeatability",
      left: left.stats.consistency,
      right: right.stats.consistency,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Roster Price",
      description: "builder cost, lower is better",
      left: left.price,
      right: right.price,
      kind: "price",
      direction: "lower",
    },
    {
      label: "Value / $",
      description: "impact per price",
      left: getPlayerValue(left),
      right: getPlayerValue(right),
      kind: "value",
      direction: "higher",
    },
  ];

  return rawRows.map((row) => ({
    ...row,
    winner: getRowWinner(row.left, row.right, row.direction, row.kind),
  }));
}

function getCompareDimensions(left: CS2Player, right: CS2Player): CompareDimension[] {
  const rawDimensions: Omit<CompareDimension, "winner">[] = [
    {
      label: "Aim",
      description: "rifle + rating + ADR",
      left: getAimProfile(left),
      right: getAimProfile(right),
    },
    {
      label: "AWP",
      description: "AWP value",
      left: left.stats.awp,
      right: right.stats.awp,
    },
    {
      label: "Entry",
      description: "opening pressure",
      left: left.stats.opening,
      right: right.stats.opening,
    },
    {
      label: "Clutch",
      description: "late rounds",
      left: left.stats.clutch,
      right: right.stats.clutch,
    },
    {
      label: "Stability",
      description: "KAST + consistency",
      left: getStabilityProfile(left),
      right: getStabilityProfile(right),
    },
    {
      label: "Value",
      description: "impact per budget",
      left: Math.round(getPlayerValue(left) * 10),
      right: Math.round(getPlayerValue(right) * 10),
    },
  ];

  return rawDimensions.map((dimension) => ({
    ...dimension,
    winner: getRowWinner(dimension.left, dimension.right, "higher", "score"),
  }));
}

function getRowWinner(
  left: number,
  right: number,
  direction: CompareDirection,
  kind: CompareKind,
): CompareWinner {
  const tolerance = kind === "rating" || kind === "kd" || kind === "value" ? 0.01 : 1;

  if (Math.abs(left - right) <= tolerance) {
    return "tie";
  }

  if (direction === "lower") {
    return left < right ? "left" : "right";
  }

  return left > right ? "left" : "right";
}

function getComparisonVerdict(
  left: CS2Player,
  right: CS2Player,
  rows: CompareRow[],
  dimensions: CompareDimension[],
) {
  const leftWins = rows.filter((row) => row.winner === "left").length;
  const rightWins = rows.filter((row) => row.winner === "right").length;
  const dimensionLeftWins = dimensions.filter(
    (dimension) => dimension.winner === "left",
  ).length;
  const dimensionRightWins = dimensions.filter(
    (dimension) => dimension.winner === "right",
  ).length;

  const closestMetric = getClosestMetric(rows);
  const impactDiff = getPlayerImpact(left) - getPlayerImpact(right);

  if (
    leftWins === rightWins ||
    Math.abs(impactDiff) <= 2 ||
    dimensionLeftWins === dimensionRightWins
  ) {
    return {
      winner: "Even",
      leftWins,
      rightWins,
      closestMetric,
      summary: "close profile",
      read: `${left.nickname} and ${right.nickname} are close overall. The better pick depends on role need and budget context.`,
    };
  }

  if (leftWins > rightWins || dimensionLeftWins > dimensionRightWins) {
    return {
      winner: left.nickname,
      leftWins,
      rightWins,
      closestMetric,
      summary: `edge by ${Math.max(leftWins - rightWins, 1)} metrics`,
      read: `${left.nickname} has the broader statistical edge, especially in ${getBestDimensionForPlayer(
        left,
        dimensions,
        "left",
      )}. ${right.nickname} can still be the better roster fit if role or price matters more.`,
    };
  }

  return {
    winner: right.nickname,
    leftWins,
    rightWins,
    closestMetric,
    summary: `edge by ${Math.max(rightWins - leftWins, 1)} metrics`,
    read: `${right.nickname} has the broader statistical edge, especially in ${getBestDimensionForPlayer(
      right,
      dimensions,
      "right",
    )}. ${left.nickname} can still be the better roster fit if role or price matters more.`,
  };
}

function getComparePresets(): ComparePreset[] {
  const topImpact = [...players].sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a));
  const awpers = getTopByRole("AWPer");
  const entries = getTopByRole("Entry");
  const riflers = [...players]
    .filter((player) =>
      ["Star Rifler", "Lurker", "Anchor", "Flex"].includes(player.role),
    )
    .sort((a, b) => b.stats.rifle - a.stats.rifle);
  const valuePlayers = [...players].sort(
    (a, b) => getPlayerValue(b) - getPlayerValue(a),
  );

  return [
    createPreset("top-impact", "Top impact", "best two by ClutchLab impact", topImpact),
    createPreset("awp-duel", "AWP duel", "best available AWP profiles", awpers),
    createPreset("entry-duel", "Entry duel", "space creators and openers", entries),
    createPreset("rifle-duel", "Rifle duel", "best rifle-heavy profiles", riflers),
    createPreset("value-duel", "Value duel", "impact per roster price", valuePlayers),
  ].filter((preset): preset is ComparePreset => Boolean(preset));
}

function createPreset(
  id: string,
  label: string,
  description: string,
  candidates: CS2Player[],
) {
  const left = candidates[0];
  const right = candidates.find((player) => player.id !== left?.id);

  if (!left || !right) return null;

  return {
    id,
    label,
    description,
    leftId: left.id,
    rightId: right.id,
  };
}

function getTopByRole(role: CS2Player["role"]) {
  return [...players]
    .filter((player) => player.role === role)
    .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a));
}

function getAimProfile(player: CS2Player) {
  return Math.round(
    player.stats.rifle * 0.45 +
      player.stats.rating * 20 +
      player.stats.adr * 0.25 +
      player.stats.consistency * 0.1,
  );
}

function getStabilityProfile(player: CS2Player) {
  return Math.round(player.stats.kast * 0.45 + player.stats.consistency * 0.55);
}

function getPlayerValue(player: CS2Player) {
  return getPlayerImpact(player) / Math.max(player.price, 1);
}

function getNormalizedBarValue(value: number, row: CompareRow) {
  if (row.direction === "higher") return value;

  const maxPrice = Math.max(...players.map((player) => player.price), 1);
  return maxPrice - value + 1;
}

function getClosestMetric(rows: CompareRow[]) {
  const closest = [...rows].sort((a, b) => {
    return getRelativeGap(a) - getRelativeGap(b);
  })[0];

  return closest?.label ?? "None";
}

function getRelativeGap(row: CompareRow) {
  const maxValue = Math.max(Math.abs(row.left), Math.abs(row.right), 1);
  return Math.abs(row.left - row.right) / maxValue;
}

function getBestDimensionForPlayer(
  player: CS2Player,
  dimensions: CompareDimension[],
  side: "left" | "right",
) {
  const winningDimensions = dimensions.filter((dimension) => dimension.winner === side);
  if (winningDimensions.length === 0) {
    return getPlayerStrongestCompareArea(player);
  }

  return winningDimensions
    .sort((a, b) => {
      const aGap = Math.abs(a.left - a.right);
      const bGap = Math.abs(b.left - b.right);
      return bGap - aGap;
    })[0].label.toLowerCase();
}

function formatCompareValue(value: number, kind: CompareKind) {
  if (kind === "rating" || kind === "kd") return value.toFixed(2);
  if (kind === "adr") return value.toFixed(1);
  if (kind === "kast") return `${value.toFixed(1)}%`;
  if (kind === "price") return `$${value}`;
  if (kind === "value") return value.toFixed(1);
  return Math.round(value).toString();
}

function formatDelta(row: CompareRow) {
  const delta = row.left - row.right;
  const absoluteDelta = Math.abs(delta);
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";

  if (row.kind === "price") {
    return `${sign}$${absoluteDelta}`;
  }

  if (row.kind === "rating" || row.kind === "kd" || row.kind === "value") {
    return `${sign}${absoluteDelta.toFixed(2)}`;
  }

  if (row.kind === "adr" || row.kind === "kast") {
    return `${sign}${absoluteDelta.toFixed(1)}`;
  }

  return `${sign}${Math.round(absoluteDelta)}`;
}

function getPlayerCompareRead(
  player: CS2Player,
  opponent: CS2Player,
  dimensions: CompareDimension[],
) {
  const playerImpact = getPlayerImpact(player);
  const opponentImpact = getPlayerImpact(opponent);
  const impactText =
    playerImpact > opponentImpact + 2
      ? "имеет преимущество по общему impact"
      : playerImpact < opponentImpact - 2
        ? "уступает по общему impact"
        : "примерно равен сопернику по общему impact";

  const strongestArea = getPlayerStrongestCompareArea(player);
  const dimensionWins = dimensions.filter((dimension) => {
    const playerIsLeft = dimension.left === getDimensionValue(player, dimension.label);
    if (dimension.winner === "tie") return false;
    return playerIsLeft ? dimension.winner === "left" : dimension.winner === "right";
  }).length;

  const roleContext =
    player.role === opponent.role
      ? `Это прямое сравнение внутри роли ${player.role}.`
      : `Сравнение разных ролей: ${player.role} против ${opponent.role}.`;

  return `${roleContext} ${player.nickname} ${impactText}. Главная сильная зона: ${strongestArea}. Выигранные profile dimensions: ${dimensionWins}/6. Цена в билдере: $${player.price}.`;
}

function getDimensionValue(player: CS2Player, label: string) {
  if (label === "Aim") return getAimProfile(player);
  if (label === "AWP") return player.stats.awp;
  if (label === "Entry") return player.stats.opening;
  if (label === "Clutch") return player.stats.clutch;
  if (label === "Stability") return getStabilityProfile(player);
  return Math.round(getPlayerValue(player) * 10);
}

function getPlayerStrongestCompareArea(player: CS2Player) {
  const entries = [
    ["opening pressure", player.stats.opening],
    ["clutch", player.stats.clutch],
    ["AWP power", player.stats.awp],
    ["rifle power", player.stats.rifle],
    ["consistency", player.stats.consistency],
  ] as const;

  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}
