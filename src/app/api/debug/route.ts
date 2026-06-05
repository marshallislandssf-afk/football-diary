import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const results: any = {};

  // Marseille vs Brest — Ligue 1, season=2023, Aug 2023
  const r1 = await fetch('https://v3.football.api-sports.io/fixtures?league=61&season=2023&date=2023-08-26', { headers });
  const d1 = await r1.json();
  results.marseilleBrest = { count: d1.results, errors: d1.errors, sample: d1.response?.slice(0,3).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // PSG vs Nantes — Ligue 1, season=2022, Mar 2023
  const r2 = await fetch('https://v3.football.api-sports.io/fixtures?league=61&season=2022&date=2023-03-04', { headers });
  const d2 = await r2.json();
  results.psgNantes = { count: d2.results, errors: d2.errors, sample: d2.response?.slice(0,3).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  // Dinamo vs CFR Cluj — Romanian SuperLiga, season=2023, Oct 2023
  const r3 = await fetch('https://v3.football.api-sports.io/fixtures?league=283&season=2023&date=2023-10-08', { headers });
  const d3 = await r3.json();
  results.dinamoCluj = { count: d3.results, errors: d3.errors, sample: d3.response?.slice(0,3).map((f:any) => ({ home: f.teams.home.name, away: f.teams.away.name })) };

  return NextResponse.json(results);
}
