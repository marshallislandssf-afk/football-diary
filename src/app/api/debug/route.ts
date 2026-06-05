import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Search for all UEFA/Europe World Cup qualification leagues
  const r1 = await fetch(
    'https://v3.football.api-sports.io/leagues?search=World+Cup&type=cup',
    { headers }
  );
  const d1 = await r1.json();

  // Also try searching by country Wales to find their fixtures
  const r2 = await fetch(
    'https://v3.football.api-sports.io/fixtures?date=2025-11-18&season=2025',
    { headers }
  );
  const d2 = await r2.json();

  // Find any fixture involving Wales
  const walesFixtures = d2.response?.filter((f: any) =>
    f.teams?.home?.name?.toLowerCase().includes('wales') ||
    f.teams?.away?.name?.toLowerCase().includes('wales')
  );

  return NextResponse.json({
    worldCupLeagues: d1.response?.slice(0, 10).map((l: any) => ({
      id: l.league.id,
      name: l.league.name,
      seasons: l.seasons?.slice(-2).map((s: any) => s.year),
    })),
    walesFixtures: walesFixtures?.map((f: any) => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      league: f.league.name,
      leagueId: f.league.id,
    })),
    totalFixturesOnDate: d2.results,
  });
}
