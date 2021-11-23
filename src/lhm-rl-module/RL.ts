import fs from "fs";
import {
  Game,
  RawGame,
  ServerEvent,
  RawTeam,
  Player,
  RawPlayer,
  UpdateStateEvent,
  BallHitEvent,
  GoalScoreEvent,
  StatfeedEvent,
  RLEvent,
  MatchCreatedEvent,
  MatchDestroyedEvent,
  GameInitializedEvent,
  EventLogLevel,
  ExtendedRLEvent,
} from "./interfaces";

import example from "./example.json";

export * from "./interfaces";

// TODO: Customize log
const log = console.log;
const error = console.error;

// const log = (...x: any) => {};
// const error = (...x: any) => {};

export default class RL {
  state: "INITIALIZING" | "READY" | "READY_WITH_ERRORS" | "ERROR" =
    "INITIALIZING";
  game: Game | null = null;
  players: Player[] = [];
  events: ExtendedRLEvent[] = [
    {
      name: "module:info",
      description: "Module initialized",
      timestamp: new Date(),
    },
  ];

  private eventQueue: ExtendedRLEvent[] = [];
  readonly startTime: Date = new Date();

  private debugDumpFrequencySeconds: number = 0;
  private debugLastDumpTime: Date = new Date();
  private debugLastDumpIndex: number = -1;
  // private gameListener: any = null;
  // private ballListener: any = null;
  private listeners: { event: string; func: (data: any) => void }[] = [];
  private client: WebSocket | null = null;

  constructor(config?: {
    client?: WebSocket;
    sourceFilePath?: string;
    debugDumpFrequencySeconds?: number;
    listeners?: { event: string; func: (data: any) => void }[];
  }) {
    if (config?.client) {
      this.client = config.client;
      log("Connection opened on", config.client.url);

      this.client.onmessage = (data: any) => {
        this.addEvent(this.parseEvent(data.data));
      };

      this.client.onclose = () => {
        log("Connection closed");
      };
    }

    if (config?.debugDumpFrequencySeconds)
      this.debugDumpFrequencySeconds = config.debugDumpFrequencySeconds;

    if (config?.listeners) this.listeners = config.listeners;

    if (config?.sourceFilePath) {
      log("Running module in fake data mode");
      log("Loading from:", config.sourceFilePath);

      try {
        const file = null;
        try {
          const parsed: ExtendedRLEvent[] = example as any;
          this.eventQueue = parsed.map((x) => ({
            ...x,
            timestamp: new Date(x.timestamp),
          }));
          this.handleQueueEvent();
        } catch (e) {
          error(
            "Unable to parse file, please make sure it's in a proper format! (comma-separated JSON objects, no trailing comma)"
          );
          error(e);
        }
      } catch (e) {
        error("Unable to open file!");
        error(e);
      }
    }
    this.state = "READY";
  }

  feed = (data: string) =>
    this.state === "READY" && this.addEvent(this.parseEvent(data));

  private handleQueueEvent = () => {
    const ev = this.eventQueue.shift();
    if (!ev) return;

    const now = new Date();
    this.addEvent({ ...ev, timestamp: now });

    if (!this.eventQueue.length) return;

    setTimeout(
      () => this.handleQueueEvent(),
      Math.min(
        this.eventQueue[0].timestamp.getTime() - ev.timestamp.getTime(),
        5000
      )
    );
  };

  private updateGame = (game: RawGame) => {
    this.game = {
      ...game,
      ball: {
        ...game.ball,
        location: game.ball.location
          ? {
              x: game.ball.location.X,
              y: game.ball.location.Y,
              z: game.ball.location.Z,
            }
          : this.game?.ball.location || { x: 0, y: 0, z: 0 },
        team: game.ball.team,
      },
      teams: game.teams.map((team: RawTeam, index: number) => ({
        ...team,
        colorPrimary: team.color_primary,
        colorSecondary: team.color_secondary,
        players: this.players.filter((player) => player.team === index),
      })),
      winner: null,
    };
  };

  private updatePlayers = (players: { [key: string]: RawPlayer }) => {
    const playerArray: Player[] = [];
    for (let p of Object.keys(players)) {
      playerArray.push(players[p]);
    }

    // FIXME: This works only because Player and RawPlayer are currently the same
    this.players = playerArray;
  };

  private resetGame = () => {
    this.game = null;
  };

