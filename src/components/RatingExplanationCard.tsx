import type { ReactNode } from "react";
import {
  defaultRatingExplanationFooter,
  type RatingExplanationItem,
} from "./ratingExplanationItems";

export type { RatingExplanationItem } from "./ratingExplanationItems";

export type RatingExplanationCardTone = "cyan" | "amber" | "slate";

export type RatingExplanationCardProps = {
  title: string;
  description: string;
  items: RatingExplanationItem[];
  tone?: RatingExplanationCardTone;
  footer?: ReactNode;
};

export function RatingExplanationCard({
  title,
  description,
  items,
  tone = "slate",
  footer = defaultRatingExplanationFooter,
}: RatingExplanationCardProps) {
  return (
    <section
      className={`rounded-[1.75rem] border p-5 shadow-xl shadow-slate-950/20 ${toneClasses[tone].shell}`}
    >
      <div className="max-w-4xl">
        <p
          className={`text-xs font-black uppercase tracking-[0.35em] ${toneClasses[tone].eyebrow}`}
        >
          Rating explanation
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <ExplanationItem key={item.label} item={item} />
        ))}
      </div>

      {footer && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm leading-6 text-slate-300">{footer}</p>
        </div>
      )}
    </section>
  );
}

function ExplanationItem({ item }: { item: RatingExplanationItem }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">
        {item.label}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{item.explanation}</p>
    </article>
  );
}

const toneClasses: Record<
  RatingExplanationCardTone,
  {
    shell: string;
    eyebrow: string;
  }
> = {
  cyan: {
    shell: "border-cyan-300/20 bg-cyan-400/10",
    eyebrow: "text-cyan-200",
  },
  amber: {
    shell: "border-amber-300/20 bg-amber-400/10",
    eyebrow: "text-amber-200",
  },
  slate: {
    shell: "border-white/10 bg-slate-950/70",
    eyebrow: "text-slate-500",
  },
};
