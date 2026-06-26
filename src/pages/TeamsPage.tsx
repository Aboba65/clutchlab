import { useNavigate } from "react-router-dom";
import { players, teams } from "../data";
import { TeamCard } from "../components/TeamCard";

function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}

export function TeamsPage() {
  const navigate = useNavigate();

  return (
    <section className="grid gap-6">
      <PageTitle
        title="Teams"
        description="Команды пока демо. Позже здесь будут реальные составы, форма, map pool и role balance."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => {
          const teamPlayers = players.filter((player) => team.players.includes(player.id));

          return (
            <TeamCard
              key={team.id}
              team={team}
              teamPlayers={teamPlayers}
              onClick={() => navigate(`/teams/${team.id}`)}
            />
          );
        })}
      </div>
    </section>
  );
}
