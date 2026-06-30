import { RatingExplanationCard } from "../components/RatingExplanationCard";
import { defaultRatingExplanationItems } from "../components/ratingExplanationItems";
import { dataMeta } from "../data";

const methodologyCards = [
  {
    title: "What current values are",
    description:
      "Current ratings, prices and product scores are demo/manual MVP values used to test ClutchLab navigation, comparison and roster-building logic.",
  },
  {
    title: "What current values are not",
    description:
      "They are not live official esports statistics, market prices, salaries, buyouts or official world rankings.",
  },
  {
    title: "What comes next",
    description:
      "Future real-derived scores should include source, period, confidence and fallback metadata before they replace public scoring.",
  },
];

const dataSafetyCards = [
  {
    label: "Sample data",
    value: "Preview only",
    detail:
      "Sample-derived rows are visible only on the labeled Sample Data preview route.",
  },
  {
    label: "Public pages",
    value: "Stable",
    detail:
      "Player, team, map, compare and roster pages still use the existing MVP dataset.",
  },
  {
    label: "Real-derived scores",
    value: "Planned",
    detail:
      "The real-derived layer exists as an empty scaffold until validated rows are available.",
  },
];

export function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
          About ClutchLab
        </p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              CS2 analytics MVP for players, teams, maps and roster logic.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              ClutchLab is a product prototype for exploring CS2 player profiles, team
              profiles, map fit, role balance, comparison pages and roster construction.
              The current version focuses on interface quality, data architecture and safe
              migration toward future real-derived statistics.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Current data status
            </p>
            <p className="mt-3 text-2xl font-black text-amber-200">{dataMeta.status}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Last documented update:{" "}
              <span className="font-semibold text-slate-200">{dataMeta.lastUpdated}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Dataset version:{" "}
              <span className="font-semibold text-slate-200">{dataMeta.version}</span>
            </p>
          </div>
        </div>
      </section>

      <RatingExplanationCard
        title="How to read current ratings"
        description="These explanations describe the current MVP/demo/manual values before any public scoring migration. They help users understand what the numbers mean without changing scoring, sorting or roster-builder logic."
        items={defaultRatingExplanationItems}
        tone="amber"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {methodologyCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/20"
          >
            <h2 className="text-lg font-black text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
            Data safety
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Public scoring is intentionally unchanged.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The explanation block above is read-only. It does not call score adapters,
            does not opt into sample-derived rows, does not change sorting, and does not
            affect Roster Builder calculations.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {dataSafetyCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-xl font-black text-white">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-950/20">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200">
          Methodology direction
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Future real-derived scores need metadata before public migration.
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          The planned scoring migration should show where a score came from, what period
          it covers, how confident the product is in that value, and what fallback is used
          when real-derived data is unavailable.
        </p>
      </section>
    </div>
  );
}
