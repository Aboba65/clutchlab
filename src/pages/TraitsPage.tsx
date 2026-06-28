import { players } from "../data";
import type { CS2Player } from "../types";
import { getPlayerImpact } from "../lib";
import { Panel } from "../components/Panel";
import { Score } from "../components/Score";

function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}

export function TraitsPage() {
  const topImpact = [...players]
    .sort((a, b) => getPlayerImpact(b) - getPlayerImpact(a))
    .slice(0, 5);
  const topClutch = [...players]
    .sort((a, b) => b.stats.clutch - a.stats.clutch)
    .slice(0, 5);
  const topAWP = [...players].sort((a, b) => b.stats.awp - a.stats.awp).slice(0, 5);
  const topEntry = [...players]
    .sort((a, b) => b.stats.opening - a.stats.opening)
    .slice(0, 5);

  return (
    <section className="grid gap-6">
      <PageTitle
        title="Traits"
        description="Рейтинги по типам игроков: impact, clutch, AWP и entry pressure."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TraitList
          title="Highest Impact"
          players={topImpact}
          value={(p) => getPlayerImpact(p)}
        />
        <TraitList
          title="Best Clutch"
          players={topClutch}
          value={(p) => p.stats.clutch}
        />
        <TraitList title="Best AWPers" players={topAWP} value={(p) => p.stats.awp} />
        <TraitList
          title="Best Entry Pressure"
          players={topEntry}
          value={(p) => p.stats.opening}
        />
      </div>
    </section>
  );
}

function TraitList({
  title,
  players,
  value,
}: {
  title: string;
  players: CS2Player[];
  value: (player: CS2Player) => number;
}) {
  return (
    <Panel title={title}>
      <div className="grid gap-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-black">
                {index + 1}
              </div>
              <div>
                <div className="font-black">{player.nickname}</div>
                <div className="text-sm text-slate-400">{player.role}</div>
              </div>
            </div>
            <Score value={Math.round(value(player))} />
          </div>
        ))}
      </div>
    </Panel>
  );
}