  private addEvent = (event: ExtendedRLEvent) => {
    let modifiedData = event.data;

    switch (event.name) {
      case "game:update_state":
        const data = event.data;
        if (data.hasGame) {
          if (!data.game) {
            error("Missing game data from event");
          } else {
            this.updatePlayers(data.players);
            this.updateGame(data.game);
            modifiedData = { ...modifiedData, game: this.game };
          }
        } else {
          log('Game reset')
          this.resetGame();
        }
        break;
    }

    this.listeners.find((l) => l.event === event.name)?.func(modifiedData);
    this.events.push({ ...event, data: modifiedData });

    if (event.logLevel === undefined || event.logLevel >= 1) {
      log(
        `[${event.timestamp.toISOString()}] ${event.name} >`,
        event.description, event.data
      );
    }

    if (
      this.debugDumpFrequencySeconds &&
      new Date().getTime() - this.debugLastDumpTime.getTime() >=
        this.debugDumpFrequencySeconds * 1000
    ) {
      fs.appendFile(
        "events.lhmd",
        this.events
          .slice(Math.max(this.debugLastDumpIndex, 0), this.events.length - 1)
          .map((x) => JSON.stringify(x))
          .join(",") + ",",
        (err) => {
          if (err) console.log("ERROR: Couldn't dump data");
          else {
            console.log("Data dumped to file");
            this.debugLastDumpTime = new Date();
            this.debugLastDumpIndex = this.events.length - 1;
          }
        }
      );
    }
  };

  private parseEvent = (eventString: string) => {
    const event: ServerEvent = JSON.parse(eventString);
    const [eventCategory, eventName] = event.event.split(":");

    const resolvers: {
      [key: string]: { [key: string]: (data: any) => RLEvent };
    } = {
      sos: {
        version: (data: string) => ({
          description: `SOS Plugin version: ${data}`,
        }),
      },
      game: {
        match_created: (data: MatchCreatedEvent) => ({
          description: "Match created",
          data,
        }),
        match_destroyed: (data: MatchDestroyedEvent) => ({
          description: "Match destroyed",
          data,
        }),
        initialized: (data: GameInitializedEvent) => ({
          description: "Game initialized",
          data,
        }),
        clock_started: () => ({
          description: "Clock started",
          logLevel: EventLogLevel.VERBOSE,
        }),
        clock_stopped: () => ({
          description: "Clock stopped",
          logLevel: EventLogLevel.VERBOSE,
        }),
        goal_scored: (data: GoalScoreEvent) => ({
          data,
          description: `Goal scored by ${data.scorer.name} for team ${data.scorer.teamnum}`,
        }),
        clock_updated_seconds: () => ({
          description: "Clock updated",
          logLevel: EventLogLevel.VERBOSE,
        }),
        round_started_go: () => ({ description: "Round started" }),
        ball_hit: (data: BallHitEvent) => ({
          description: `Ball hit by ${data.player.name}`,
          data,
        }),
        statfeed_event: (data: StatfeedEvent) => ({
          description: "Statfeed event",
          data,
          // logLevel: EventLogLevel.VERBOSE,
        }),
        pre_countdown_begin: () => ({ description: "Countdown is starting" }),
        post_countdown_begin: () => ({ description: "Countdown has started" }),
        replay_start: () => ({ description: "Replay start" }),
        replay_end: () => ({ description: "Replay end" }),
        replay_will_end: () => ({ description: "Replay will end" }),
        update_state: (data: UpdateStateEvent) => {
          // console.log('State update:', data)
          if (data.hasGame) {
            if (!data.game) {
              error("Missing game data from event");
              return {
                description: "No game available (conflicting data)",
                logLevel: EventLogLevel.ERROR,
              };
            }

            this.updatePlayers(data.players);
            this.updateGame(data.game);

            return {
              description: "State update",
              data,
              logLevel: EventLogLevel.VERBOSE,
            };
          }

          this.resetGame();
          return { description: "No game available" };
        },
      },
    };

    const timestamp = new Date();
    const resolver = resolvers[eventCategory][eventName];

    if (!resolver) {
      console.log("Unsupported event:", event.event, "\n", event.data);
      return { name: event.event, description: "Module error", timestamp };
    } else {
      const ev = resolver(event.data) || {
        description: "Module error",
        logLevel: EventLogLevel.ERROR,
      };

      return { ...ev, timestamp, name: event.event };
    }
  };
}
