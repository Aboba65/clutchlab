import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import type { CS2Player } from "../types";
import { maps, type CS2MapProfile } from "../config/maps";
import { roleConfigs } from "../config/roles";
import { getPlayerImpact, getTeamName } from "../lib";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { Score } from "../components/Score";
import { Metric } from "../components/Metric";
import { PlayerCard } from "../components/PlayerCard";
import { RoleBadge } from "../components/RoleBadge";

type Team = (typeof teams)[number];

type QuickAction = {
  title: string;
  description: string;
  label: string;
  path: string;
  accent: "primary" | "secondary";
};

type RoadmapItem = {
  title: string;
  status: "Done" | "Next" | "Later";
  description: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Build roster",
    description: "Собери состав 5/5, проверь бюджет, роли, value и map fit.",
    label: "Open builder",
    path: "/roster-builder",
    accent: "primary",
  },
  {
    title: "Compare players",
    description: "Сравни aim, AWP, entry, clutch, consistency и value/$.",
    label: "Open compare",
    path: "/compare",
    accent: "secondary",
  },
  {
    title: "Compare teams",
    description: "Разбери firepower, structure, roster strength и map pool.",
    label: "Team compare",
    path: "/team-compare",
    accent: "secondary",
  },
  {
    title: "Saved rosters",
    description: "Открой сохранённые составы, загрузи их обратно или удали.",
    label: "Open saves",
    path: "/saved-rosters",
    accent: "secondary",
  },
];

const roadmap: RoadmapItem[] = [
  {
    title: "MVP structure",
    status: "Done",
    description:
      "Страницы, роутинг, AppShell, каталоги, билдер и сравнения вынесены отдельно.",
  },
  {
    title: "UX layer",
    status: "Done",
    description: "Фильтры, сортировки, summary-карточки и менеджер сохранённых ростеров.",
  },
  {
    title: "Data layer",
    status: "Next",
    description: "Отделить demo data от UI и подготовить ручную/реальную базу игроков.",
  },
  {
    title: "Real stats",
    status: "Later",
    description:
      "Подключить обновляемые рейтинги, map stats, формы команд и историю матчей.",
  },
];

function getTeamScore(team: Team) {
  return Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );
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

function getTeamAverageImpact(team: Team) {
  const teamPlayers = players.filter((player) => team.players.includes(player.id));
  if (teamPlayers.length === 0) return 0;

  return Math.round(
    teamPlayers.reduce((sum, player) => sum + getPlayerImpact(player), 0) /
      teamPlayers.length,
  );
}

function getTeamRoleDepth(team: Team) {
  const teamPlayers = players.filter((player) => team.players.includes(player.id));
  return new Set(teamPlayers.map((player) => player.role)).size;
}

function getMapScore(map: CS2MapProfile) {
  return Math.round(
    map.ctSideStrength * 0.25 +
      map.tSideDifficulty * 0.2 +
      map.awpValue * 0.2 +
      map.entryValue * 0.2 +
      map.anchorPressure * 0.15,
  );
}

function getPlayerValue(player: CS2Player) {
  return getPlayerImpact(player) / Math.max(player.price, 1);
}

function getAverageImpact() {
  if (players.length === 0) return 0;

  return Math.round(
    players.reduce((sum, player) => sum + getPlayerImpact(player), 0) / players.length,
  );
}

function getAverageTeamScore() {
  if (teams.length === 0) return 0;

  return Math.round(
    teams.reduce((sum, team) => sum + getTeamScore(team), 0) / teams.length,
  );
}

function getAverageMapScore() {
  if (maps.length === 0) return 0;

  return Math.round(maps.reduce((sum, map) => sum + getMapScore(map), 0) / maps.length);
}

function getDatabasePrice() {
  return players.reduce((sum, player) => sum + player.price, 0);
}

