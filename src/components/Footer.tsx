import { Link } from "react-router-dom";
import { dataMeta } from "../data";

const githubUrl = "https://github.com/Aboba65/clutchlab";
const liveUrl = "https://clutchlab-olive.vercel.app/";

export function Footer() {
  return (
    <footer className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            ClutchLab MVP
          </p>
          <p className="mt-3 text-base font-bold text-white">
            CS2 analytics workspace for players, teams, maps and roster logic.
          </p>
          <p className="mt-2 leading-6 text-slate-400">
            Current dataset status:{" "}
            <span className="font-semibold text-amber-200">{dataMeta.status}</span>.
            Ratings, prices and custom indexes are demo/manual values for product testing,
            not live official esports statistics.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <FooterCard
            label="Version"
            value="0.2.6"
            detail="Real-derived scaffold validation"
          />
          <FooterCard
            label="Data updated"
            value={dataMeta.lastUpdated}
            detail={dataMeta.version}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-2">
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/sample-data">Sample Data</FooterLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/CHANGELOG.md`}>
            Changelog
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/tree/main/src/data`}>
            Data
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/DATA_SOURCES.md`}>
            Sources
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/SAMPLE_REAL_STATS.md`}>
            Sample stats
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/SAMPLE_STATS_VALIDATION.md`}
          >
            Sample validation
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/SAMPLE_DERIVED_SCORES.md`}
          >
            Sample scores
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/SAMPLE_DERIVED_SCORES_VALIDATION.md`}
          >
            Score validation
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/SAMPLE_DATA_PAGE.md`}>
            Sample data docs
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/UI_MIGRATION_PLAN.md`}>
            UI migration
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/SCORE_ADAPTERS.md`}>
            Score adapters
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/SCORE_ADAPTERS_VALIDATION.md`}
          >
            Adapter validation
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/REAL_DERIVED_SCORES_PLAN.md`}
          >
            Real-derived plan
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/REAL_DERIVED_SCORES.md`}>
            Real-derived
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/REAL_DERIVED_SCORES_VALIDATION.md`}
          >
            Real-derived validation
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/RAW_STATS_MODEL.md`}>
            Raw stats
          </FooterExternalLink>
          <FooterExternalLink
            href={`${githubUrl}/blob/main/docs/DERIVED_SCORES_MODEL.md`}
          >
            Derived scores
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/MODEL_VALIDATION.md`}>
            Model validation
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/SITEMAP.md`}>
            Sitemap
          </FooterExternalLink>
          <FooterExternalLink href={`${githubUrl}/blob/main/docs/REAL_STATS_PLAN.md`}>
            Real stats
          </FooterExternalLink>
          <FooterExternalLink href={githubUrl}>GitHub</FooterExternalLink>
          <FooterExternalLink href={liveUrl}>Live site</FooterExternalLink>
        </nav>

        <p className="text-xs text-slate-500">
          Built with React, TypeScript, Vite and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}

function FooterCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/60 hover:text-white"
    >
      {children}
    </Link>
  );
}

function FooterExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/60 hover:text-white"
    >
      {children}
    </a>
  );
}
