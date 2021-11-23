import React from "react";
import { avatars } from "../../api/avatars";
import { StatfeedEvent } from "../../lhm-rl-module";
import "./TeamBox.scss";

interface Props {
  side: "blue" | "orange";
  lastBallHit: any;
  players: any[];
  statfeedEvents: StatfeedEvent[];
}

const eventWhitelist: {event_name: string, icon: string, colorOverride?: string, type: string}[] = [
  {event_name: "EpicSave", icon: "epicsave", type: "Epic Save"},
  {event_name: "Save", icon: "save", type: "Save"},
  {event_name: "Shot", icon: "shot", type: "Shot on Goal"},
  { event_name: "Demolish", icon: "demolition", colorOverride: "#FF464DE5", type: "Demolition"},
]

// TODO: Add interfaces
const TeamBox = (props: Props) => {
  const { side, lastBallHit, players, statfeedEvents } = props;

  const createPlayerBox = (player: any) => {
    const earliest = Date.now() - (3 * 1000); // show only events within the last few seconds
    const visibleEvent = statfeedEvents.filter(event => (
      eventWhitelist.find(e => (e.event_name === event.event_name || e.type === event.type)) &&
      event.main_target.id === player.id &&
      event.timestamp &&
      event.timestamp >= earliest
    )).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))[0]  // || { event_name: 'Shot', type: 'Shot', icon: 'shot' };

    const foundEventSpec = eventWhitelist.find(e => (e.event_name === visibleEvent?.event_name) || (e.type === visibleEvent?.type));
    const icon = foundEventSpec?.icon || 'default';
    const colorOverride = foundEventSpec?.colorOverride;

    const boostNumClassName = player.boost > 60 ? 'very-high' : (player.boost > 40 ? "high" : (player.boost > 20 ? "low" : "critical"));

    return (
      <div className={"player-box " + side}>
        {avatars[player.steamid]?.url ? (
          <div className="avatar" style={{ backgroundImage: `url('${avatars[player.steamid]?.url}')` }} />
        ) : (
          <div className="avatar" />
        )}
        <div className={`data-outer-container ${visibleEvent ? 'hide' : 'show'}`}>
          <div className="name-box">
            <span className={`boost-num ${boostNumClassName} ${player.isSonic ? 'shake' : ''}`}>{player.boost}</span>
            <span className={`name ${player.isSonic ? 'shake' : ''}`}>{player.name}</span>
          </div>
          <div className="boost-meter">
            <div className="grey" style={{ backgroundImage: `url('images/boost/grey.svg')` }} />
            <div className="fill" style={{ backgroundImage: `url('images/boost/fill.svg')`, width: `${player.boost || 0}%` }} />
          </div>
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
        </div>
        <div
          className={`statfeed-event ${visibleEvent ? `show ${(visibleEvent.event_name || visibleEvent.type?.replaceAll(' ', '-') ).toLowerCase()}` : 'hide'}`}
          style={{ backgroundImage: `url('images/eventIcons/${icon}.png')`, backgroundColor: colorOverride}}
        >
          {visibleEvent && visibleEvent.type}
        </div>
        {!visibleEvent && lastBallHit && lastBallHit.player.id === player.id && (
          <img className="ball" src="images/ball.png" alt="ball" />
        )}
      </div>
    )
  };

  if (!players) return null;
  return (
    <div className={"team-box " + side}>{players.map(createPlayerBox)}</div>
  );
};

export default TeamBox;