export function HomePage() {
  const navigate = useNavigate();

  const topPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
      .slice(0, 4);
  }, []);

  const topTeams = useMemo(() => {
    return [...teams].sort((a, b) => getTeamScore(b) - getTeamScore(a)).slice(0, 4);
  }, []);

  const bestValuePlayers = useMemo(() => {
    return [...players].sort((a, b) => getPlayerValue(b) - getPlayerValue(a)).slice(0, 5);
  }, []);

  const strongestMaps = useMemo(() => {
    return [...maps].sort((a, b) => getMapScore(b) - getMapScore(a)).slice(0, 4);
  }, []);

  const roleSnapshot = useMemo(() => {
    return roleConfigs.slice(0, 6).map((role) => {
      const rolePlayers = players.filter((player) => player.role === role.role);
      const bestPlayer = [...rolePlayers].sort(
        (a, b) => getPlayerImpact(b) - getPlayerImpact(a),
      )[0];

      return {
        role,
        count: rolePlayers.length,
        bestPlayer,
      };
    });
  }, []);

  const featuredMatchup = topTeams.slice(0, 2);
  const premiumPlayers = players.filter((player) => player.price >= 8).length;
  const averageImpact = getAverageImpact();
  const averageTeamScore = getAverageTeamScore();
  const averageMapScore = getAverageMapScore();
  const databasePrice = getDatabasePrice();

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              CS2 Analytics Dashboard
            </p>

            <h2 className="mt-3 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
              ClutchLab turns players, teams, maps and roles into roster decisions.
            </h2>

            <p className="mt-5 max-w-3xl text-slate-300">
              Главная теперь работает как dashboard: быстрые действия, top players, top
              teams, value picks, strongest maps и статус развития продукта. Данные пока
              MVP/demo, но интерфейс уже собран как аналитический продукт.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/roster-builder")}
                className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Build roster
              </button>

              <button
                onClick={() => navigate("/players")}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Explore players
              </button>

              <button
                onClick={() => navigate("/team-compare")}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Compare teams
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Featured matchup
                </p>
                <h3 className="mt-2 text-3xl font-black text-white">
                  {featuredMatchup[0]?.name ?? "Top Team"} vs{" "}
                  {featuredMatchup[1]?.name ?? "Challenger"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Быстрый вход в team compare: firepower, structure, map pool, roster
                  strength и map overlap.
                </p>
              </div>

              <Score value={featuredMatchup[0] ? getTeamScore(featuredMatchup[0]) : 0} />
            </div>

            <div className="mt-5 grid gap-3">
              {featuredMatchup.map((team) => (
                <button
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
                >
                  <div>
                    <div className="font-black">{team.name}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {team.region} · {team.bestMaps.slice(0, 2).join(", ")}
                    </div>
                  </div>

                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
                    {getTeamStrongestArea(team)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
        <StatCard title="Players" value={players.length.toString()} subtitle="database" />
        <StatCard title="Teams" value={teams.length.toString()} subtitle="profiles" />
        <StatCard title="Maps" value={maps.length.toString()} subtitle="map reads" />
        <StatCard
          title="Roles"
          value={roleConfigs.length.toString()}
          subtitle="role pages"
        />
        <StatCard
          title="Avg Impact"
          value={averageImpact.toString()}
          subtitle="player index"
        />
        <StatCard
          title="Avg Team"
          value={averageTeamScore.toString()}
          subtitle="team score"
        />
        <StatCard
          title="Avg Map"
          value={averageMapScore.toString()}
          subtitle="map intensity"
        />
        <StatCard
          title="Market"
          value={`$${databasePrice}`}
          subtitle={`${premiumPlayers} premium`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.path}
            action={action}
            onClick={() => navigate(action.path)}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Top impact players">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => navigate(`/players/${player.id}`)}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Best value players">
          <div className="grid gap-3">
            {bestValuePlayers.map((player, index) => (
              <button
                key={player.id}
                onClick={() => navigate(`/players/${player.id}`)}
                className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-black text-white">{player.nickname}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      <RoleBadge role={player.role} />
                      <span>{getTeamName(player.teamId, teams)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-cyan-300">
                    {getPlayerValue(player).toFixed(1)}/$
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    ${player.price} · Impact {getPlayerImpact(player)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Top teams">
          <div className="grid gap-3">
            {topTeams.map((team, index) => (
              <button
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-black">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-black text-white">{team.name}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {team.region} · {team.bestMaps.join(", ")}
                      </div>
                    </div>
                  </div>

                  <Score value={getTeamScore(team)} />
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  <MiniDashboardMetric
                    title="Avg Impact"
                    value={getTeamAverageImpact(team)}
                  />
                  <MiniDashboardMetric
                    title="Role Depth"
                    value={getTeamRoleDepth(team)}
                  />
                  <MiniDashboardMetric title="Map Pool" value={team.scores.mapPool} />
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Strongest maps">
          <div className="grid gap-3">
            {strongestMaps.map((map) => (
              <button
                key={map.id}
                onClick={() => navigate(`/maps/${map.id}`)}
                className="rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-white">{map.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{map.identity}</div>
                  </div>

                  <Score value={getMapScore(map)} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
                    {map.sideProfile}
                  </span>
                  {map.bestRoles.slice(0, 3).map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>

                <div className="mt-4 grid gap-2">
                  <Metric label="AWP Value" value={map.awpValue} />
                  <Metric label="Entry Value" value={map.entryValue} />
                  <Metric label="Anchor Pressure" value={map.anchorPressure} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Role snapshot">
          <div className="grid gap-3">
            {roleSnapshot.map(({ role, count, bestPlayer }) => (
              <button
                key={role.id}
                onClick={() => navigate(`/roles/${role.id}`)}
                className="rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-white">{role.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{role.identity}</div>
                  </div>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-bold text-slate-300">
                    {count}
                  </span>
                </div>

                {bestPlayer ? (
                  <div className="mt-3 text-sm text-cyan-200">
                    Top fit: {bestPlayer.nickname} · Impact {getPlayerImpact(bestPlayer)}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-500">No demo players</div>
                )}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Product roadmap">
          <div className="grid gap-3">
            {roadmap.map((item) => (
              <RoadmapCard key={item.title} item={item} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Project status
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Interface is ready for a better data layer.
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Players and teams use real CS2 names, while ratings, prices and custom
              indexes are demo values. The next major milestone is replacing static demo
              numbers with a cleaner data model and manually curated real stats.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/players")}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Open catalog
            </button>
            <button
              onClick={() => navigate("/saved-rosters")}
              className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Saved rosters
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActionCard({
  action,
  onClick,
}: {
  action: QuickAction;
  onClick: () => void;
}) {
  const isPrimary = action.accent === "primary";

  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left transition ${
        isPrimary
          ? "border-cyan-300/30 bg-cyan-300/10 hover:bg-cyan-300/15"
          : "border-white/10 bg-white/[0.04] hover:border-cyan-300/40 hover:bg-white/[0.07]"
      }`}
    >
      <div className="text-xl font-black text-white">{action.title}</div>
      <p className="mt-2 min-h-12 text-sm text-slate-400">{action.description}</p>
      <div
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
          isPrimary ? "bg-cyan-300 text-slate-950" : "bg-cyan-300/10 text-cyan-200"
        }`}
      >
        {action.label}
      </div>
    </button>
  );
}

function MiniDashboardMetric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function RoadmapCard({ item }: { item: RoadmapItem }) {
  const statusClassName =
    item.status === "Done"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
      : item.status === "Next"
        ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
        : "border-white/10 bg-white/5 text-slate-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-black text-white">{item.title}</div>
          <p className="mt-1 text-sm text-slate-400">{item.description}</p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${statusClassName}`}
        >
          {item.status}
        </span>
      </div>
    </div>
  );
}
