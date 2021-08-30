import React, { useEffect, useState } from "react";
import RL, { Player, RawTeam } from "./lhm-rl-module"; // TODO: Make an actual module out of this. Hubert pls help.
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

function App() {
  const parseAndUpdateGame = async (data: any) => {
    const playerExtension = await api.players.get();
    const playersToExtend: Player[] = Object.values(data.players);

    const final = playersToExtend.map((p: Player) => {
      loadAvatarURL(p.name); // Loading player avatars, placed here because why not
      const found =
        playerExtension && playerExtension.find((e) => e.steamid === p.name);
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
    if (!dataLoader.match || force) {
      dataLoader.match = new Promise((resolve) => {
        api.match
          .getCurrent()
          .then((m) => {
            if (!m) {
              dataLoader.match = null;
              return;
            }
            setMatch(m);

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
                setBlueTeam(gsiTeamData);
              });
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
                setOrangeTeam(gsiTeamData);
              });
            }
          })
          .catch(() => {
            dataLoader.match = null;
          });
      });
    }
  };

  /*
  const [WS, setWS] = useState<WebSocket | null>(
    new WebSocket("ws://192.168.1.235:49122")
  );
  */

  const [game, setGame] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [ballHit, setBallHit] = useState<any>(null);
  const [players, setPlayers] = useState<any>(null);
  const [listeners, setListeners] = useState<
    { event: string; func: (data: any) => void }[]
  >([
    { event: "game:update_state", func: parseAndUpdateGame },
    { event: "game:ball_hit", func: setBallHit },
  ]);
  const [RLI, setRLI] = useState<RL | null>(new RL({ listeners }));
  // const [teams, setTeams] = useState<{ blue: any; orange: any }>({
  //   blue: null,
  //   orange: null,
  // });
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
      window.top.location.reload();
    });

    socket.on("update", (data: string) => RLI?.feed(data));

    socket.on("match", () => {
      loadMatch(true);
    });

    loadMatch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  useEffect(() => {
    if (!WS) {
      console.log("No WebSocket available!");
      return;
    }

    WS.onopen = () => console.log("Connection opened.");
    WS.onmessage = (message: any) => RLI?.feed(message.data);
    WS.onclose = () => {
      console.log("Connection closed. Attempting to reconnect...");
      setWS(new WebSocket("ws://192.168.1.235:499"));
    };
  }, [WS]);
  */

  if (!game) return null;

  return (
    <div className="App">
      <Layout
        match={match}
        game={game}
        ballHit={ballHit}
        players={players}
        teams={{ blue: blueTeam, orange: orangeTeam }}
      />
    </div>
  );
}

export default App;
