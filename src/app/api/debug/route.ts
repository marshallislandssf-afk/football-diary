import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const results: any = {};

  const r1 = await fetch('https://v3.football.api-sports.io/teams?search=England', { headers });
  const d1 = await r1.json();
  results.englandTeams = d1.response?.slice(0,5).map((t:any) => ({ id: t.team.id, name: t.team.name, country: t.team.country, national: t.team.national }));

  const r2 = await fetch('https://v3.football.api-sports.io/fixtures?date=2021-07-11', { headers });
  const d2 = await r2.json();
  results.euroFinalCount = d2.results;
  results.euroFinalSample = d2.response?.slice(0,5).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name, league: f.league.name }));

  const r3 = await fetch('https://v3.football.api-sports.io/fixtures?date=2022-12-18', { headers });
  const d3 = await r3.json();
  results.wcFinalCount = d3.results;
  results.wcFinalSample = d3.response?.slice(0,5).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name, league: f.league.name }));

  const r4 = await fetch('https://v3.football.api-sports.io/fixtures?date=2019-01-13', { headers });
  const d4 = await r4.json();
  results.barcaCount = d4.results;
  results.barcaSample = d4.response?.slice(0,5).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name, league: f.league.name }));

  return NextResponse.json(results);
}
