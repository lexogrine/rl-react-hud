import React from "react";
import { avatars } from "../../api/avatars";
import "./TeamBox.scss";

interface Props {
  side: "blue" | "orange";
  lastBallHit: any;
  players: any[];
}

// TODO: Add interfaces
const TeamBox = (props: Props) => {
  const { side, lastBallHit, players } = props;
  console.log('AVS', avatars);

  const createPlayerBox = (player: any) => (
    <div className={"player-box " + side}>
      {avatars[player.steamid]?.url ? (
        <img src={avatars[player.steamid]?.url} alt="" className="avatar" />
      ) : (
        <div className="avatar" />
      )}
      <img
        alt="Player"
        className="background"
        src={
          side === "blue" ? "images/playerBlue.png" : "images/playerOrange.png"
        }
      />
      <div className="name">{player.name}</div>
      <div className="data-box">
        <span className="datum">Goals</span>
        <span className="datum">{player.goals}</span>
      </div>
      <div className="data-box">
        <span className="datum">Shots</span>
        <span className="datum">{player.shots}</span>
      </div>
      <div className="data-box">
        <span className="datum">Assists</span>
        <span className="datum">{player.assists}</span>
      </div>
      {lastBallHit && lastBallHit.player.id === player.id && (
        <img className="ball" src="images/ball.png" alt="ball" />
      )}
    </div>
  );

  if (!players) return null;
  return (
    <div className={"team-box " + side}>{players.map(createPlayerBox)}</div>
  );
};

export default TeamBox;
