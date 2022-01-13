import React, { useEffect, useState } from "react";

import TopBox from "../TopBox";
import TeamBox from "../TeamBox";
import ObservedPlayerBox from "../ObservedPlayerBox";
import { Player, StatfeedEvent } from "../../lhm-rl-module";

import "./Layout.scss";
import Scoreboard from "../Scoreboard";

enum MatchStates {
  InProgress,
  PostGame,
}

interface Props {
  game: any;
  ballHit: any;
  players: any;
  teams: any;
  isReplay: boolean;
  isOvertime: boolean;
  statfeedEvents: StatfeedEvent[];
  matchState: MatchStates;
  bestOf?: string;
  showObserved: boolean;
}

// TODO: Add interfaces
const Layout = (props: Props) => {
  const {
    game,
    ballHit,
    players,
    teams,
    isReplay,
    statfeedEvents,
    isOvertime,
    bestOf,
    showObserved,
  } = props;

  const [lastObservedPlayer, setLastObservedPlayer] = useState<Player | null>(
    null
  );

  useEffect(() => {
    if (game?.target) {
      const p: Player = players?.find((p: Player) => p.id === game?.target);
      if (p) {
        setLastObservedPlayer(p);
      }
    }
  }, [game?.target, players]);

  if (!props.game) return null;

  const steamids = players?.filter((p: Player) => p.steamid)?.map((p: Player) => p.steamid) || [] as string[];

  return (
    <div className="layout">
      <div className={`replay-box ${isReplay ? "show" : "hide"}`}>
        <div
          className="replay-box-title"
          style={{ backgroundImage: `url('images/replay.svg')` }}
        >
          Replay
        </div>
      </div>
      <TopBox
        time={game.time || game.time_seconds || game.time_milliseconds}
        blueScore={game.teams[0]?.score}
        orangeScore={game.teams[1]?.score}
        blueTeamName={teams.blue?.name}
        orangeTeamName={teams.orange?.name}
        blueTeamId={teams.blue?.id}
        orangeTeamId={teams.orange?.id}
        blueMatchScore={teams.blue?.map_score}
        orangeMatchScore={teams.orange?.map_score}
        label={bestOf || game.arena?.replace(/_/g, " ")}
        isOvertime={isOvertime}
      />
      {props.matchState !== MatchStates.PostGame && (
        <>
          <TeamBox
            side="blue"
            lastBallHit={ballHit}
            players={players?.filter((p: Player) => p.team === 0)}
            statfeedEvents={statfeedEvents.filter(
              (e: StatfeedEvent) => e.main_target.team_num === 0
            )}
          />
          <TeamBox
            side="orange"
            lastBallHit={ballHit}
            players={players?.filter((p: Player) => p.team === 1)}
            statfeedEvents={statfeedEvents.filter(
              (e: StatfeedEvent) => e.main_target.team_num === 1
            )}
          />
        </>
      )}
      <ObservedPlayerBox
        player={lastObservedPlayer || undefined}
        show={showObserved && !!game?.target}
        steamids={steamids}
      />
      {props.matchState === MatchStates.PostGame && (
        <Scoreboard players={players} />
      )}
    </div>
  );
};

export default Layout;
