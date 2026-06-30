import type { ReactNode } from "react";
import type { ScoreAdapterResult } from "../data";

type ScorePreviewCardTone = "cyan" | "amber" | "slate";

export type ScorePreviewCardProps<T> = {
  title: string;
  description: string;
  result: ScoreAdapterResult<T>;
  children?: ReactNode;
  disclaimer?: string;
};

const defaultDisclaimer =
  "This preview is not used for ranking, sorting or roster-builder scoring.";

export function ScorePreviewCard<T>({
  title,
  description,
  result,
  children,
  disclaimer = defaultDisclaimer,
}: ScorePreviewCardProps<T>) {
  const hasValue = result.value !== undefined;
  const tone = getResultTone(result);

  return (
    <section
      className={`rounded-[1.75rem] border p-5 shadow-xl shadow-slate-950/20 ${toneClasses[tone].shell}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p
            className={`text-xs font-black uppercase tracking-[0.35em] ${toneClasses[tone].eyebrow}`}
          >
            Derived preview
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge label="Source" value={result.source} tone={tone} />
          <StatusBadge label="Status" value={result.status} tone={tone} />
          <StatusBadge
            label="Confidence"
            value={result.confidence ?? "n/a"}
            tone={tone}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <MetaItem label="Formula" value={result.formulaId ?? "n/a"} />
        <MetaItem label="Period start" value={result.periodStart ?? "n/a"} />
        <MetaItem label="Period end" value={result.periodEnd ?? "n/a"} />
      </div>

      {result.sourceIds && result.sourceIds.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Source ids
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.sourceIds.map((sourceId) => (
              <span
                key={sourceId}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200"
              >
                {sourceId}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.reason && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-200">
            Fallback reason
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-50">{result.reason}</p>
        </div>
      )}

      {hasValue && children && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          {children}
        </div>
      )}

      {!hasValue && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm leading-6 text-slate-300">
            No real-derived score is available yet. Current page values should continue
            using the demo/manual MVP dataset.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-500">{disclaimer}</p>
    </section>
  );
}

function StatusBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: ScorePreviewCardTone;
}) {
  return (
    <div
      className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${toneClasses[tone].badge}`}
    >
      <span className="opacity-70">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function getResultTone<T>(result: ScoreAdapterResult<T>): ScorePreviewCardTone {
  if (result.status === "active") {
    return "cyan";
  }

  if (result.status === "sample") {
    return "amber";
  }

  return "slate";
}

const toneClasses: Record<
  ScorePreviewCardTone,
  {
    shell: string;
    eyebrow: string;
    badge: string;
  }
> = {
  cyan: {
    shell: "border-cyan-300/20 bg-cyan-400/10",
    eyebrow: "text-cyan-200",
    badge: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
  },
  amber: {
    shell: "border-amber-300/20 bg-amber-400/10",
    eyebrow: "text-amber-200",
    badge: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  },
  slate: {
    shell: "border-white/10 bg-slate-950/70",
    eyebrow: "text-slate-500",
    badge: "border-white/10 bg-white/10 text-slate-200",
  },
};
