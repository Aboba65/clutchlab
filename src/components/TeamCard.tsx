import type { CS2Player, CS2Team } from "../types";
import { Metric } from "./Metric";
import { Score } from "./Score";

export function TeamCard({
  team,
  teamPlayers,
  onClick,
}: {
  team: CS2Team;
  teamPlayers: CS2Player[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">{team.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{team.region}</p>
        </div>
        <Score value={team.scores.form} />
      </div>

      <div className="mt-5 grid gap-3">
        <Metric label="Firepower" value={team.scores.firepower} />
        <Metric label="Structure" value={team.scores.structure} />
        <Metric label="Map Pool" value={team.scores.mapPool} />
        <Metric label="Clutch" value={team.scores.clutch} />
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Players
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {teamPlayers.length > 0 ? (
            teamPlayers.map((player) => (
              <span
                key={player.id}
                className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300"
              >
                {player.nickname}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No demo players</span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Best maps
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {team.bestMaps.map((map) => (
            <span
              key={map}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200"
            >
              {map}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
