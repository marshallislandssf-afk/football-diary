import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Flamengo (ID 127) fixtures on 2025-05-21
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?team=127&season=2025&date=2025-05-21',
    { headers }
  );
  const d1 = await r1.json();

  // Botafogo PB (ID 1197) fixtures on 2025-05-21
  const r2 = await fetch(
    'https://v3.football.api-sports.io/fixtures?team=1197&season=2025&date=2025-05-21',
    { headers }
  );
  const d2 = await r2.json();

  // Copa do Brasil (73) fixtures on 2025-05-21
  const r3 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=73&season=2025&date=2025-05-21',
    { headers }
  );
  const d3 = await r3.json();

  return NextResponse.json({
    flamengoByTeam: { count: d1.results, errors: d1.errors, fixtures: d1.response?.map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name, league: f.league.name, date: f.fixture.date })) },
    botafogoByTeam: { count: d2.results, errors: d2.errors, fixtures: d2.response?.map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name, league: f.league.name, date: f.fixture.date })) },
    copaDobrasilByLeague: { count: d3.results, errors: d3.errors, fixtures: d3.response?.map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name, date: f.fixture.date })) },
  });
}
