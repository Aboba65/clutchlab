import { useMemo, useState } from "react";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact } from "../lib";
import { Panel } from "../components/Panel";
import { Score } from "../components/Score";
import { Metric } from "../components/Metric";
import { RoleBadge } from "../components/RoleBadge";

type Team = (typeof teams)[number];

type CompareDirection = "higher" | "lower";

type CompareWinner = "left" | "right" | "tie";

type CompareKind = "score" | "count" | "money" | "text";

type TeamCompareRow = {
  label: string;
  description: string;
  left: number;
  right: number;
  kind: CompareKind;
  direction: CompareDirection;
  winner: CompareWinner;
};

type TeamCompareDimension = {
  label: string;
  description: string;
  left: number;
  right: number;
  winner: CompareWinner;
};

type TeamComparePreset = {
  id: string;
  label: string;
  description: string;
  leftId: string;
  rightId: string;
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

export function TeamComparePage() {
  const initialLeft = teams[0];
  const initialRight = teams[1] ?? teams[0];

  const [leftId, setLeftId] = useState(initialLeft.id);
  const [rightId, setRightId] = useState(initialRight.id);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const left = teams.find((team) => team.id === leftId) ?? initialLeft;
  const right = teams.find((team) => team.id === rightId) ?? initialRight;

  const leftPlayers = useMemo(() => getTeamPlayers(left), [left]);
  const rightPlayers = useMemo(() => getTeamPlayers(right), [right]);
  const rows = useMemo(() => getTeamCompareRows(left, right), [left, right]);
  const dimensions = useMemo(
    () => getTeamCompareDimensions(left, right),
    [left, right],
  );
  const sharedMaps = useMemo(() => getSharedMaps(left, right), [left, right]);
  const uniqueLeftMaps = useMemo(
    () => left.bestMaps.filter((map) => !right.bestMaps.includes(map)),
    [left, right],
  );
  const uniqueRightMaps = useMemo(
    () => right.bestMaps.filter((map) => !left.bestMaps.includes(map)),
    [left, right],
  );
  const verdict = useMemo(
    () => getTeamComparisonVerdict(left, right, rows, dimensions, sharedMaps),
    [left, right, rows, dimensions, sharedMaps],
  );
  const presets = useMemo(() => getTeamComparePresets(), []);

  function swapTeams() {
    setLeftId(right.id);
    setRightId(left.id);
    setLeftSearch("");
    setRightSearch("");
  }

  function applyPreset(preset: TeamComparePreset) {
    setLeftId(preset.leftId);
    setRightId(preset.rightId);
    setLeftSearch("");
    setRightSearch("");
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          title="Team Compare"
          description="Сравнение команд по score, firepower, structure, map pool, clutch, roster strength, role balance и пересечению карт."
        />

        <button
          onClick={swapTeams}
          className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Swap teams
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

      <div className="grid gap-4 md:grid-cols-4">
        <CompareSummaryCard
          title="Overall edge"
          value={verdict.winner}
          subtitle={verdict.summary}
        />
        <CompareSummaryCard
          title={`${left.name} wins`}
          value={verdict.leftWins.toString()}
          subtitle="metric rows"
        />
        <CompareSummaryCard
          title={`${right.name} wins`}
          value={verdict.rightWins.toString()}
          subtitle="metric rows"
        />
        <CompareSummaryCard
          title="Closest area"
          value={verdict.closestMetric}
          subtitle="smallest gap"
        />
      </div>

      <Panel title="Profile dimensions">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {dimensions.map((dimension) => (
            <TeamDimensionCard
              key={dimension.label}
              dimension={dimension}
              left={left}
              right={right}
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <TeamCompareProfile team={left} players={leftPlayers} />
        <TeamCompareProfile team={right} players={rightPlayers} />
      </div>

      <Panel title={`${left.name} vs ${right.name}`}>
        <div className="grid gap-4">
          {rows.map((row) => (
            <TeamCompareMetricDetailed
              key={row.label}
              row={row}
              left={left}
              right={right}
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Roster strength">
          <div className="grid gap-4 md:grid-cols-2">
            <TeamRoleList team={left} players={leftPlayers} />
            <TeamRoleList team={right} players={rightPlayers} />
          </div>
        </Panel>

        <Panel title="Map pool matchup">
          <div className="grid gap-4">
            <MapList title="Shared best maps" maps={sharedMaps} tone="shared" />
            <div className="grid gap-4 md:grid-cols-2">
              <MapList title={`${left.name} only`} maps={uniqueLeftMaps} tone="left" />
              <MapList title={`${right.name} only`} maps={uniqueRightMaps} tone="right" />
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Map read
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {getMapPoolRead(left, right, sharedMaps, uniqueLeftMaps, uniqueRightMaps)}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Comparison table">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-3">Metric</th>
                <th className="px-3 py-3">{left.name}</th>
                <th className="px-3 py-3">{right.name}</th>
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
                    {formatTeamCompareValue(row.left, row.kind)}
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {formatTeamCompareValue(row.right, row.kind)}
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-200">
                    {formatTeamDelta(row)}
                  </td>
                  <td className="px-3 py-3 text-slate-400">
                    {row.direction === "higher" ? "higher" : "lower"}
                  </td>
                  <td className="px-3 py-3">
                    <TeamCompareWinnerBadge
                      winner={row.winner}
                      left={left}
                      right={right}
                    />
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
              {left.name}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getTeamSideRead(left, right, dimensions, sharedMaps)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-purple-300">
              {right.name}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getTeamSideRead(right, left, dimensions, sharedMaps)}
            </p>
          </div>
        </div>
      </Panel>
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
  selectedTeam: Team;
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

        const playerRoles = getTeamPlayers(team)
          .map((player) => player.role)
          .join(" ")
          .toLowerCase();

        return (
          normalizedQuery.length === 0 ||
          team.name.toLowerCase().includes(normalizedQuery) ||
          team.region.toLowerCase().includes(normalizedQuery) ||
          team.bestMaps.join(" ").toLowerCase().includes(normalizedQuery) ||
          playerNames.includes(normalizedQuery) ||
          playerRoles.includes(normalizedQuery)
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
          placeholder="Vitality, Spirit, Nuke, donk, AWPer..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-4 grid max-h-[360px] gap-2 overflow-y-auto pr-1">
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
                    : "border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.06]"
              }`}
            >
              <div>
                <div className="font-black text-white">{team.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {team.region} · {team.bestMaps.slice(0, 2).join(", ")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-cyan-300">
                  {getTeamOverallScore(team)}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {isBlocked ? "selected" : `${getTeamPlayers(team).length} players`}
                </div>
              </div>
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
  team: Team;
  players: CS2Player[];
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-3xl font-black">{team.name}</h3>
          <p className="mt-1 text-slate-400">
            {team.region} · {getTeamStrongestArea(team)} / weak:{" "}
            {getTeamWeakestArea(team)}
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

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniMetric title="Avg Impact" value={getTeamAverageImpact(team)} />
        <MiniMetric title="Star Power" value={getTeamStarPower(team)} />
        <MiniMetric title="Role Balance" value={getTeamRoleBalanceScore(team)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {teamPlayers.map((player) => (
          <span
            key={player.id}
            className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300"
          >
            {player.nickname}
          </span>
        ))}
      </div>
    </article>
  );
}

function TeamDimensionCard({
  dimension,
  left,
  right,
}: {
  dimension: TeamCompareDimension;
  left: Team;
  right: Team;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {dimension.label}
      </p>
      <p className="mt-1 text-xs text-slate-500">{dimension.description}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-cyan-200">{left.name}</div>
          <div className="text-2xl font-black">{dimension.left}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-purple-200">{right.name}</div>
          <div className="text-2xl font-black">{dimension.right}</div>
        </div>
      </div>

      <div className="mt-3">
        <TeamCompareWinnerBadge
          winner={dimension.winner}
          left={left}
          right={right}
        />
      </div>
    </div>
  );
}

function TeamCompareMetricDetailed({
  row,
  left,
  right,
}: {
  row: TeamCompareRow;
  left: Team;
  right: Team;
}) {
  const leftBarValue = getNormalizedTeamBarValue(row.left, row);
  const rightBarValue = getNormalizedTeamBarValue(row.right, row);
  const maxValue = Math.max(leftBarValue, rightBarValue, 1);
  const leftWidth = Math.max(3, Math.round((leftBarValue / maxValue) * 100));
  const rightWidth = Math.max(3, Math.round((rightBarValue / maxValue) * 100));

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-black text-white">{row.label}</div>
          <div className="mt-1 text-xs text-slate-500">
            {row.description} · {formatTeamCompareValue(row.left, row.kind)} vs{" "}
            {formatTeamCompareValue(row.right, row.kind)}
          </div>
        </div>
        <TeamCompareWinnerBadge winner={row.winner} left={left} right={right} />
      </div>

      <div className="grid gap-2">
        <MetricBar
          label={left.name}
          value={formatTeamCompareValue(row.left, row.kind)}
          width={leftWidth}
          tone="cyan"
        />
        <MetricBar
          label={right.name}
          value={formatTeamCompareValue(row.right, row.kind)}
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

function TeamCompareWinnerBadge({
  winner,
  left,
  right,
}: {
  winner: CompareWinner;
  left: Team;
  right: Team;
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
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${className}`}
    >
      {winnerName}
    </span>
  );
}

function TeamRoleList({
  team,
  players: teamPlayers,
}: {
  team: Team;
  players: CS2Player[];
}) {
  const missingRoles = getMissingCoreRoles(team);

  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {team.name}
        </p>
        <Score value={getTeamRoleBalanceScore(team)} />
      </div>

      <div className="mt-3 grid gap-2">
        {teamPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-3 py-2 text-sm"
          >
            <span className="font-bold text-white">{player.nickname}</span>
            <RoleBadge role={player.role} />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Missing core roles
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {missingRoles.length > 0 ? (
            missingRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
              core covered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MapList({
  title,
  maps,
  tone,
}: {
  title: string;
  maps: string[];
  tone: "shared" | "left" | "right";
}) {
  const className =
    tone === "shared"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
      : tone === "left"
        ? "border-cyan-300/15 bg-cyan-300/5 text-cyan-100"
        : "border-purple-300/15 bg-purple-300/5 text-purple-100";

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {maps.length > 0 ? (
          maps.map((map) => (
            <span
              key={map}
              className={`rounded-full border px-3 py-2 text-sm font-bold ${className}`}
            >
              {map}
            </span>
          ))
        ) : (
          <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
            No maps
          </span>
        )}
      </div>
    </div>
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

function MiniMetric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function getTeamOverallScore(team: Team) {
  return Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );
}

function getTeamPlayers(team: Team) {
  return players.filter((player) => team.players.includes(player.id));
}

function getTeamAverageImpact(team: Team) {
  const teamPlayers = getTeamPlayers(team);

  if (teamPlayers.length === 0) return 0;

  return Math.round(
    teamPlayers.reduce((sum, player) => sum + getPlayerImpact(player), 0) /
      teamPlayers.length,
  );
}

function getTeamStarPower(team: Team) {
  const teamPlayers = getTeamPlayers(team);

  if (teamPlayers.length === 0) return 0;

  return Math.max(...teamPlayers.map((player) => getPlayerImpact(player)));
}

function getTeamRosterCost(team: Team) {
  return getTeamPlayers(team).reduce((sum, player) => sum + player.price, 0);
}

function getTeamRosterValue(team: Team) {
  const cost = getTeamRosterCost(team);
  if (cost === 0) return 0;

  return getTeamAverageImpact(team) / cost;
}

function getTeamRoleBalanceScore(team: Team) {
  const teamPlayers = getTeamPlayers(team);
  const rolesInTeam = new Set(teamPlayers.map((player) => player.role));
  let score = rolesInTeam.size * 12;

  if (rolesInTeam.has("AWPer")) score += 10;
  if (rolesInTeam.has("Entry")) score += 10;
  if (rolesInTeam.has("IGL")) score += 10;
  if (rolesInTeam.has("Support") || rolesInTeam.has("Anchor")) score += 8;
  if (teamPlayers.length >= 5) score += 8;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function getTeamRosterStrength(team: Team) {
  return Math.round(
    getTeamAverageImpact(team) * 0.42 +
      getTeamStarPower(team) * 0.22 +
      getTeamRoleBalanceScore(team) * 0.2 +
      team.scores.structure * 0.16,
  );
}

function getTeamMapDepth(team: Team) {
  return Math.round(team.scores.mapPool * 0.72 + team.bestMaps.length * 7);
}

function getSharedMaps(left: Team, right: Team) {
  return left.bestMaps.filter((map) => right.bestMaps.includes(map));
}

function getMapOverlapScore(left: Team, right: Team) {
  const sharedMaps = getSharedMaps(left, right);
  const uniqueMaps = new Set([...left.bestMaps, ...right.bestMaps]);

  if (uniqueMaps.size === 0) return 0;

  return Math.round((sharedMaps.length / uniqueMaps.size) * 100);
}

function getTeamStrongestArea(team: Team) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}

function getTeamWeakestArea(team: Team) {
  const entries = [
    ["Firepower", team.scores.firepower],
    ["Structure", team.scores.structure],
    ["Map Pool", team.scores.mapPool],
    ["Clutch", team.scores.clutch],
    ["Form", team.scores.form],
  ] as const;

  return [...entries].sort((a, b) => a[1] - b[1])[0][0];
}

function getMissingCoreRoles(team: Team) {
  const coreRoles = ["AWPer", "Entry", "IGL", "Support"] as const;
  const rolesInTeam = new Set(getTeamPlayers(team).map((player) => player.role));

  return coreRoles.filter((role) => {
    if (role === "Support") {
      return !rolesInTeam.has("Support") && !rolesInTeam.has("Anchor");
    }

    return !rolesInTeam.has(role);
  });
}

function getTeamCompareRows(left: Team, right: Team): TeamCompareRow[] {
  const rawRows: Omit<TeamCompareRow, "winner">[] = [
    {
      label: "Team Score",
      description: "weighted team score",
      left: getTeamOverallScore(left),
      right: getTeamOverallScore(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Firepower",
      description: "duel and star pressure",
      left: left.scores.firepower,
      right: right.scores.firepower,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Structure",
      description: "system quality",
      left: left.scores.structure,
      right: right.scores.structure,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Map Pool",
      description: "map depth score",
      left: left.scores.mapPool,
      right: right.scores.mapPool,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Clutch",
      description: "late-round quality",
      left: left.scores.clutch,
      right: right.scores.clutch,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Form",
      description: "current level",
      left: left.scores.form,
      right: right.scores.form,
      kind: "score",
      direction: "higher",
    },
    {
      label: "Roster Strength",
      description: "average impact + star power + role balance",
      left: getTeamRosterStrength(left),
      right: getTeamRosterStrength(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Average Player Impact",
      description: "mean player impact in demo roster",
      left: getTeamAverageImpact(left),
      right: getTeamAverageImpact(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Star Power",
      description: "highest player impact",
      left: getTeamStarPower(left),
      right: getTeamStarPower(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Role Balance",
      description: "role coverage and roster shape",
      left: getTeamRoleBalanceScore(left),
      right: getTeamRoleBalanceScore(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Map Depth",
      description: "map pool plus tagged best maps",
      left: getTeamMapDepth(left),
      right: getTeamMapDepth(right),
      kind: "score",
      direction: "higher",
    },
    {
      label: "Best Maps Count",
      description: "number of tagged best maps",
      left: left.bestMaps.length,
      right: right.bestMaps.length,
      kind: "count",
      direction: "higher",
    },
    {
      label: "Roster Cost",
      description: "combined player price, lower is better",
      left: getTeamRosterCost(left),
      right: getTeamRosterCost(right),
      kind: "money",
      direction: "lower",
    },
    {
      label: "Roster Value / $",
      description: "average impact per total price",
      left: getTeamRosterValue(left),
      right: getTeamRosterValue(right),
      kind: "score",
      direction: "higher",
    },
  ];

  return rawRows.map((row) => ({
    ...row,
    winner: getTeamCompareWinner(row.left, row.right, row.direction),
  }));
}

function getTeamCompareDimensions(left: Team, right: Team): TeamCompareDimension[] {
  const rawDimensions: Omit<TeamCompareDimension, "winner">[] = [
    {
      label: "Firepower",
      description: "raw duel pressure",
      left: left.scores.firepower,
      right: right.scores.firepower,
    },
    {
      label: "Structure",
      description: "system and protocols",
      left: left.scores.structure,
      right: right.scores.structure,
    },
    {
      label: "Map Pool",
      description: "map depth",
      left: left.scores.mapPool,
      right: right.scores.mapPool,
    },
    {
      label: "Clutch",
      description: "late rounds",
      left: left.scores.clutch,
      right: right.scores.clutch,
    },
    {
      label: "Roster",
      description: "player impact and roles",
      left: getTeamRosterStrength(left),
      right: getTeamRosterStrength(right),
    },
    {
      label: "Value",
      description: "impact per roster cost",
      left: Math.round(getTeamRosterValue(left) * 10),
      right: Math.round(getTeamRosterValue(right) * 10),
    },
  ];

  return rawDimensions.map((dimension) => ({
    ...dimension,
    winner: getTeamCompareWinner(dimension.left, dimension.right, "higher"),
  }));
}

function getTeamCompareWinner(
  left: number,
  right: number,
  direction: CompareDirection,
): CompareWinner {
  const diff = Math.abs(left - right);

  if (diff < 1) return "tie";

  if (direction === "lower") {
    return left < right ? "left" : "right";
  }

  return left > right ? "left" : "right";
}

function getTeamComparisonVerdict(
  left: Team,
  right: Team,
  rows: TeamCompareRow[],
  dimensions: TeamCompareDimension[],
  sharedMaps: string[],
) {
  const leftWins = rows.filter((row) => row.winner === "left").length;
  const rightWins = rows.filter((row) => row.winner === "right").length;
  const dimensionLeftWins = dimensions.filter(
    (dimension) => dimension.winner === "left",
  ).length;
  const dimensionRightWins = dimensions.filter(
    (dimension) => dimension.winner === "right",
  ).length;

  const closestMetric = getClosestTeamMetric(rows);
  const overallDiff = getTeamOverallScore(left) - getTeamOverallScore(right);

  if (
    leftWins === rightWins ||
    Math.abs(overallDiff) <= 2 ||
    dimensionLeftWins === dimensionRightWins
  ) {
    return {
      winner: "Even",
      leftWins,
      rightWins,
      closestMetric,
      summary: "close matchup",
      read: `${left.name} and ${right.name} are close overall. The result depends on veto, map overlap and which team can force its strongest area.`,
    };
  }

  if (leftWins > rightWins || dimensionLeftWins > dimensionRightWins) {
    return {
      winner: left.name,
      leftWins,
      rightWins,
      closestMetric,
      summary: `edge by ${Math.max(leftWins - rightWins, 1)} metrics`,
      read: `${left.name} has the broader statistical edge. Main advantage: ${getBestDimensionForTeam(
        dimensions,
        "left",
      ).toLowerCase()}. Shared best maps: ${
        sharedMaps.length > 0 ? sharedMaps.join(", ") : "none"
      }.`,
    };
  }

  return {
    winner: right.name,
    leftWins,
    rightWins,
    closestMetric,
    summary: `edge by ${Math.max(rightWins - leftWins, 1)} metrics`,
    read: `${right.name} has the broader statistical edge. Main advantage: ${getBestDimensionForTeam(
      dimensions,
      "right",
    ).toLowerCase()}. Shared best maps: ${
      sharedMaps.length > 0 ? sharedMaps.join(", ") : "none"
    }.`,
  };
}

function getTeamComparePresets(): TeamComparePreset[] {
  const overall = [...teams].sort(
    (a, b) => getTeamOverallScore(b) - getTeamOverallScore(a),
  );
  const firepower = [...teams].sort(
    (a, b) => b.scores.firepower - a.scores.firepower,
  );
  const structure = [...teams].sort(
    (a, b) => b.scores.structure - a.scores.structure,
  );
  const mapPool = [...teams].sort((a, b) => b.scores.mapPool - a.scores.mapPool);
  const rosterStrength = [...teams].sort(
    (a, b) => getTeamRosterStrength(b) - getTeamRosterStrength(a),
  );

  return [
    createTeamPreset("top-overall", "Top overall", "highest team scores", overall),
    createTeamPreset("firepower", "Firepower duel", "raw firepower matchup", firepower),
    createTeamPreset("structure", "Structure duel", "system quality matchup", structure),
    createTeamPreset("map-pool", "Map pool duel", "deepest map pools", mapPool),
    createTeamPreset(
      "roster-strength",
      "Roster strength",
      "player impact and roles",
      rosterStrength,
    ),
  ].filter((preset): preset is TeamComparePreset => Boolean(preset));
}

function createTeamPreset(
  id: string,
  label: string,
  description: string,
  candidates: Team[],
) {
  const left = candidates[0];
  const right = candidates.find((team) => team.id !== left?.id);

  if (!left || !right) return null;

  return {
    id,
    label,
    description,
    leftId: left.id,
    rightId: right.id,
  };
}

function getNormalizedTeamBarValue(value: number, row: TeamCompareRow) {
  if (row.direction === "higher") return value;

  const maxCost = Math.max(...teams.map((team) => getTeamRosterCost(team)), 1);
  return maxCost - value + 1;
}

function getClosestTeamMetric(rows: TeamCompareRow[]) {
  const closest = [...rows].sort((a, b) => {
    return getRelativeGap(a) - getRelativeGap(b);
  })[0];

  return closest?.label ?? "None";
}

function getRelativeGap(row: TeamCompareRow) {
  const maxValue = Math.max(Math.abs(row.left), Math.abs(row.right), 1);
  return Math.abs(row.left - row.right) / maxValue;
}

function getBestDimensionForTeam(
  dimensions: TeamCompareDimension[],
  side: "left" | "right",
) {
  const winningDimensions = dimensions.filter((dimension) => dimension.winner === side);

  if (winningDimensions.length === 0) {
    return "overall profile";
  }

  return winningDimensions
    .sort((a, b) => Math.abs(b.left - b.right) - Math.abs(a.left - a.right))[0]
    .label;
}

function formatTeamCompareValue(value: number, kind: CompareKind) {
  if (kind === "money") return `$${value}`;
  if (kind === "count") return Math.round(value).toString();
  if (Number.isInteger(value)) return value.toString();

  return value.toFixed(1);
}

function formatTeamDelta(row: TeamCompareRow) {
  const delta = row.left - row.right;
  const absoluteDelta = Math.abs(delta);
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";

  if (row.kind === "money") {
    return `${sign}$${absoluteDelta}`;
  }

  if (!Number.isInteger(absoluteDelta)) {
    return `${sign}${absoluteDelta.toFixed(1)}`;
  }

  return `${sign}${Math.round(absoluteDelta)}`;
}

function getMapPoolRead(
  left: Team,
  right: Team,
  sharedMaps: string[],
  uniqueLeftMaps: string[],
  uniqueRightMaps: string[],
) {
  const overlapScore = getMapOverlapScore(left, right);

  if (sharedMaps.length > 0) {
    return `Map overlap ${overlapScore}/100. Общие сильные карты: ${sharedMaps.join(
      ", ",
    )}. У ${left.name} отдельные карты: ${
      uniqueLeftMaps.length > 0 ? uniqueLeftMaps.join(", ") : "нет"
    }. У ${right.name}: ${
      uniqueRightMaps.length > 0 ? uniqueRightMaps.join(", ") : "нет"
    }.`;
  }

  return `Map overlap ${overlapScore}/100. По best maps нет прямого пересечения: ${left.name} хочет играть через ${left.bestMaps.join(
    ", ",
  )}, а ${right.name} через ${right.bestMaps.join(", ")}.`;
}

function getTeamSideRead(
  team: Team,
  opponent: Team,
  dimensions: TeamCompareDimension[],
  sharedMaps: string[],
) {
  const teamOverall = getTeamOverallScore(team);
  const opponentOverall = getTeamOverallScore(opponent);
  const overallText =
    teamOverall > opponentOverall + 2
      ? "ведёт по overall score"
      : teamOverall < opponentOverall - 2
        ? "уступает по overall score"
        : "идёт почти ровно по overall score";

  const strongest = getTeamStrongestArea(team);
  const weakest = getTeamWeakestArea(team);
  const overlapText =
    sharedMaps.length > 0
      ? `Есть shared maps: ${sharedMaps.join(", ")}.`
      : "Shared best maps нет.";

  const side = dimensions[0]?.left === team.scores.firepower ? "left" : "right";
  const dimensionWins = dimensions.filter((dimension) => {
    return side === "left"
      ? dimension.winner === "left"
      : dimension.winner === "right";
  }).length;

  return `${team.name} ${overallText}. Сильная зона: ${strongest}; слабая зона: ${weakest}. Выигранные profile dimensions: ${dimensionWins}/6. ${overlapText}`;
}
