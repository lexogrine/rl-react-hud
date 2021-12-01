import React, { useEffect, useState } from "react";
import RL, { Player, RawTeam, StatfeedEvent } from "./lhm-rl-module";
import Layout from "./HUD/Layout";
import api, { port, isDev } from "./api/api";
import { loadAvatarURL } from "./api/avatars";
import ActionManager, { ConfigManager } from "./api/actionManager";
import io from "socket.io-client";

import "./index.css";

export const actions = new ActionManager();
export const configs = new ConfigManager();

export const socket = io(isDev ? `localhost:${port}` : "/");

interface DataLoader {
  match: Promise<void> | null;
}

const dataLoader: DataLoader = {
  match: null,
};

enum MatchStates {
  InProgress,
  PostGame,
}

function App() {
  const parseAndUpdateGame = async (data: any) => {
    const playerExtension = await api.players.get();
    const playersToExtend: Player[] = Object.values(data.players);

    const final = playersToExtend.map((p: Player) => {
      loadAvatarURL(p.name); // Loading player avatars, placed here because why not
      const found =
        playerExtension && playerExtension.find((e) => e.steamid?.toLowerCase() === p.name?.toLowerCase());
        // Let's see if this helps with avatar loading issues

      if (!found) return p;
      const merged = {
        ...p,
        ...found,
        name: found.username || p.name,
        team: p.team,
        teamId: found.team,
      };
      return merged;
    });

    setGame({
      ...data.game,
      teams: data.game.teams?.map((t: RawTeam, index: number) => ({
        ...t,
        players: final.filter((p) => p && p.team && p.team === index),
      })),
    });
    setPlayers(final);
  };

  const loadMatch = async (force = false) => {
    console.log('[Match] Loading match...');
    if (!dataLoader.match || force) {
    console.log('[Match] Forced =', force, '\n', dataLoader.match);
      dataLoader.match = new Promise((resolve) => {
        api.match
          .getCurrent()
          .then((m) => {
            if (!m) {
              dataLoader.match = null;
              return;
            }
            setMatch(m);
            console.log('[Match] Setting match to', m);

            if (m.left.id) {
              api.teams.getOne(m.left.id).then((left) => {
                const gsiTeamData = {
                  id: left._id,
                  name: left.name,
                  country: left.country,
                  logo: left.logo,
                  map_score: m.left.wins,
                  extra: left.extra,
                  color_primary: game?.teams?.[0].color_primary,
                  color_secondary: game?.teams?.[0].color_secondary,
                };
                console.log('[Match] Setting left team to', gsiTeamData);
                setBlueTeam(gsiTeamData);
              });
            }
            else {
              console.log('[Match] No left team, but setting left team wins to', m.left.wins);
              setBlueTeam({ map_score: m.left.wins });
            }

            if (m.right.id) {
              api.teams.getOne(m.right.id).then((right) => {
                const gsiTeamData = {
                  id: right._id,
                  name: right.name,
                  country: right.country,
                  logo: right.logo,
                  map_score: m.right.wins,
                  extra: right.extra,
                  color_primary: game?.teams?.[1].color_primary,
                  color_secondary: game?.teams?.[1].color_secondary,
                };
                console.log('[Match] Setting right team to', gsiTeamData);
                setOrangeTeam(gsiTeamData);
              });
            }
            else {
              console.log('[Match] No right team, but setting right team wins to', m.right.wins);
              setOrangeTeam({ map_score: m.right.wins });
            }
          })
          .catch((e: any) => {
            dataLoader.match = null;
            console.log('[Match] Error loading match', e);
          });
      });
    }
  };

  const handleStatfeedEvent = (data: StatfeedEvent) => {
    setStatfeedEvents((prev) => [...prev, { ...data, timestamp: Date.now() }]);
  }

  const [game, setGame] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [ballHit, setBallHit] = useState<any>(null);
  const [players, setPlayers] = useState<any>(null);
  const [replay, setReplay] = useState<boolean>(false);
  const [matchState, setMatchState] = useState<MatchStates>(MatchStates.InProgress);
  const [statfeedEvents, setStatfeedEvents] = useState<StatfeedEvent[]>([]);
  const [listeners, _setListeners] = useState<
    { event: string; func: (data: any) => void }[]
  >([
    { event: "game:update_state", func: parseAndUpdateGame },
    { event: "game:ball_hit", func: setBallHit },
    { event: "game:replay_start", func: () => setReplay(true) },
    { event: "game:replay_end", func: () => setReplay(false) },
    { event: "game:statfeed_event", func: handleStatfeedEvent },
    { event: "game:podium_start", func: () => setMatchState(MatchStates.PostGame) },
    { event: "game:match_destroyed", func: () => { setMatch(null); setGame(null); setMatchState(MatchStates.InProgress) } },
    { event: "game:round_started_go", func: () => setMatchState(MatchStates.InProgress) },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [RLI, _setRLI] = useState<RL | null>(new RL({ listeners }));
  const [blueTeam, setBlueTeam] = useState<any>(null);
  const [orangeTeam, setOrangeTeam] = useState<any>(null);

  useEffect(() => {
    const href = window.location.href;
    socket.emit("started");
    let isDev = false;
    let name = "";
    if (href.indexOf("/huds/") === -1) {
      isDev = true;
      name = (Math.random() * 1000 + 1)
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 15);
    } else {
      const segment = href.substr(href.indexOf("/huds/") + 6);
      name = segment.substr(0, segment.lastIndexOf("/"));
    }

    socket.on("readyToRegister", () => {
      socket.emit("register", name, isDev, "rocketleague");
    });
    socket.on(`hud_config`, (data: any) => {
      configs.save(data);
    });
    socket.on(`hud_action`, (data: any) => {
      actions.execute(data.action, data.data);
    });
    socket.on("keybindAction", (action: string) => {
      actions.execute(action);
    });

    socket.on("refreshHUD", () => {
      window.top?.location.reload();
    });

    socket.on("update", (data: string) => RLI?.feed(data));

    socket.on("match", () => {
      loadMatch(true);
    });

    loadMatch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!game) return null;

  return (
    <div className="App">
      <Layout
        game={game}
        ballHit={ballHit}
        players={players}
        teams={{ blue: blueTeam, orange: orangeTeam }}
        isReplay={replay}
        statfeedEvents={statfeedEvents}
        matchState={matchState}
        isOvertime={game.isOT}
        bestOf={match?.matchType}
      />
    </div>
  );
}

export default App;
