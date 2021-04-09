import React from "react";
import "./TopBox.scss";

interface Props {
  time?: number;
  blueScore?: number;
  orangeScore?: number;
  label?: string;
  blueTeamName?: string;
  orangeTeamName?: string;
}

const TopBox = (props: Props) => {
  const {
    time,
    blueScore,
    orangeScore,
    label,
    blueTeamName,
    orangeTeamName,
  } = props;
  const minutes = time ? Math.floor(time / 60) % 60 : 0;
  const seconds = time ? Math.floor(time) % 60 : 0;

  return (
    <div className="top-box">
      <div className="inner-container">
        <img
          src="/images/top.png"
          className="top-box-background"
          alt="Top box background"
        />
        <span className="time">
          {minutes}:{seconds < 10 ? "0" + seconds : seconds}
        </span>
        <span className="score blue">{blueScore}</span>
        <span className="score orange">{orangeScore}</span>
        <span className="team-name blue">{blueTeamName || "Team 1"}</span>
        <span className="team-name orange">{orangeTeamName || "Team 2"}</span>
        <span className="match-name">{label || "Game"}</span>
      </div>
    </div>
  );
};

export default TopBox;
