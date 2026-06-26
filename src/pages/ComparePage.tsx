import { useMemo, useState } from "react";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact, getTeamName } from "../lib";
import { Panel } from "../components/Panel";
import { Score } from "../components/Score";
import { PlayerProfile } from "../components/PlayerProfile";

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

type CompareRow = {
  label: string;
  left: number;
  right: number;
  kind: "score" | "rating" | "adr" | "kd" | "kast" | "price";
  winner: "left" | "right" | "tie";
};

export function ComparePage() {
  const [leftId, setLeftId] = useState(players[0].id);
  const [rightId, setRightId] = useState(players[1]?.id ?? players[0].id);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const left = players.find((player) => player.id === leftId) ?? players[0];
  const right = players.find((player) => player.id === rightId) ?? players[1] ?? players[0];
  const rows = getCompareRows(left, right);
  const verdict = getComparisonVerdict(left, right, rows);

  function swapPlayers() {
    setLeftId(right.id);
    setRightId(left.id);
    setLeftSearch("");
    setRightSearch("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Compare"
          description="Сравнение игроков 2.0: поиск, swap, победитель по категориям и итоговый аналитический вывод."
        />

        <button
          onClick={swapPlayers}
          className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Swap players
        </button>
      </div>

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

      <div className="grid gap-4 md:grid-cols-3">
        <CompareSummaryCard
          title="Overall edge"
          value={verdict.winner}
          subtitle={verdict.summary}
        />
        <CompareSummaryCard
          title={`${left.nickname} edge`}
          value={verdict.leftWins.toString()}
          subtitle="categories won"
        />
        <CompareSummaryCard
          title={`${right.nickname} edge`}
          value={verdict.rightWins.toString()}
          subtitle="categories won"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlayerProfile player={left} />
        <PlayerProfile player={right} />
      </div>

      <Panel title={`${left.nickname} vs ${right.nickname}`}>
        <div className="grid gap-4">
          {rows.map((row) => (
            <CompareMetricDetailed key={row.label} row={row} left={left} right={right} />
          ))}
        </div>
      </Panel>

      <Panel title="Category winners">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">{left.nickname}</th>
                <th className="px-3 py-3">{right.nickname}</th>
                <th className="px-3 py-3">Edge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/10">
                  <td className="px-3 py-3 font-bold text-white">{row.label}</td>
                  <td className="px-3 py-3 text-slate-300">{formatCompareValue(row.left, row.kind)}</td>
                  <td className="px-3 py-3 text-slate-300">{formatCompareValue(row.right, row.kind)}</td>
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              {left.nickname}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getPlayerCompareRead(left, right)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-purple-300">
              {right.nickname}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getPlayerCompareRead(right, left)}
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
          teamName.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
      .slice(0, 8);
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
            {getTeamName(selectedPlayer.teamId, teams)} · {selectedPlayer.role}
          </p>
        </div>
        <Score value={getPlayerImpact(selectedPlayer)} />
      </div>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-slate-400">Search player</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="m0NESY, donk, Vitality, AWPer..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-4 grid max-h-[360px] gap-2 overflow-y-auto pr-1">
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
                  {getTeamName(player.teamId, teams)} · {player.country} · {player.role}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-cyan-300">{getPlayerImpact(player)}</div>
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

function CompareMetricDetailed({
  row,
  left,
  right,
}: {
  row: CompareRow;
  left: CS2Player;
  right: CS2Player;
}) {
  const maxValue = Math.max(row.left, row.right, 1);
  const leftWidth = Math.max(3, Math.round((row.left / maxValue) * 100));
  const rightWidth = Math.max(3, Math.round((row.right / maxValue) * 100));

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-black text-white">{row.label}</div>
          <div className="mt-1 text-xs text-slate-500">
            {formatCompareValue(row.left, row.kind)} vs {formatCompareValue(row.right, row.kind)}
          </div>
        </div>
        <CompareWinnerBadge winner={row.winner} left={left} right={right} />
      </div>

      <div className="grid gap-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{left.nickname}</span>
            <span>{formatCompareValue(row.left, row.kind)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${leftWidth}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{right.nickname}</span>
            <span>{formatCompareValue(row.right, row.kind)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400" style={{ width: `${rightWidth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareWinnerBadge({
  winner,
  left,
  right,
}: {
  winner: CompareRow["winner"];
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
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${className}`}>
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
    { label: "Impact Index", left: getPlayerImpact(left), right: getPlayerImpact(right), kind: "score" },
    { label: "Rating", left: left.stats.rating, right: right.stats.rating, kind: "rating" },
    { label: "ADR", left: left.stats.adr, right: right.stats.adr, kind: "adr" },
    { label: "K/D", left: left.stats.kd, right: right.stats.kd, kind: "kd" },
    { label: "KAST", left: left.stats.kast, right: right.stats.kast, kind: "kast" },
    { label: "Opening", left: left.stats.opening, right: right.stats.opening, kind: "score" },
    { label: "Clutch", left: left.stats.clutch, right: right.stats.clutch, kind: "score" },
    { label: "AWP Power", left: left.stats.awp, right: right.stats.awp, kind: "score" },
    { label: "Rifle Power", left: left.stats.rifle, right: right.stats.rifle, kind: "score" },
    { label: "Consistency", left: left.stats.consistency, right: right.stats.consistency, kind: "score" },
    { label: "Roster Price", left: left.price, right: right.price, kind: "price" },
  ];

  return rawRows.map((row) => ({
    ...row,
    winner: getRowWinner(row.left, row.right, row.kind),
  }));
}

function getRowWinner(left: number, right: number, kind: CompareRow["kind"]): CompareRow["winner"] {
  const tolerance = kind === "rating" || kind === "kd" ? 0.01 : 1;

  if (Math.abs(left - right) <= tolerance) {
    return "tie";
  }

  return left > right ? "left" : "right";
}

function getComparisonVerdict(left: CS2Player, right: CS2Player, rows: CompareRow[]) {
  const leftWins = rows.filter((row) => row.winner === "left").length;
  const rightWins = rows.filter((row) => row.winner === "right").length;
  const impactDiff = getPlayerImpact(left) - getPlayerImpact(right);

  if (leftWins === rightWins || Math.abs(impactDiff) <= 2) {
    return {
      winner: "Even",
      leftWins,
      rightWins,
      summary: "very close profile",
    };
  }

  if (leftWins > rightWins) {
    return {
      winner: left.nickname,
      leftWins,
      rightWins,
      summary: `edge by ${leftWins - rightWins} categories`,
    };
  }

  return {
    winner: right.nickname,
    leftWins,
    rightWins,
    summary: `edge by ${rightWins - leftWins} categories`,
  };
}

function formatCompareValue(value: number, kind: CompareRow["kind"]) {
  if (kind === "rating" || kind === "kd") return value.toFixed(2);
  if (kind === "adr") return value.toFixed(1);
  if (kind === "kast") return `${value.toFixed(1)}%`;
  if (kind === "price") return `$${value}`;
  return Math.round(value).toString();
}

function getPlayerCompareRead(player: CS2Player, opponent: CS2Player) {
  const playerImpact = getPlayerImpact(player);
  const opponentImpact = getPlayerImpact(opponent);
  const impactText =
    playerImpact > opponentImpact + 2
      ? "имеет преимущество по общему impact"
      : playerImpact < opponentImpact - 2
        ? "уступает по общему impact"
        : "примерно равен сопернику по общему impact";

  const strongestArea = getPlayerStrongestCompareArea(player);
  const roleContext =
    player.role === opponent.role
      ? `Это прямое сравнение внутри роли ${player.role}.`
      : `Сравнение разных ролей: ${player.role} против ${opponent.role}.`;

  return `${roleContext} ${player.nickname} ${impactText}. Главная сильная зона: ${strongestArea}. Цена в билдере: $${player.price}.`;
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

