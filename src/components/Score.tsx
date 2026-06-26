export function Score({ value }: { value: number }) {
  return (
    <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-cyan-300 px-3 text-sm font-black text-slate-950">
      {value}
    </span>
  );
}
