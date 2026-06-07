export type Competition = {
  name: string;
  country: string;
  leagueId?: number;
  logo?: string;
};

export type Team = {
  name: string;
  logo?: string;
  apiId?: number;
};

export type Player = {
  id?: number;
  name: string;
  number?: number;
  position?: string;
  isStarter?: boolean;
  cameOn?: boolean;
  cameOnMinute?: number;
  wentOff?: boolean;
  wentOffMinute?: number;
  unusedSub?: boolean;
};

export type Lineup = {
  home: Player[];
  away: Player[];
};

export type MatchEvent = {
  minute: number;
  extra?: number;
  team: string;
  player: string;
  playerId?: number;
  assist?: string;
  assistId?: number;
  type: string;
  detail: string;
  comments?: string;
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
  events?: MatchEvent[];
  apiHomeTeam?: string;
  apiAwayTeam?: string;
  annotations?: Annotation[];
  notes?: MatchNote[];
  images?: MatchImage[];
  isManual?: boolean;
  apiFixtureId?: number;
};

export type PlayerProfile = {
  id?: number;
  name: string;
  photo?: string;
  positions: string[];
  appearances: number;
  goals: number;
  matchIds: string[];
  teams: string[];
  firstSeen?: string;
  lastSeen?: string;
};
