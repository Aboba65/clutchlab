import { dataMeta } from "../data";

const statusLabels: Record<string, string> = {
  "demo-manual": "Demo / manual data",
};

export function DataNotice() {
  const statusLabel = statusLabels[dataMeta.status] ?? dataMeta.status;

  return (
    <section className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm text-slate-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-200">
            Data notice
          </p>

          <h2 className="mt-2 text-xl font-black text-white">{statusLabel}</h2>

          <p className="mt-2 max-w-4xl text-slate-300">
            Current ClutchLab ratings, prices, team scores, map fit scores and custom
            indexes are manual MVP values for interface testing. They should not be
            treated as live or official esports statistics.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
          <DataNoticeMetric title="Version" value={dataMeta.version} />
          <DataNoticeMetric title="Updated" value={dataMeta.lastUpdated} />
          <DataNoticeMetric title="Status" value={statusLabel} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <DataNoticeMetric title="Players" value={dataMeta.coverage.players.toString()} />
        <DataNoticeMetric title="Teams" value={dataMeta.coverage.teams.toString()} />
        <DataNoticeMetric title="Maps" value={dataMeta.coverage.maps.toString()} />
        <DataNoticeMetric title="Roles" value={dataMeta.coverage.roles.toString()} />
      </div>
    </section>
  );
}

function DataNoticeMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 font-black text-amber-100">{value}</p>
    </div>
  );
}
