import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const results: any = {};

  // World Cup Final 2022
  const r1 = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2022&date=2022-12-18', { headers });
  const d1 = await r1.json();
  results.wcFinal = { count: d1.results, errors: d1.errors, sample: d1.response?.slice(0,2).map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) };

  // Marseille vs Brest 2023
  const r2 = await fetch('https://v3.football.api-sports.io/fixtures?league=61&season=2023&date=2023-08-26', { headers });
  const d2 = await r2.json();
  results.marseilleBrest = { count: d2.results, errors: d2.errors, sample: d2.response?.slice(0,2).map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) };

  // Arsenal vs Liverpool 2015
  const r3 = await fetch('https://v3.football.api-sports.io/fixtures?league=39&season=2015&date=2015-08-24', { headers });
  const d3 = await r3.json();
  results.arsenalLiverpool = { count: d3.results, errors: d3.errors, sample: d3.response?.slice(0,2).map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) };

  // Cracovia 2026
  const r4 = await fetch('https://v3.football.api-sports.io/fixtures?league=106&season=2025&date=2026-05-11', { headers });
  const d4 = await r4.json();
  results.cracovia2026 = { count: d4.results, errors: d4.errors, sample: d4.response?.slice(0,2).map((f:any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })) };

  return NextResponse.json(results);
}
