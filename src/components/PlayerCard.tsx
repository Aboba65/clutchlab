import type { CS2Player } from "../types";
import { getPlayerImpact } from "../lib";
import { Metric } from "./Metric";
import { RoleBadge } from "./RoleBadge";
import { Score } from "./Score";

export function PlayerCard({
  player,
  onClick,
}: {
  player: CS2Player;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-black">{player.nickname}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {player.country} · {player.age}
          </p>
        </div>
        <Score value={getPlayerImpact(player)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={player.role} />
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
          ${player.price}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <Metric label="Rating" value={Math.round(player.stats.rating * 100)} />
        <Metric label="ADR" value={Math.round(player.stats.adr)} />
        <Metric label="Clutch" value={player.stats.clutch} />
      </div>
    </button>
  );
}
