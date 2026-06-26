import type { PlayerRole } from "../types";

export function RoleBadge({ role }: { role: PlayerRole }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">
      {role}
    </span>
  );
}
