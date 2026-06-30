import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  getMapFitScore,
  getPlayerDerivedScore,
  getRosterValueScore,
  getScoreAdapterCoverageSummary,
  getTeamDerivedScore,
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
  scoreAdapterLayerMeta,
  teams,
  type ScoreAdapterResult,
} from "../data";

const playerDisplayNames = new Map([
  ["zywoo", "ZywOo"],
  ["donk", "donk"],
  ["monesy", "m0NESY"],
]);

const mapDisplayNames = new Map([
  ["mirage", "Mirage"],
  ["nuke", "Nuke"],
]);

const teamDisplayNames = new Map(teams.map((team) => [team.id, team.name]));

const adapterCoverage = getScoreAdapterCoverageSummary();

export function SampleDataPage() {
  return (
    <div className="space-y-6">
      <Hero />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Sample raw players"
          value={sampleRawStatsSummary.players}
          detail={sampleRawStatsMeta.status}
        />
        <SummaryCard
          label="Sample raw teams"
          value={sampleRawStatsSummary.teams}
          detail={`${sampleRawStatsSummary.windows} windows`}
        />
        <SummaryCard
          label="Sample score players"
          value={sampleDerivedScoresSummary.playerScores}
          detail={sampleDerivedScoresMeta.status}
        />
        <SummaryCard
          label="Sample score teams"
          value={sampleDerivedScoresSummary.teamScores}
          detail={`${sampleDerivedScoresSummary.mapFitScores} map fits`}
        />
      </section>

      <WarningPanel />
      <AdapterOverview />

      <DataSection
        eyebrow="Raw stats"
        title="Player raw stat samples"
        description="Manual sample rows shaped like future imported player stats. These rows are not live official data."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {samplePlayerRawStats.map((row) => (
            <DataCard key={row.playerId}>
              <CardHeader
                title={nameForPlayer(row.playerId)}
                subtitle={`Player id: ${row.playerId}`}
                to={`/players/${row.playerId}`}
              />
              <MetricGrid>
                <Metric label="Maps" value={row.mapsPlayed} />
                <Metric label="Rounds" value={row.roundsPlayed} />
                <Metric label="Rating" value={formatDecimal(row.rating)} />
                <Metric label="ADR" value={formatDecimal(row.adr)} />
                <Metric label="K/D" value={formatDecimal(row.kd)} />
                <Metric label="KAST" value={formatPercent(row.kast)} />
                <Metric
                  label="Opening success"
                  value={formatPercent(row.openingSuccess)}
                />
                <Metric
                  label="Clutch wins"
                  value={`${formatOptionalNumber(row.clutchWins)}/${formatOptionalNumber(row.clutchAttempts)}`}
                />
              </MetricGrid>
            </DataCard>
          ))}
        </div>
      </DataSection>

      <DataSection
        eyebrow="Raw stats"
        title="Team raw stat samples"
        description="Manual sample rows shaped like future imported team stats."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sampleTeamRawStats.map((row) => (
            <DataCard key={row.teamId}>
              <CardHeader
                title={nameForTeam(row.teamId)}
                subtitle={`Team id: ${row.teamId}`}
                to={`/teams/${row.teamId}`}
              />
              <MetricGrid>
                <Metric label="Maps" value={row.mapsPlayed} />
                <Metric label="Rounds" value={row.roundsPlayed} />
                <Metric label="Win rate" value={formatPercent(row.winRate)} />
                <Metric label="Round win" value={formatPercent(row.roundWinRate)} />
                <Metric label="T rounds" value={formatPercent(row.tRoundWinRate)} />
                <Metric label="CT rounds" value={formatPercent(row.ctRoundWinRate)} />
                <Metric
                  label="Pistol rounds"
                  value={formatPercent(row.pistolRoundWinRate)}
                />
                <Metric label="Conversion" value={formatPercent(row.conversionRate)} />
              </MetricGrid>
            </DataCard>
          ))}
        </div>
      </DataSection>

      <DataSection
        eyebrow="Generic adapters"
        title="Player derived score samples"
        description="These cards now read through generic adapters with allowSample=true because this route is a labeled preview page."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {samplePlayerDerivedScores.map((row) => {
            const adapter = getPlayerDerivedScore(row.playerId, {
              allowSample: true,
            });
            const score = adapter.value ?? row;

            return (
              <DataCard key={row.playerId}>
                <CardHeader
                  title={nameForPlayer(row.playerId)}
                  subtitle="Generic player adapter"
                  to={`/players/${row.playerId}`}
                />
                <AdapterMeta result={adapter} />
                <MetricGrid>
                  <Metric label="Impact" value={score.impact} />
                  <Metric label="Clutch" value={score.clutch} />
                  <Metric label="Opening" value={score.opening} />
                  <Metric label="AWP" value={score.awp} />
                  <Metric label="Rifle" value={score.rifle} />
                  <Metric label="Consistency" value={score.consistency} />
                  <Metric label="Value" value={formatOptionalNumber(score.value)} />
                  <Metric label="Components" value={score.components?.length ?? 0} />
                </MetricGrid>
              </DataCard>
            );
          })}
        </div>
      </DataSection>

      <DataSection
        eyebrow="Generic adapters"
        title="Team derived score samples"
        description="Generic team helper usage is preview-only and still visibly marked as sample data."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sampleTeamDerivedScores.map((row) => {
            const adapter = getTeamDerivedScore(row.teamId, {
              allowSample: true,
            });
            const score = adapter.value ?? row;

            return (
              <DataCard key={row.teamId}>
                <CardHeader
                  title={nameForTeam(row.teamId)}
                  subtitle="Generic team adapter"
                  to={`/teams/${row.teamId}`}
                />
                <AdapterMeta result={adapter} />
                <MetricGrid>
                  <Metric label="Overall" value={score.overall} />
                  <Metric label="Firepower" value={score.firepower} />
                  <Metric label="Structure" value={score.structure} />
                  <Metric label="Map pool" value={score.mapPool} />
                  <Metric label="Clutch" value={score.clutch} />
                  <Metric label="Form" value={score.form} />
                  <Metric label="Components" value={score.components?.length ?? 0} />
                </MetricGrid>
              </DataCard>
            );
          })}
        </div>
      </DataSection>

      <DataSection
        eyebrow="Generic adapters"
        title="Map fit score samples"
        description="Generic map-fit helper usage with allowSample=true. Public map pages remain unchanged."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sampleMapFitScores.map((row) => {
            const adapter = getMapFitScore(
              {
                mapId: row.mapId,
                entityId: row.entityId,
                entityType: row.entityType,
              },
              { allowSample: true },
            );
            const score = adapter.value ?? row;

            return (
              <DataCard key={`${row.mapId}-${row.entityType}-${row.entityId}`}>
                <CardHeader
                  title={`${nameForMap(row.mapId)} fit`}
                  subtitle={`${row.entityType}: ${nameForEntity(row.entityId, row.entityType)}`}
                  to={`/maps/${row.mapId}`}
                />
                <AdapterMeta result={adapter} />
                <MetricGrid>
                  <Metric label="Fit" value={score.fit} />
                  <Metric label="AWP fit" value={formatOptionalNumber(score.awpFit)} />
                  <Metric
                    label="Entry fit"
                    value={formatOptionalNumber(score.entryFit)}
                  />
                  <Metric
                    label="Anchor fit"
                    value={formatOptionalNumber(score.anchorFit)}
                  />
                  <Metric label="Lurk fit" value={formatOptionalNumber(score.lurkFit)} />
                  <Metric
                    label="Support fit"
                    value={formatOptionalNumber(score.supportFit)}
                  />
                  <Metric label="Components" value={score.components?.length ?? 0} />
                </MetricGrid>
              </DataCard>
            );
          })}
        </div>
      </DataSection>

      <DataSection
        eyebrow="Generic adapters"
        title="Roster value score samples"
        description="Generic roster-value helper usage with allowSample=true. Roster Builder scoring remains unchanged."
      >
        <div className="grid gap-4">
          {sampleRosterValueScores.map((row) => {
            const adapter = getRosterValueScore(row.rosterId, {
              allowSample: true,
            });
            const score = adapter.value ?? row;

            return (
              <DataCard key={row.rosterId}>
                <CardHeader title={row.rosterId} subtitle="Generic roster adapter" />
                <AdapterMeta result={adapter} />
                <div className="mb-4 flex flex-wrap gap-2">
                  {score.playerIds.map((playerId) => (
                    <Link
                      key={playerId}
                      to={`/players/${playerId}`}
                      className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100 transition hover:border-cyan-200 hover:text-white"
                    >
                      {nameForPlayer(playerId)}
                    </Link>
                  ))}
                </div>
                <MetricGrid>
                  <Metric label="Value" value={formatOptionalNumber(score.value)} />
                  <Metric label="Role coverage" value={score.roleCoverage} />
                  <Metric label="Firepower" value={score.firepower} />
                  <Metric label="Clutch" value={score.clutch} />
                  <Metric label="Map fit" value={score.mapFit} />
                  <Metric label="Balance" value={score.balance} />
                  <Metric label="Cost" value={score.totalCost} />
                  <Metric label="Budget" value={score.budgetLimit} />
                </MetricGrid>
                {score.warnings.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-200">
                      Warnings
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-50">
                      {score.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </DataCard>
            );
          })}
        </div>
      </DataSection>

      <DataSection
        eyebrow="Metadata"
        title="Adapter and sample metadata"
        description="The metadata below is used to keep sample preview behavior separate from public scoring behavior."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DataCard>
            <MetadataList
              items={[
                ["Raw sample status", sampleRawStatsMeta.status],
                ["Raw sample version", sampleRawStatsMeta.version],
                ["Derived sample status", sampleDerivedScoresMeta.status],
                ["Derived sample version", sampleDerivedScoresMeta.version],
              ]}
            />
          </DataCard>

          <DataCard>
            <MetadataList
              items={[
                ["Adapter status", scoreAdapterLayerMeta.status],
                ["Adapter version", scoreAdapterLayerMeta.version],
                [
                  "Generic allowSample",
                  String(scoreAdapterLayerMeta.genericDefaults.allowSample),
                ],
                [
                  "Generic preferReal",
                  String(scoreAdapterLayerMeta.genericDefaults.preferReal),
                ],
              ]}
            />
          </DataCard>

          <DataCard>
            <MetadataList
              items={[
                ["Sample player scores", adapterCoverage.playerScores],
                ["Sample team scores", adapterCoverage.teamScores],
                ["Real player scores", adapterCoverage.realPlayerScores],
                ["Real team scores", adapterCoverage.realTeamScores],
              ]}
            />
          </DataCard>
        </div>
      </DataSection>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200">
        Sample Data
      </p>
      <h1 className="mt-3 text-3xl font-black text-white md:text-5xl">
        Sample Data Preview
      </h1>
      <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300 md:text-base">
        Preview raw stat samples, derived score samples and adapter metadata for the
        future real-stat migration. This page is intentionally separated from public
        scoring pages.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="cyan">Sample only</Badge>
        <Badge tone="amber">Not live stats</Badge>
        <Badge tone="slate">Generic adapters allowSample=true</Badge>
      </div>
    </section>
  );
}

