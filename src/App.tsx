import React, { useEffect, useState } from "react";
import RL, { Player, RawTeam } from "./lhm-rl-module"; // TODO: Make an actual module out of this. Hubert pls help.
import Layout from "./HUD/Layout";
import api, { port, isDev } from "./api/api";
import ActionManager, { ConfigManager } from "./api/actionManager";
import io from "socket.io-client";

import "./index.css";

export const actions = new ActionManager();
export const configs = new ConfigManager();

export const socket = io(isDev ? `localhost:${port}` : "/");

function App() {
  const parseAndUpdateGame = async (data: any) => {
    const playerExtension = await api.players.get();
    const playersToExtend: Player[] = Object.values(data.players);

    const final = playersToExtend.map((p: Player) => {
      const found = playerExtension.find((e) => e.steamid === p.name);
      if (!found) return p;
      return { ...p, ...found };
    });

    setGame({
      ...data,
      teams: data.teams.map((t: RawTeam, index: number) => ({
        ...t,
        players: final.filter((p) => p.team === index),
      })),
    });
    setPlayers(final);
  };

  /*
  const [WS, setWS] = useState<WebSocket | null>(
    new WebSocket("ws://192.168.1.235:49122")
  );
  */

  const [game, setGame] = useState<any>(null);
  const [ballHit, setBallHit] = useState<any>(null);
  const [players, setPlayers] = useState<any>(null);
  const [listeners, setListeners] = useState<
    { event: string; func: (data: any) => void }[]
  >([
    { event: "game:update_state", func: parseAndUpdateGame },
    { event: "game:ball_hit", func: setBallHit },
  ]);
  const [RLI, setRLI] = useState<RL | null>(new RL({ listeners }));

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
      socket.emit("register", name, isDev);
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

    // socket.on("update_mirv", (data: any) => {
    // 	GSI.digestMIRV(data);
    // })

    socket.on("match", () => {
      // loadMatch(true);
    });
  }, [RLI]);

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
      <Layout game={game} ballHit={ballHit} players={players} />
    </div>
  );
}

export default App;
