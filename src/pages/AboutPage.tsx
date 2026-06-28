import { dataMeta, players, teams } from "../data";
import { maps } from "../config/maps";
import { roleConfigs } from "../config/roles";
import { getPlayerImpact } from "../lib";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { Metric } from "../components/Metric";

type RoadmapStatus = "Done" | "Next" | "Later";

type RoadmapItem = {
  title: string;
  status: RoadmapStatus;
  description: string;
};

const scoreSections = [
  {
    title: "Player Impact",
    description:
      "Custom index for quick comparison of individual player value inside the MVP.",
    formula:
      "rating, ADR, K/D, KAST, opening, clutch, AWP/rifle value and consistency are blended into a 0–100 style read.",
    caveat:
      "This is not a live HLTV-style rating. It is a product-testing score built from manual demo values.",
  },
  {
    title: "Team Score",
    description:
      "Weighted team profile used for team pages, top team widgets and Team Compare.",
    formula:
      "firepower, structure, map pool, clutch and form are combined into a single team strength estimate.",
    caveat:
      "The score helps compare page behavior, but does not claim current real-world team ranking accuracy.",
  },
  {
    title: "Map Fit",
    description:
      "Map-specific read used to connect players, roles and teams to map profiles.",
    formula:
      "AWP value, entry value, anchor pressure, CT/T profile and preferred roles affect the fit read.",
    caveat:
      "Map fit is currently hand-modeled for MVP UX and should later be replaced with real map statistics.",
  },
  {
    title: "Roster Value",
    description:
      "Budget-aware score used by Roster Builder and Saved Rosters.",
    formula:
      "player impact is compared against builder price, role coverage, roster cost and overall roster balance.",
    caveat:
      "Player prices are internal demo prices, not transfer values, salaries or market estimates.",
  },
];

const roadmapItems: RoadmapItem[] = [
  {
    title: "Current MVP",
    status: "Done",
    description:
      "Static local data, dashboard, catalogs, comparisons, roster builder, saved rosters and data notice.",
  },
  {
    title: "Manual real-stat pass",
    status: "Next",
    description:
      "Replace demo numbers with manually curated statistics and source notes for a defined date window.",
  },
  {
    title: "Source metadata",
    status: "Next",
    description:
      "Track source, update date, event filters and whether a metric is raw, derived or manually adjusted.",
  },
  {
    title: "Automated updates",
    status: "Later",
    description:
      "Move from static TypeScript data to a cleaner backend/API or generated dataset pipeline.",
  },
];

function getAverageImpact() {
  if (players.length === 0) return 0;

  return Math.round(
    players.reduce((sum, player) => sum + getPlayerImpact(player), 0) /
      players.length,
  );
}

function getAverageTeamFirepower() {
  if (teams.length === 0) return 0;

  return Math.round(
    teams.reduce((sum, team) => sum + team.scores.firepower, 0) / teams.length,
  );
}

function getAverageMapIntensity() {
  if (maps.length === 0) return 0;

  return Math.round(
    maps.reduce(
      (sum, map) =>
        sum +
        Math.round(
          map.ctSideStrength * 0.25 +
            map.tSideDifficulty * 0.2 +
            map.awpValue * 0.2 +
            map.entryValue * 0.2 +
            map.anchorPressure * 0.15,
        ),
      0,
    ) / maps.length,
  );
}

