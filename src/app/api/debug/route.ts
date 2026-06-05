import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const searches = ['Flamengo', 'Fluminense', 'Botafogo', 'Fortaleza', 'Union Santa Fe'];
  const results: any = {};

  for (const name of searches) {
    const r = await fetch(
      `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(name)}`,
      { headers }
    );
    const d = await r.json();
    results[name] = d.response?.slice(0, 3).map((t: any) => ({
      id: t.team.id,
      name: t.team.name,
      country: t.team.country,
    }));
  }

  // Also check Vasco fixtures directly by team ID 133
  const r2 = await fetch(
    'https://v3.football.api-sports.io/fixtures?team=133&season=2025&date=2025-05-18',
    { headers }
  );
  const d2 = await r2.json();
  results.vascoFixtures = d2.response?.map((f: any) => ({
    id: f.fixture.id,
    home: f.teams.home.name,
    away: f.teams.away.name,
    league: f.league.name,
  }));

  return NextResponse.json(results);
}
