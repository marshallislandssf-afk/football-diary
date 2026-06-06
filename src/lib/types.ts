export type Competition = {
  name: string;
  country: string;
  leagueId?: number;
  logo?: string;
};

export type Team = {
  name: string;
  logo?: string;
};

export type Player = {
  id?: number;
  name: string;
  number?: number;
  position?: string;
  photo?: string;
  isStarter?: boolean;
  cameOn?: boolean;       // came on as substitute
  cameOnMinute?: number;  // minute they came on
  wentOff?: boolean;      // was substituted off
  wentOffMinute?: number;
  unusedSub?: boolean;    // named sub but never came on
};

export type Lineup = {
  home: Player[];
  away: Player[];
};

export type Annotation = {
  id: string;
  type: 'promotion' | 'milestone' | 'goal' | 'special' | 'custom';
  text: string;
  emoji?: string;
};

export type MatchNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type MatchImage = {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
};

export type Match = {
  id: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  competition: Competition;
  venue?: string;
  lineup?: Lineup;
  annotations?: Annotation[];
  notes?: MatchNote[];
  images?: MatchImage[];
  isManual?: boolean;
  apiFixtureId?: number;
};
