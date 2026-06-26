import { useMemo, useState } from "react";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact } from "../lib";
import { Panel } from "../components/Panel";
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

type TeamCompareRow = {
  label: string;
  left: number;
  right: number;
  winner: "left" | "right" | "tie";
};

function getTeamStrongestArea(team: (typeof teams)[number]) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}

function getTeamWeakestArea(team: (typeof teams)[number]) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => a[1] - b[1])[0][0];
}

export function TeamComparePage() {
  const [leftId, setLeftId] = useState(teams[0].id);
  const [rightId, setRightId] = useState(teams[1]?.id ?? teams[0].id);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const left = teams.find((team) => team.id === leftId) ?? teams[0];
  const right = teams.find((team) => team.id === rightId) ?? teams[1] ?? teams[0];
  const rows = getTeamCompareRows(left, right);
  const verdict = getTeamComparisonVerdict(left, right, rows);
  const leftPlayers = getTeamPlayers(left);
  const rightPlayers = getTeamPlayers(right);
  const sharedMaps = left.bestMaps.filter((map) => right.bestMaps.includes(map));

  function swapTeams() {
    setLeftId(right.id);
    setRightId(left.id);
    setLeftSearch("");
    setRightSearch("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Team Compare"
          description="Сравнение команд по firepower, structure, map pool, clutch, form, roster balance и пересечению лучших карт."
        />

        <button
          onClick={swapTeams}
          className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Swap teams
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TeamComparePicker
          title="Left team"
          selectedTeam={left}
          selectedId={leftId}
          searchQuery={leftSearch}
          onSearchChange={setLeftSearch}
          onSelect={(teamId) => {
            setLeftId(teamId);
            setLeftSearch("");
          }}
          blockedTeamId={rightId}
        />

        <TeamComparePicker
          title="Right team"
          selectedTeam={right}
          selectedId={rightId}
          searchQuery={rightSearch}
          onSearchChange={setRightSearch}
          onSelect={(teamId) => {
            setRightId(teamId);
            setRightSearch("");
          }}
          blockedTeamId={leftId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CompareSummaryCard
          title="Overall edge"
          value={verdict.winner}
          subtitle={verdict.summary}
        />
        <CompareSummaryCard
          title={`${left.name} edge`}
          value={verdict.leftWins.toString()}
          subtitle="categories won"
        />
        <CompareSummaryCard
          title={`${right.name} edge`}
          value={verdict.rightWins.toString()}
          subtitle="categories won"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TeamCompareProfile team={left} players={leftPlayers} />
        <TeamCompareProfile team={right} players={rightPlayers} />
      </div>

      <Panel title={`${left.name} vs ${right.name}`}>
        <div className="grid gap-4">
          {rows.map((row) => (
            <TeamCompareMetricDetailed key={row.label} row={row} left={left} right={right} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Roster role balance">
          <div className="grid gap-4 md:grid-cols-2">
            <TeamRoleList team={left} players={leftPlayers} />
            <TeamRoleList team={right} players={rightPlayers} />
          </div>
        </Panel>

        <Panel title="Map overlap">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Shared best maps
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sharedMaps.length > 0 ? (
                  sharedMaps.map((map) => (
                    <span
                      key={map}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-200"
                    >
                      {map}
                    </span>
                  ))
                ) : (
                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
                    Нет пересечения по best maps.
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Read
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getTeamCompareRead(left, right, sharedMaps)}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function TeamComparePicker({
  title,
  selectedTeam,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  blockedTeamId,
}: {
  title: string;
  selectedTeam: (typeof teams)[number];
  selectedId: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (teamId: string) => void;
  blockedTeamId: string;
}) {
  const filteredTeams = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return teams
      .filter((team) => {
        const playerNames = getTeamPlayers(team)
          .map((player) => player.nickname)
          .join(" ")
          .toLowerCase();

        return (
          normalizedQuery.length === 0 ||
          team.name.toLowerCase().includes(normalizedQuery) ||
          team.region.toLowerCase().includes(normalizedQuery) ||
          team.bestMaps.join(" ").toLowerCase().includes(normalizedQuery) ||
          playerNames.includes(normalizedQuery)
        );
      })
      .sort((a, b) => getTeamOverallScore(b) - getTeamOverallScore(a));
  }, [searchQuery]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-black">{selectedTeam.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {selectedTeam.region} · {getTeamStrongestArea(selectedTeam)} profile
          </p>
        </div>
        <Score value={getTeamOverallScore(selectedTeam)} />
      </div>

      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-slate-400">Search team</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Vitality, Spirit, Nuke, donk..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-4 grid max-h-[320px] gap-2 overflow-y-auto pr-1">
        {filteredTeams.map((team) => {
          const isSelected = team.id === selectedId;
          const isBlocked = team.id === blockedTeamId;

          return (
            <button
              key={team.id}
              onClick={() => onSelect(team.id)}
              disabled={isBlocked}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-300/10"
                  : isBlocked
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
              }`}
            >
              <div>
                <div className="font-black text-white">{team.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {team.region} · {team.bestMaps.slice(0, 2).join(", ")}
                </div>
              </div>
              <span className="rounded-xl bg-white/5 px-3 py-2 text-sm font-black text-cyan-300">
                {getTeamOverallScore(team)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TeamCompareProfile({
  team,
  players: teamPlayers,
}: {
  team: (typeof teams)[number];
  players: CS2Player[];
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-3xl font-black">{team.name}</h3>
          <p className="mt-1 text-slate-400">
            {team.region} · {getTeamStrongestArea(team)} / weak: {getTeamWeakestArea(team)}
          </p>
        </div>
        <Score value={getTeamOverallScore(team)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {team.bestMaps.map((map) => (
          <span
            key={map}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200"
          >
            {map}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <Metric label="Firepower" value={team.scores.firepower} />
        <Metric label="Structure" value={team.scores.structure} />
        <Metric label="Map Pool" value={team.scores.mapPool} />
        <Metric label="Clutch" value={team.scores.clutch} />
        <Metric label="Form" value={team.scores.form} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {teamPlayers.map((player) => (
          <span key={player.id} className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
            {player.nickname}
          </span>
        ))}
      </div>
    </article>
  );
}

function TeamCompareMetricDetailed({
  row,
  left,
  right,
}: {
  row: TeamCompareRow;
  left: (typeof teams)[number];
  right: (typeof teams)[number];
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
            {Math.round(row.left)} vs {Math.round(row.right)}
          </div>
        </div>
        <TeamCompareWinnerBadge winner={row.winner} left={left} right={right} />
      </div>

      <div className="grid gap-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{left.name}</span>
            <span>{Math.round(row.left)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${leftWidth}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>{right.name}</span>
            <span>{Math.round(row.right)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400" style={{ width: `${rightWidth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCompareWinnerBadge({
  winner,
  left,
  right,
}: {
  winner: TeamCompareRow["winner"];
  left: (typeof teams)[number];
  right: (typeof teams)[number];
}) {
  if (winner === "tie") {
    return (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
        Tie
      </span>
    );
  }

  const winnerName = winner === "left" ? left.name : right.name;
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

function TeamRoleList({
  team,
  players: teamPlayers,
}: {
  team: (typeof teams)[number];
  players: CS2Player[];
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
        {team.name}
      </p>
      <div className="mt-3 grid gap-2">
        {teamPlayers.map((player) => (
          <div key={player.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-white">{player.nickname}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              {player.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTeamOverallScore(team: (typeof teams)[number]) {
  return Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );
}

function getTeamPlayers(team: (typeof teams)[number]) {
  return players.filter((player) => team.players.includes(player.id));
}

function getTeamAverageImpact(team: (typeof teams)[number]) {
  const teamPlayers = getTeamPlayers(team);

  if (teamPlayers.length === 0) return 0;

  return Math.round(
    teamPlayers.reduce((sum, player) => sum + getPlayerImpact(player), 0) / teamPlayers.length,
  );
}

function getTeamStarPower(team: (typeof teams)[number]) {
  const teamPlayers = getTeamPlayers(team);

  if (teamPlayers.length === 0) return 0;

  return Math.max(...teamPlayers.map((player) => getPlayerImpact(player)));
}

function getTeamRoleBalanceScore(team: (typeof teams)[number]) {
  const teamPlayers = getTeamPlayers(team);
  const rolesInTeam = new Set(teamPlayers.map((player) => player.role));
  let score = rolesInTeam.size * 12;

  if (rolesInTeam.has("AWPer")) score += 10;
  if (rolesInTeam.has("Entry")) score += 10;
  if (rolesInTeam.has("IGL")) score += 10;
  if (rolesInTeam.has("Support") || rolesInTeam.has("Anchor")) score += 8;

  return Math.max(0, Math.min(100, score));
}

function getTeamCompareRows(
  left: (typeof teams)[number],
  right: (typeof teams)[number],
): TeamCompareRow[] {
  const rawRows: Omit<TeamCompareRow, "winner">[] = [
    { label: "Team Score", left: getTeamOverallScore(left), right: getTeamOverallScore(right) },
    { label: "Firepower", left: left.scores.firepower, right: right.scores.firepower },
    { label: "Structure", left: left.scores.structure, right: right.scores.structure },
    { label: "Map Pool", left: left.scores.mapPool, right: right.scores.mapPool },
    { label: "Clutch", left: left.scores.clutch, right: right.scores.clutch },
    { label: "Form", left: left.scores.form, right: right.scores.form },
    { label: "Average Player Impact", left: getTeamAverageImpact(left), right: getTeamAverageImpact(right) },
    { label: "Star Power", left: getTeamStarPower(left), right: getTeamStarPower(right) },
    { label: "Role Balance", left: getTeamRoleBalanceScore(left), right: getTeamRoleBalanceScore(right) },
  ];

  return rawRows.map((row) => ({
    ...row,
    winner: getTeamCompareWinner(row.left, row.right),
  }));
}

function getTeamCompareWinner(left: number, right: number): TeamCompareRow["winner"] {
  const diff = Math.abs(left - right);

  if (diff < 1) return "tie";
  return left > right ? "left" : "right";
}

function getTeamComparisonVerdict(
  left: (typeof teams)[number],
  right: (typeof teams)[number],
  rows: TeamCompareRow[],
) {
  const leftWins = rows.filter((row) => row.winner === "left").length;
  const rightWins = rows.filter((row) => row.winner === "right").length;
  const winner =
    leftWins === rightWins ? "Even" : leftWins > rightWins ? left.name : right.name;

  const summary =
    winner === "Even"
      ? "matchup is close by MVP categories"
      : `${winner} leads by ${Math.abs(leftWins - rightWins)} categories`;

  return { winner, leftWins, rightWins, summary };
}

function getTeamCompareRead(
  left: (typeof teams)[number],
  right: (typeof teams)[number],
  sharedMaps: string[],
) {
  const leftStrong = getTeamStrongestArea(left);
  const rightStrong = getTeamStrongestArea(right);
  const overlapText =
    sharedMaps.length > 0
      ? `Общие сильные карты: ${sharedMaps.join(", ")}.`
      : "По best maps нет прямого пересечения.";

  return `${left.name} опирается на ${leftStrong}, ${right.name} — на ${rightStrong}. ${overlapText} В MVP-логике это помогает быстро понять, где матчап будет решаться: в огневой мощи, структуре, clutch-ситуациях или глубине map pool.`;
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

