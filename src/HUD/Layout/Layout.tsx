import React from "react";

import TopBox from "../TopBox";
import TeamBox from "../TeamBox";
import { Player } from "../../lhm-rl-module";

interface Props {
  game: any;
  ballHit: any;
  players: any;
  teams: any;
}

// TODO: Add interfaces
const Layout = (props: Props) => {
  if (!props.game) return null;

  const { game, ballHit, players, teams } = props;
  return (
    <div className="layout">
      <TopBox
        time={game.time || game.time_seconds || game.time_milliseconds}
        blueScore={game.teams[0]?.score}
        orangeScore={game.teams[1]?.score}
        blueTeamName={teams.blue?.name}
        orangeTeamName={teams.orange?.name}
        blueTeamId={teams.blue?.id}
        orangeTeamId={teams.orange?.id}
        label={game.arena?.replace(/_/g, " ")}
      />
      <TeamBox
        side="blue"
        lastBallHit={ballHit}
        players={players?.filter((p: Player) => p.team === 0)}
      />
      <TeamBox
        side="orange"
        lastBallHit={ballHit}
        players={players?.filter((p: Player) => p.team === 1)}
      />
    </div>
  );
};

export default Layout;
