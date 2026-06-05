import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const results: any = {};

  // Test with league + season (La Liga 2018/19, Barcelona fixture)
  const r1 = await fetch('https://v3.football.api-sports.io/fixtures?league=140&season=2018&date=2019-01-13', { headers });
  const d1 = await r1.json();
  results.barcaWithLeague = { count: d1.results, sample: d1.response?.slice(0,3).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Test World Cup 2022 Final (league=1 is World Cup)
  const r2 = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2022&date=2022-12-18', { headers });
  const d2 = await r2.json();
  results.wcFinalWithLeague = { count: d2.results, sample: d2.response?.slice(0,3).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Test Euro 2020 Final (league=4)
  const r3 = await fetch('https://v3.football.api-sports.io/fixtures?league=4&season=2020&date=2021-07-11', { headers });
  const d3 = await r3.json();
  results.euroFinalWithLeague = { count: d3.results, sample: d3.response?.slice(0,3).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Check what errors/warnings the API is returning
  results.barcaErrors = d1.errors;
  results.wcErrors = d2.errors;

  return NextResponse.json(results);
}
