import React from 'react';
import { Player } from '../../lhm-rl-module/interfaces';
import { avatars } from "../../api/avatars";

import './Scoreboard.scss';

interface Props {
    players: Player[];
}

const Scoreboard = (props: Props) => {
    const playerBox = (player: Player, index: number) => (
        <div className={`player-box delay-${index} ${player.team === 0 ? 'blue' : 'orange'}`}>
            {(player.steamid && avatars[player.steamid]?.url) ? (
            <div className="avatar" style={{ backgroundImage: `url('${avatars[player.steamid]?.url}')` }} />
            ) : (
            <div className="avatar" />
            )}
            <div className="name">{player.name}</div>
            <div className="stats">
                <div className="stat">{player.goals}</div>
                <div className="stat">{player.shots}</div>
                <div className="stat">{player.assists}</div>
            </div>
        </div>
    );

    if (!props.players) return null;

    return (
        <div className="scoreboard">
            <div className="header">Round stats</div>
            <div className="results">
                <div className="result-box left">
                    <div className="inner-header">
                        <div className="stat-name">Goals</div>
                        <div className="stat-name">Shots</div>
                        <div className="stat-name">Assists</div>
                    </div>
                    {props.players.filter(p => p.team === 0).map(playerBox)}
                </div>
                <div className="result-box right">
                    <div className="inner-header">
                        <div className="stat-name">Goals</div>
                        <div className="stat-name">Shots</div>
                        <div className="stat-name">Assists</div>
                    </div>
                    {props.players.filter(p => p.team === 1).map(playerBox)}
                </div>
            </div>
        </div>
    )
};

export default Scoreboard;