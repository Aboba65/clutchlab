import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import { getPlayerImpact } from "../lib";
import { roleConfigs } from "../config/roles";
import { maps } from "../config/maps";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { Score } from "../components/Score";
import { Metric } from "../components/Metric";
import { PlayerCard } from "../components/PlayerCard";

function getTeamScore(team: (typeof teams)[number]) {
  return Math.round(
    team.scores.firepower * 0.28 +
      team.scores.structure * 0.22 +
      team.scores.mapPool * 0.2 +
      team.scores.clutch * 0.15 +
      team.scores.form * 0.15,
  );
}

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

export function HomePage() {
  const navigate = useNavigate();

  const topPlayers = [...players]
    .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
    .slice(0, 4);

  const topTeams = [...teams]
    .sort((a, b) => getTeamScore(b) - getTeamScore(a))
    .slice(0, 3);

  const featuredMaps = [...maps]
    .sort((a, b) => b.awpValue + b.entryValue + b.anchorPressure - (a.awpValue + a.entryValue + a.anchorPressure))
    .slice(0, 3);

  const featuredRoles = roleConfigs.slice(0, 4);
  const averageImpact = Math.round(
    players.reduce((sum, player) => sum + getPlayerImpact(player), 0) / players.length,
  );
  const premiumPlayers = players.filter((player) => player.price >= 8).length;

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/[0.04] to-purple-500/10 p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              CS2 Analytics MVP
            </p>
            <h2 className="mt-3 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
              Build rosters, compare players and read the CS2 meta through roles.
            </h2>
            <p className="mt-5 max-w-3xl text-slate-300">
              ClutchLab combines player profiles, team pages, map reads, role pages,
              saved rosters and custom indexes into one CS2 analytics prototype.
              Current numbers are MVP demo values, but the product structure is ready
              for a real data pipeline.
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
                  {topTeams[0]?.name ?? "Top Team"} vs {topTeams[1]?.name ?? "Challenger"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Use Team Compare to read firepower, structure, map pool and roster role balance.
                </p>
              </div>
              <Score value={topTeams[0] ? getTeamScore(topTeams[0]) : 0} />
            </div>

            <div className="mt-5 grid gap-3">
              {topTeams.slice(0, 2).map((team) => (
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Players" value={players.length.toString()} subtitle="current database" />
        <StatCard title="Teams" value={teams.length.toString()} subtitle="team profiles" />
        <StatCard title="Maps" value={maps.length.toString()} subtitle="map reads" />
        <StatCard title="Roles" value={roleConfigs.length.toString()} subtitle="role pages" />
        <StatCard title="Avg Impact" value={averageImpact.toString()} subtitle="custom index" />
        <StatCard title="Premium" value={premiumPlayers.toString()} subtitle="$8+ players" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <QuickLinkCard
          title="Player database"
          description="Search players, filter by role/team/country and open full profiles."
          label="Open players"
          onClick={() => navigate("/players")}
        />
        <QuickLinkCard
          title="Roster Builder"
          description="Build a five-player lineup, validate roles, save rosters and reload them later."
          label="Build lineup"
          onClick={() => navigate("/roster-builder")}
        />
        <QuickLinkCard
          title="Role pages"
          description="Read role identity, best players, map fits and roster-builder advice."
          label="Open roles"
          onClick={() => navigate("/roles")}
        />
        <QuickLinkCard
          title="Maps"
          description="Understand map identity, AWP value, entry pressure and anchor stress."
          label="Open maps"
          onClick={() => navigate("/maps")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
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

        <Panel title="Featured roles">
          <div className="grid gap-3">
            {featuredRoles.map((role) => {
              const rolePlayers = players.filter((player) => player.role === role.role);
              const topRolePlayer = [...rolePlayers].sort(
                (a, b) => getPlayerImpact(b) - getPlayerImpact(a),
              )[0];

              return (
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
                      {rolePlayers.length}
                    </span>
                  </div>
                  {topRolePlayer && (
                    <div className="mt-3 text-sm text-cyan-200">
                      Top fit: {topRolePlayer.nickname} · Impact {getPlayerImpact(topRolePlayer)}
                    </div>
                  )}
                </button>
              );
            })}
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
                className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
              >
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
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Featured maps">
          <div className="grid gap-3">
            {featuredMaps.map((map) => (
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
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
                    {map.sideProfile}
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  <Metric label="AWP Value" value={map.awpValue} />
                  <Metric label="Entry Value" value={map.entryValue} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              MVP Status
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Static prototype today, real analytics pipeline later.
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Players and teams use real CS2 names, while ratings, prices and custom
              indexes are demo values. The next major technical milestone is moving
              data and logic out of App.tsx into dedicated modules.
            </p>
          </div>
          <button
            onClick={() => navigate("/saved-rosters")}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Open saved rosters
          </button>
        </div>
      </div>
    </section>
  );
}

function QuickLinkCard({
  title,
  description,
  label,
  onClick,
}: {
  title: string;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
    >
      <div className="text-xl font-black text-white">{title}</div>
      <p className="mt-2 min-h-12 text-sm text-slate-400">{description}</p>
      <div className="mt-4 inline-flex rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
        {label}
      </div>
    </button>
  );
}