export function AboutPage() {
  const statusLabel =
    dataMeta.status === "demo-manual" ? "Demo / manual data" : dataMeta.status;

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/12 via-white/[0.04] to-purple-500/10 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          About / Methodology
        </p>

        <h2 className="mt-3 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
          What ClutchLab measures and what the current data means.
        </h2>

        <p className="mt-5 max-w-4xl text-slate-300">
          ClutchLab is a CS2 analytics MVP for exploring players, teams, maps,
          roles, roster construction and matchup comparison. The interface is
          built like a real product, but the current numerical dataset is marked
          as demo/manual data for development and testing.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-4">
          <StatCard title="Data status" value={statusLabel} subtitle="current dataset" />
          <StatCard title="Version" value={dataMeta.version} subtitle="dataMeta" />
          <StatCard title="Updated" value={dataMeta.lastUpdated} subtitle="last update" />
          <StatCard title="Players" value={players.length.toString()} subtitle="demo records" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Teams" value={teams.length.toString()} subtitle="team profiles" />
        <StatCard title="Maps" value={maps.length.toString()} subtitle="map profiles" />
        <StatCard title="Roles" value={roleConfigs.length.toString()} subtitle="role profiles" />
        <StatCard title="Avg Impact" value={getAverageImpact().toString()} subtitle="demo index" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="What ClutchLab is">
          <div className="grid gap-4 text-sm leading-6 text-slate-300">
            <p>
              ClutchLab is designed as a decision-support interface for CS2. It
              connects player profiles, team profiles, role identity, map demands
              and roster-building constraints into one navigable product.
            </p>

            <p>
              The site is not trying to be a live scoreboard in the current MVP.
              The goal is to validate the product structure first: pages,
              filtering, comparison logic, roster builder UX, saved rosters and
              clear data boundaries.
            </p>

            <p>
              The next data milestone is to replace demo/manual numbers with a
              documented real-stat layer where every score has an update date and
              source notes.
            </p>
          </div>
        </Panel>

        <Panel title="Current data coverage">
          <div className="grid gap-3 md:grid-cols-2">
            <CoverageMetric title="Players" value={dataMeta.coverage.players} />
            <CoverageMetric title="Teams" value={dataMeta.coverage.teams} />
            <CoverageMetric title="Maps" value={dataMeta.coverage.maps} />
            <CoverageMetric title="Roles" value={dataMeta.coverage.roles} />
          </div>

          <div className="mt-5 grid gap-3">
            <Metric label="Average team firepower" value={getAverageTeamFirepower()} />
            <Metric label="Average map intensity" value={getAverageMapIntensity()} />
            <Metric label="Average player impact" value={getAverageImpact()} />
          </div>
        </Panel>
      </div>

      <Panel title="How the demo scores work">
        <div className="grid gap-4 md:grid-cols-2">
          {scoreSections.map((section) => (
            <MethodologyCard key={section.title} section={section} />
          ))}
        </div>
      </Panel>

      <Panel title="Data limitations">
        <div className="grid gap-3">
          {dataMeta.notes.map((note) => (
            <div
              key={note}
              className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-slate-300"
            >
              {note}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Planned sources">
          <div className="grid gap-3">
            {dataMeta.plannedSources.map((source) => (
              <div
                key={source}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="font-bold capitalize text-white">{source}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Roadmap to real stats">
          <div className="grid gap-3">
            {roadmapItems.map((item) => (
              <RoadmapCard key={item.title} item={item} />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Interpretation rules">
        <div className="grid gap-4 md:grid-cols-3">
          <RuleCard
            title="Use scores for UX testing"
            text="Current numbers are useful for checking sorting, filtering, builder logic and comparison layout."
          />
          <RuleCard
            title="Do not claim live accuracy"
            text="Until a real source layer exists, ratings and prices should not be described as current official stats."
          />
          <RuleCard
            title="Keep sources near data"
            text="When real values are added, source, date, event scope and manual adjustments should be documented."
          />
        </div>
      </Panel>
    </section>
  );
}

function CoverageMetric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-cyan-200">{value}</p>
    </div>
  );
}

function MethodologyCard({
  section,
}: {
  section: {
    title: string;
    description: string;
    formula: string;
    caveat: string;
  };
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="text-2xl font-black text-white">{section.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{section.description}</p>

      <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-cyan-200">
          Formula read
        </p>
        <p className="mt-2 text-sm text-slate-300">{section.formula}</p>
      </div>

      <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
        <p className="text-xs font-black uppercase tracking-wider text-amber-200">
          Caveat
        </p>
        <p className="mt-2 text-sm text-slate-300">{section.caveat}</p>
      </div>
    </article>
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
          <p className="font-black text-white">{item.title}</p>
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

function RuleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
