export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  country: string;
  steamid: string;
  team: string;
  extra: Record<string, string>;
}

export interface Team {
  _id: string;
  name: string;
  country: string;
  shortName: string;
  logo: string;
  extra: Record<string, string>;
}

export interface TournamentMatchup {
	_id: string;
	loser_to: string | null; // IDs of Matchups, not Matches
	winner_to: string | null;
	label: string;
	matchId: string | null;
	parents: TournamentMatchup[];
}

export interface DepthTournamentMatchup extends TournamentMatchup {
	depth: number;
	parents: DepthTournamentMatchup[];
}

export interface Tournament {
	_id: string;
	name: string;
	logo: string;
	matchups: TournamentMatchup[];
	autoCreate: boolean;
}
export interface Match {
  id: string;
  current: boolean;
  left: {
    id: string | null;
    wins: number;
  };
  matchType: 'bo1' | 'bo2' | 'bo3' | 'bo5' | 'bo7' | 'bo9';
  startTime: number;
  right: {
    id: string | null;
    wins: number;
  };
}
