export function Warning({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
      {text}
    </div>
  );
}
