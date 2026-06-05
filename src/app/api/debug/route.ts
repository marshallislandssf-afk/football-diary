import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Vasco vs Fortaleza - Brasileirao season=2025 (calendar year)
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=71&season=2025&date=2025-05-18',
    { headers }
  );
  const d1 = await r1.json();

  // Flamengo vs Botafogo PB - Copa do Brasil season=2025
  const r2 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=73&season=2025&date=2025-05-21',
    { headers }
  );
  const d2 = await r2.json();

  // Fluminense vs Union Santa Fe - Copa Libertadores season=2022
  const r3 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=13&season=2022&date=2022-04-27',
    { headers }
  );
  const d3 = await r3.json();

  // Search for Vasco team name
  const r4 = await fetch(
    'https://v3.football.api-sports.io/teams?search=Vasco',
    { headers }
  );
  const d4 = await r4.json();

  return NextResponse.json({
    vasco: { count: d1.results, errors: d1.errors, fixtures: d1.response?.map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) },
    flamengo: { count: d2.results, errors: d2.errors, fixtures: d2.response?.map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) },
    fluminense: { count: d3.results, errors: d3.errors, fixtures: d3.response?.map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) },
    vascoTeams: d4.response?.slice(0,3).map((t:any) => ({ id: t.team.id, name: t.team.name, country: t.team.country })),
  });
}
