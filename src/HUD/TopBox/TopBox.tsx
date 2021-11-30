import React from "react";
import { apiUrl } from "../../api/api";
import "./TopBox.scss";

interface Props {
  time?: number;
  blueScore?: number;
  orangeScore?: number;
  label?: string;
  blueTeamName?: string;
  orangeTeamName?: string;
  blueTeamId?: number;
  orangeTeamId?: number;
  isOvertime?: boolean;
  blueMatchScore?: number;
  orangeMatchScore?: number;
}

const TopBox = (props: Props) => {
  const {
    time,
    blueScore,
    orangeScore,
    label,
    blueTeamName,
    orangeTeamName,
    blueTeamId,
    orangeTeamId,
    blueMatchScore,
    orangeMatchScore,
    isOvertime
  } = props;
  const minutes = time ? Math.floor(time / 60) % 60 : 0;
  const seconds = time ? Math.floor(time) % 60 : 0;

  const labelToMax = () => {
    switch (label) {
      case "bo1": return 0;
      case "bo2": return 1;
      case "bo3": return 2;
      case "bo5": return 3;
      case "bo7": return 4;
      case "bo9": return 5;
      default: return 0;
    }
  }

  const generateMatchScoreBoxes = (amount: number) => {
    const boxes = [];
    const max = labelToMax();

    if (!max) return null;

    for (let i = 0; i < Math.min(amount, max); i++) {
      boxes.push(
        <div className={`match-score`} key={i}/>
      );
    }
    for (let i = 0; i < max - amount; i++) {
      boxes.push(<div className={`match-score empty`} key={i + amount + 1} />);
    }
    return <>{boxes}</>;
  }

  return (
    <div className="top-box">
      <div className="inner-container">
        <img
          src="images/top.png"
          className="top-box-background"
          alt="Top box background"
        />
        {blueTeamId !== undefined && (
          <div
            style={{
              backgroundImage: `url(${apiUrl}api/teams/logo/${blueTeamId})`,
            }}
            className="team-image blue"
          />
        )}
        {orangeTeamId !== undefined && (
          <div
            style={{
              backgroundImage: `url(${apiUrl}api/teams/logo/${orangeTeamId})`,
            }}
            className="team-image orange"
          />
        )}
        <span className="time">
          {minutes}:{seconds < 10 ? "0" + seconds : seconds}
        </span>
        {isOvertime && <span className="overtime">Overtime</span>}
        <span className="score blue">{blueScore}</span>
        <span className="score orange">{orangeScore}</span>
        <span className="team-name blue">{blueTeamName || "Team 1"}</span>
        <span className="team-name orange">{orangeTeamName || "Team 2"}</span>
        <div className="match-score-box blue">
          {generateMatchScoreBoxes(blueMatchScore || 0)}
        </div>
        <div className="match-score-box orange">
          {generateMatchScoreBoxes(orangeMatchScore || 0)}
        </div>
        <span className="match-name">
          {label && label?.length > 10
            ? `${label?.slice(0, 10)}...`
            : label || "Game"}
        </span>
      </div>
    </div>
  );
};

export default TopBox;
