import { Lineup } from './types';

export async function searchFixtures(
  homeTeam: string,
  awayTeam: string,
  date: string,
  competition: string,
  leagueId?: number,
): Promise<{ id: number; homeScore?: number; awayScore?: number; venue?: string }[]> {
  const params = new URLSearchParams({
    date: date.split('T')[0],
    home: homeTeam,
    away: awayTeam,
    competition,
  });
  if (leagueId) params.set('leagueId', leagueId.toString());

  const res = await fetch(`/api/fixtures?${params}`);
  if (!res.ok) throw new Error('Fixture search failed');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.fixtures || [];
}

export async function fetchLineup(fixtureId: number): Promise<Lineup | null> {
  const params = new URLSearchParams({ fixtureId: fixtureId.toString() });
  const res = await fetch(`/api/lineup?${params}`);
  if (!res.ok) throw new Error('Lineup fetch failed');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.lineup || null;
}
