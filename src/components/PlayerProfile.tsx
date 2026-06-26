import type { CS2Player } from "../types";
import { teams } from "../data";
import { getPlayerImpact, getTeamName } from "../lib";
import { Metric } from "./Metric";
import { RoleBadge } from "./RoleBadge";
import { Score } from "./Score";

export function PlayerProfile({ player }: { player: CS2Player }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-3xl font-black">{player.nickname}</h3>
          <p className="mt-1 text-slate-400">
            {player.country} · {getTeamName(player.teamId, teams)}
          </p>
        </div>
        <Score value={getPlayerImpact(player)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={player.role} />
        {player.traits.map((trait) => (
          <span key={trait} className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
            {trait}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <Metric label="Impact" value={getPlayerImpact(player)} />
        <Metric label="Opening" value={player.stats.opening} />
        <Metric label="Clutch" value={player.stats.clutch} />
        <Metric label="AWP" value={player.stats.awp} />
        <Metric label="Rifle" value={player.stats.rifle} />
      </div>
    </article>
  );
}
