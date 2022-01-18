import React from "react";
import { avatars } from "../../api/avatars";
import { Player } from "../../lhm-rl-module";
import CameraView from "../Camera/Camera";
import CameraContainer from "../Camera/Container";

import "./ObservedPlayerBox.scss";

interface Props {
  player?: Player;
  show: boolean;
  steamids: string[];
}

const ObservedPlayerBox = (props: Props) => {
  const { player, show } = props;
  const steamid = player?.steamid || "";
  if (!player) return null;

  return (
    <div
      className={`observed-player-box ${
        player.team === 0 ? "blue" : "orange"
      } ${show ? "show" : "hide"}`}
    >
      <div className="avatar-box">
        {avatars[steamid]?.url ? (
          <div
            className="avatar"
            style={{
              backgroundImage: `url('${avatars[steamid]?.url}')`,
            }}
          >
            <CameraContainer
              observedSteamid={steamid}
              players={props.steamids}
            />
          </div>
        ) : (
          <div className="avatar">
            <CameraContainer
              observedSteamid={steamid}
              players={props.steamids}
            />
          </div>
        )}
      </div>
      <div className="left-portion">
        <div className="name-box">{player.name}</div>
      </div>
      <div className="right-portion">
        <div className="info-box">
          <div className="value">{player.score}</div>
          <div className="info-name">Score</div>
        </div>
        <div className="info-box">
          <div className="value">{player.goals}</div>
          <div className="info-name">Goals</div>
        </div>
        <div className="info-box">
          <div className="value">{player.shots}</div>
          <div className="info-name">Shots</div>
        </div>
        <div className="info-box">
          <div className="value">{player.assists}</div>
          <div className="info-name">Assists</div>
        </div>
        <div className="info-box">
          <div className="value">{player.saves}</div>
          <div className="info-name">Saves</div>
        </div>
      </div>
      <div className="accent-decoration" />
    </div>
  );
};

export default ObservedPlayerBox;