function WarningPanel() {
  return (
    <section className="rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-5">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-200">
        Important
      </p>
      <p className="mt-3 text-sm leading-6 text-amber-50">
        These rows are manual samples for schema, adapter and UI validation. They are not
        live official statistics and they do not replace demo/manual public page scores.
      </p>
    </section>
  );
}

function AdapterOverview() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
            Adapter layer
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Generic adapter preview usage
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            This page now calls generic score adapter helpers with{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-100">
              allowSample: true
            </code>
            . Public routes remain protected by validation and keep their existing scoring
            behavior.
          </p>
        </div>

        <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2 lg:min-w-[420px]">
          <MiniMeta label="Status" value={scoreAdapterLayerMeta.status} />
          <MiniMeta label="Version" value={scoreAdapterLayerMeta.version} />
          <MiniMeta
            label="allowSample default"
            value={String(scoreAdapterLayerMeta.genericDefaults.allowSample)}
          />
          <MiniMeta
            label="preferReal default"
            value={String(scoreAdapterLayerMeta.genericDefaults.preferReal)}
          />
        </div>
      </div>
    </section>
  );
}

function DataSection({
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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function DataCard({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 shadow-xl shadow-slate-950/20">
      {children}
    </article>
  );
}

function CardHeader({
  title,
  subtitle,
  to,
}: {
  title: string;
  subtitle: string;
  to?: string;
}) {
  const titleNode = (
    <h3 className="text-lg font-black text-white transition hover:text-cyan-100">
      {title}
    </h3>
  );

  return (
    <div className="mb-4">
      {to ? <Link to={to}>{titleNode}</Link> : titleNode}
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function AdapterMeta<T>({ result }: { result: ScoreAdapterResult<T> }) {
  return (
    <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3">
      <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <MiniMeta label="Source" value={result.source} />
        <MiniMeta label="Status" value={result.status} />
        <MiniMeta label="Confidence" value={result.confidence ?? "n/a"} />
        <MiniMeta label="Formula" value={result.formulaId ?? "n/a"} />
        <MiniMeta label="Period start" value={result.periodStart ?? "n/a"} />
        <MiniMeta label="Period end" value={result.periodEnd ?? "n/a"} />
      </div>
      {result.sourceIds && result.sourceIds.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Source ids: {result.sourceIds.join(", ")}
        </p>
      )}
      {result.reason && (
        <p className="mt-2 text-xs leading-5 text-amber-100">{result.reason}</p>
      )}
    </div>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-white">{value}</p>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <span className="text-slate-500">{label}: </span>
      <span className="font-bold text-slate-100">{value}</span>
    </div>
  );
}

function MetadataList({ items }: { items: Array<[string, string | number]> }) {
  return (
    <dl className="space-y-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-bold text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Badge({
  children,
  tone,
}: {
  children: string;
  tone: "cyan" | "amber" | "slate";
}) {
  const classes = {
    cyan: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
    amber: "border-amber-300/30 bg-amber-400/10 text-amber-100",
    slate: "border-white/10 bg-white/10 text-slate-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

function nameForPlayer(playerId: string) {
  return playerDisplayNames.get(playerId) ?? playerId;
}

function nameForTeam(teamId: string) {
  return teamDisplayNames.get(teamId) ?? teamId;
}

function nameForMap(mapId: string) {
  return mapDisplayNames.get(mapId) ?? mapId;
}

function nameForEntity(entityId: string, entityType: "player" | "team" | "roster") {
  if (entityType === "player") {
    return nameForPlayer(entityId);
  }

  if (entityType === "team") {
    return nameForTeam(entityId);
  }

  return entityId;
}

function formatOptionalNumber(value: number | undefined) {
  return value ?? "n/a";
}

function formatDecimal(value: number | undefined) {
  if (value === undefined) {
    return "n/a";
  }

  return value.toFixed(2);
}

function formatPercent(value: number | undefined) {
  if (value === undefined) {
    return "n/a";
  }

  const normalized = value > 1 ? value : value * 100;

  return `${normalized.toFixed(1)}%`;
}
