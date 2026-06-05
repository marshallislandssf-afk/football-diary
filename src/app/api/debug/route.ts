import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const results: any = {};

  // Test 1: World Cup Final 2022 — league=1, season=2022
  const r1 = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2022&date=2022-12-18', { headers });
  const d1 = await r1.json();
  results.wcFinal = { count: d1.results, errors: d1.errors, sample: d1.response?.slice(0,2).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Test 2: La Liga 2018/19 — league=140, season=2018
  const r2 = await fetch('https://v3.football.api-sports.io/fixtures?league=140&season=2018&date=2019-01-13', { headers });
  const d2 = await r2.json();
  results.barcaEibar = { count: d2.results, errors: d2.errors, sample: d2.response?.slice(0,2).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Test 3: Premier League 2015/16 — league=39, season=2015
  const r3 = await fetch('https://v3.football.api-sports.io/fixtures?league=39&season=2015&date=2015-08-24', { headers });
  const d3 = await r3.json();
  results.arsenalLiverpool2015 = { count: d3.results, errors: d3.errors, sample: d3.response?.slice(0,2).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Test 4: Euro 2020 Final — league=4, season=2020
  const r4 = await fetch('https://v3.football.api-sports.io/fixtures?league=4&season=2020&date=2021-07-11', { headers });
  const d4 = await r4.json();
  results.euroFinal = { count: d4.results, errors: d4.errors, sample: d4.response?.slice(0,2).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  return NextResponse.json(results);
}
