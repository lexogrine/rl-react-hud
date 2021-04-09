export interface Game {
  arena: string;
  ball: Ball;
  isOT: boolean;
  isReplay: boolean;
  target: string | null;
  teams: Team[];
  time: number;
  winner: Team | null;
}

export enum EventLogLevel {
  VERBOSE = 0,
  INFO = 1,
  ERROR = 2,
}

export interface RawGame {
  arena: string;
  hasTarget: boolean;
  hasWinner: boolean;
  isOT: boolean;
  isReplay: boolean;
  target: string;
  teams: RawTeam[];
  ball: RawBall;
  time: number;
  winner: string;
}

export interface RawTeam {
  name: string;
  score: number;
  color_primary: string;
  color_secondary: string;
}

export interface Ball {
  location: {
    x: number;
    y: number;
    z: number;
  };
  speed: number;
  team: number;
}

export interface RawBall {
  location: {
    X: number;
    Y: number;
    Z: number;
  };
  speed: number;
  team: number;
}

export interface Team {
  name: string;
  score: number;
  colorPrimary: string;
  colorSecondary: string;
  players: Player[];
}

export interface Player extends RawPlayer {}

export interface RawPlayer {
  assists: number;
  attacker: string;
  boost: number;
  carTouches: number;
  demos: number;
  goals: number;
  hasCar: boolean;
  id: string;
  isDead: boolean;
  isPowersliding: boolean;
  isSonic: boolean;
  location: {
    X: number;
    Y: number;
    Z: number;
    pitch: number;
    roll: number;
    yaw: number;
  };
  name: string;
  primaryID: number;
  saves: number;
  score: number;
  shortcut: number;
  shots: number;
  speed: number;
  team: number;
  touches: number;
}

export interface BallHitEvent {
  ball: {
    location: { X: number; Y: number; Z: number };
    post_hit_speed: number;
    pre_hit_speed: number;
  };
  match_guid: string;
  player: { id: string; name: string };
}

export interface UpdateStateEvent {
  event: string;
  game: RawGame;
  hasGame: boolean;
  players: { [key: string]: RawPlayer };
}

export interface ServerEvent {
  event: string;
  data: any;
}

export interface GoalScoreEvent {
  assister: { id: string; name: string };
  ball_last_touch: { player: string; speed: number };
  goalspeed: number;
  goaltime: number;
  impact_location: { X: number; Y: number };
  scorer: { id: string; name: string; teamnum: number };
}

export interface StatfeedEvent {
  main_target: { id: string; name: string; team_num: number };
  match_guid: string;
  secondary_target: { id: string; name: string; team_num: number };
  type: string;
}

export interface MatchCreatedEvent {
  match_guid: string;
}

export interface MatchDestroyedEvent {
  match_guid: string;
}

export interface GameInitializedEvent {
  match_guid: string;
}

export interface RLEvent {
  data?: UpdateStateEvent | ServerEvent | GoalScoreEvent | StatfeedEvent | any;
  description?: string;
  logLevel?: EventLogLevel; // 1 if not provided
}

export interface ExtendedRLEvent extends RLEvent {
  name: string;
  timestamp: Date;
}
