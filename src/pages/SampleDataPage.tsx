import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  sampleDerivedScoresMeta,
  sampleDerivedScoresSummary,
  sampleMapFitScores,
  samplePlayerDerivedScores,
  samplePlayerRawStats,
  sampleRawStatsMeta,
  sampleRawStatsSummary,
  sampleRosterValueScores,
  sampleTeamDerivedScores,
  sampleTeamRawStats,
  teams,
} from "../data";
import {
  getSampleMapFitScore,
  getSamplePlayerDerivedScore,
  getSampleRosterValueScore,
  getSampleTeamDerivedScore,
  getScoreAdapterCoverageSummary,
  scoreAdapterLayerMeta,
  type ScoreAdapterResult,
} from "../data/scoreAdapters";

const playerDisplayNames = new Map([
  ["zywoo", "ZywOo"],
  ["donk", "donk"],
  ["monesy", "m0NESY"],
]);

const mapDisplayNames = new Map([
  ["mirage", "Mirage"],
  ["nuke", "Nuke"],
]);

const teamNames = new Map(teams.map((team) => [team.id, team.name]));
const adapterCoverage = getScoreAdapterCoverageSummary();

export function SampleDataPage() {
  return (
    <section className="space-y-6">
      <PageHero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Raw sample players"
          value={sampleRawStatsSummary.players}
          detail={sampleRawStatsSummary.status}
        />
        <SummaryCard
          label="Raw sample teams"
          value={sampleRawStatsSummary.teams}
          detail={`${sampleRawStatsSummary.windows} stat windows`}
        />
        <SummaryCard
          label="Derived player scores"
          value={sampleDerivedScoresSummary.playerScores}
          detail={sampleDerivedScoresSummary.status}
        />
        <SummaryCard
          label="Roster score samples"
          value={sampleDerivedScoresSummary.rosterValueScores}
          detail={`${sampleDerivedScoresSummary.mapFitScores} map fit rows`}
        />
      </div>

      <WarningPanel />
      <AdapterOverview />

      <Section
        eyebrow="Raw sample"
        title="Player raw stats"
        description="Small source-shaped player sample. These rows are for data model testing and future UI migration only."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {samplePlayerRawStats.map((row) => (
            <DataCard key={row.playerId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                    Player
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    <EntityLink to={`/players/${row.playerId}`}>
                      {nameForPlayer(row.playerId)}
                    </EntityLink>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{row.playerId}</p>
                </div>
                <ScorePill value={row.rating} />
              </div>

              <MetricGrid>
                <Metric label="Maps" value={row.mapsPlayed} />
                <Metric label="Rounds" value={row.roundsPlayed} />
                <Metric label="ADR" value={row.adr} />
                <Metric label="K/D" value={row.kd} digits={2} />
                <Metric label="KAST" value={row.kast} suffix="%" />
                <Metric label="Opening win" value={row.openingDuelWinRate} suffix="%" />
                <Metric label="Clutch win" value={row.clutchWinRate} suffix="%" />
                <Metric label="Headshot" value={row.headshotRate} suffix="%" />
              </MetricGrid>
            </DataCard>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Raw sample"
        title="Team raw stats"
        description="Small source-shaped team sample used to test team-level stat fields and validation."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sampleTeamRawStats.map((row) => (
            <DataCard key={row.teamId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                    Team
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    <EntityLink to={`/teams/${row.teamId}`}>
                      {nameForTeam(row.teamId)}
                    </EntityLink>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{row.teamId}</p>
                </div>
                <ScorePill value={row.winRate} suffix="%" />
              </div>

              <MetricGrid>
                <Metric label="Maps" value={row.mapsPlayed} />
                <Metric label="Rounds" value={row.roundsPlayed} />
                <Metric label="Round win" value={row.roundWinRate} suffix="%" />
                <Metric label="T round win" value={row.tRoundWinRate} suffix="%" />
                <Metric label="CT round win" value={row.ctRoundWinRate} suffix="%" />
                <Metric label="Pistol win" value={row.pistolRoundWinRate} suffix="%" />
                <Metric label="Conversion" value={row.conversionRate} suffix="%" />
                <Metric label="Retake" value={row.retakeWinRate} suffix="%" />
                <Metric label="Clutch" value={row.clutchWinRate} suffix="%" />
                <Metric label="Opening duel" value={row.openingDuelWinRate} suffix="%" />
              </MetricGrid>
            </DataCard>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Derived sample"
        title="Player derived scores"
        description="Example calculated score rows using player-impact-v1. These scores are not wired into the public player catalog."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {samplePlayerDerivedScores.map((row) => {
            const adapter = getSamplePlayerDerivedScore(row.playerId);

            return (
              <DataCard key={row.playerId}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
                      {row.formulaId}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      <EntityLink to={`/players/${row.playerId}`}>
                        {nameForPlayer(row.playerId)}
                      </EntityLink>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Confidence: {row.confidence}
                    </p>
                  </div>
                  <ScorePill value={row.impact} />
                </div>

                <MetricGrid>
                  <Metric label="Impact" value={row.impact} />
                  <Metric label="Clutch" value={row.clutch} />
                  <Metric label="Opening" value={row.opening} />
                  <Metric label="AWP" value={row.awp} />
                  <Metric label="Rifle" value={row.rifle} />
                  <Metric label="Consistency" value={row.consistency} />
                  <Metric label="Value" value={row.value} />
                  <Metric label="Components" value={row.components?.length ?? 0} />
                </MetricGrid>

                <AdapterMeta result={adapter} />
              </DataCard>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Derived sample"
        title="Team derived scores"
        description="Example team-level derived rows using team-score-v1."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sampleTeamDerivedScores.map((row) => {
            const adapter = getSampleTeamDerivedScore(row.teamId);

            return (
              <DataCard key={row.teamId}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
                      {row.formulaId}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      <EntityLink to={`/teams/${row.teamId}`}>
                        {nameForTeam(row.teamId)}
                      </EntityLink>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Confidence: {row.confidence}
                    </p>
                  </div>
                  <ScorePill value={row.overall} />
                </div>

                <MetricGrid>
                  <Metric label="Overall" value={row.overall} />
                  <Metric label="Firepower" value={row.firepower} />
                  <Metric label="Structure" value={row.structure} />
                  <Metric label="Map pool" value={row.mapPool} />
                  <Metric label="Clutch" value={row.clutch} />
                  <Metric label="Form" value={row.form} />
                  <Metric label="Components" value={row.components?.length ?? 0} />
                </MetricGrid>

                <AdapterMeta result={adapter} />
              </DataCard>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Derived sample"
        title="Map fit scores"
        description="Example map-fit rows for player/team entities. These rows are not connected to map pages yet."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sampleMapFitScores.map((row) => {
            const adapter = getSampleMapFitScore({
              mapId: row.mapId,
              entityId: row.entityId,
              entityType: row.entityType,
            });

            return (
              <DataCard key={`${row.mapId}-${row.entityId}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
                      <EntityLink to={`/maps/${row.mapId}`}>
                        {nameForMap(row.mapId)}
                      </EntityLink>
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      <EntityLink to={pathForEntity(row.entityId, row.entityType)}>
                        {nameForEntity(row.entityId, row.entityType)}
                      </EntityLink>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.entityType} · {row.formulaId}
                    </p>
                  </div>
                  <ScorePill value={row.fit} />
                </div>

                <MetricGrid>
                  <Metric label="Fit" value={row.fit} />
                  <Metric label="AWP fit" value={row.awpFit} />
                  <Metric label="Entry fit" value={row.entryFit} />
                  <Metric label="Anchor fit" value={row.anchorFit} />
                  <Metric label="Lurk fit" value={row.lurkFit} />
                  <Metric label="Support fit" value={row.supportFit} />
                </MetricGrid>

                <AdapterMeta result={adapter} />
              </DataCard>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Derived sample"
        title="Roster value scores"
        description="Example roster score shape for a future migration path from the current roster builder scoring."
      >
        <div className="grid gap-4">
          {sampleRosterValueScores.map((row) => {
            const adapter = getSampleRosterValueScore(row.rosterId);

            return (
              <DataCard key={row.rosterId}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
                      {row.formulaId}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      {row.rosterId}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      <span>Players:</span>
                      {row.playerIds.map((playerId) => (
                        <EntityLink key={playerId} to={`/players/${playerId}`}>
                          {nameForPlayer(playerId)}
                        </EntityLink>
                      ))}
                    </div>
                  </div>
                  <ScorePill value={row.value} />
                </div>

                <MetricGrid>
                  <Metric label="Total cost" value={row.totalCost} digits={1} />
                  <Metric label="Budget limit" value={row.budgetLimit} digits={1} />
                  <Metric label="Value" value={row.value} />
                  <Metric label="Role coverage" value={row.roleCoverage} />
                  <Metric label="Firepower" value={row.firepower} />
                  <Metric label="Clutch" value={row.clutch} />
                  <Metric label="Map fit" value={row.mapFit} />
                  <Metric label="Balance" value={row.balance} />
                </MetricGrid>

                <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
                    Warnings
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-100/90">
                    {row.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>

                <AdapterMeta result={adapter} />
              </DataCard>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Metadata"
        title="Sample layer status"
        description="This block makes the data boundary explicit for anyone reviewing the page."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MetaBlock title="Raw sample metadata">
            <MetaLine label="Version" value={sampleRawStatsMeta.version} />
            <MetaLine label="Status" value={sampleRawStatsMeta.status} />
            <MetaParagraph>{sampleRawStatsMeta.description}</MetaParagraph>
          </MetaBlock>

          <MetaBlock title="Derived sample metadata">
            <MetaLine label="Version" value={sampleDerivedScoresMeta.version} />
            <MetaLine label="Status" value={sampleDerivedScoresMeta.status} />
            <MetaParagraph>{sampleDerivedScoresMeta.description}</MetaParagraph>
          </MetaBlock>
        </div>
      </Section>
    </section>
  );
}

function PageHero() {
  return (
    <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 shadow-2xl shadow-cyan-950/30 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
        Sample data preview
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
        Real-stat scaffold preview
      </h2>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-cyan-50/80 md:text-base">
        Inspect the manual sample raw-stat and derived-score rows that support the future
        ClutchLab data migration. This page is a product-facing preview, not a live
        esports ranking page.
      </p>
    </div>
  );
}

function WarningPanel() {
  return (
    <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/10 p-5">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-200">
        Sample only / not live stats
      </p>
      <p className="mt-3 max-w-5xl text-sm leading-7 text-amber-50/85">
        The rows on this page are manual sample data for validating the data architecture.
        They do not replace the current demo/manual player cards, team pages, map pages,
        compare pages or roster builder scoring.
      </p>
    </div>
  );
}

function AdapterOverview() {
  return (
    <div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-200">
            Score adapter layer
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-fuchsia-50/85">
            {scoreAdapterLayerMeta.description}
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-fuchsia-50/70">
            {scoreAdapterLayerMeta.publicUiBehavior}
          </p>
        </div>

        <div className="grid min-w-full gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <MiniStat label="Status" value={adapterCoverage.status} />
          <MiniStat label="Player scores" value={adapterCoverage.playerScores} />
          <MiniStat label="Team scores" value={adapterCoverage.teamScores} />
          <MiniStat label="Map fit scores" value={adapterCoverage.mapFitScores} />
        </div>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur md:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{title}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{description}</p>
      </div>

      {children}
    </section>
  );
}

function DataCard({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      {children}
    </article>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>;
}

function Metric({
  label,
  value,
  digits = 1,
  suffix = "",
}: {
  label: string;
  value: number | undefined;
  digits?: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">
        {formatNumber(value, digits)}
        {value === undefined ? "" : suffix}
      </p>
    </div>
  );
}

function ScorePill({
  value,
  suffix = "",
}: {
  value: number | undefined;
  suffix?: string;
}) {
  const tone =
    value === undefined
      ? "border-slate-500/30 bg-slate-500/10 text-slate-300"
      : value >= 90
        ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
        : value >= 80
          ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
          : "border-amber-300/40 bg-amber-300/15 text-amber-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-right ${tone}`}>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] opacity-75">
        Score
      </p>
      <p className="text-2xl font-black">
        {formatNumber(value)}
        {value === undefined ? "" : suffix}
      </p>
    </div>
  );
}

function AdapterMeta<T>({ result }: { result: ScoreAdapterResult<T> }) {
  return (
    <div className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-4">
      <div className="flex flex-wrap gap-2">
        <StatusChip label="source" value={result.source} />
        <StatusChip label="status" value={result.status} />
        {result.confidence ? (
          <StatusChip label="confidence" value={result.confidence} />
        ) : null}
        {result.formulaId ? (
          <StatusChip label="formula" value={result.formulaId} />
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {result.periodStart ? (
          <MiniStat label="Period start" value={result.periodStart} />
        ) : null}
        {result.periodEnd ? (
          <MiniStat label="Period end" value={result.periodEnd} />
        ) : null}
      </div>

      {result.sourceIds && result.sourceIds.length > 0 ? (
        <p className="mt-3 text-xs leading-5 text-fuchsia-50/70">
          Source ids: {result.sourceIds.join(", ")}
        </p>
      ) : null}

      {result.reason ? (
        <p className="mt-3 text-xs leading-5 text-amber-100">{result.reason}</p>
      ) : null}
    </div>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-fuchsia-100">
      {label}: {value}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MetaBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function MetaParagraph({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-slate-400">{children}</p>;
}

function EntityLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-cyan-100 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-white hover:decoration-cyan-200"
    >
      {children}
    </Link>
  );
}

function formatNumber(value: number | undefined, digits = 1) {
  if (value === undefined) {
    return "—";
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(digits);
}

function nameForPlayer(playerId: string) {
  return playerDisplayNames.get(playerId) ?? playerId;
}

function nameForTeam(teamId: string) {
  return teamNames.get(teamId) ?? teamId;
}

function nameForMap(mapId: string) {
  return mapDisplayNames.get(mapId) ?? mapId;
}

function nameForEntity(entityId: string, entityType: string) {
  if (entityType === "player") {
    return nameForPlayer(entityId);
  }

  if (entityType === "team") {
    return nameForTeam(entityId);
  }

  return entityId;
}

function pathForEntity(entityId: string, entityType: string) {
  if (entityType === "player") {
    return `/players/${entityId}`;
  }

  if (entityType === "team") {
    return `/teams/${entityId}`;
  }

  return "/sample-data";
}
