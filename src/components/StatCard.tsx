export function StatCard({
  title,
  value,
  subtitle,
  danger = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        danger
          ? "border-red-400/30 bg-red-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className={`mt-2 text-3xl font-black ${danger ? "text-red-300" : "text-white"}`}>
        {value}
      </div>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}
