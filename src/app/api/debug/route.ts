import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Try searching for Harry Wilson with different seasons
  const r1 = await fetch('https://v3.football.api-sports.io/players?search=Harry+Wilson&season=2024', { headers });
  const d1 = await r1.json();

  const r2 = await fetch('https://v3.football.api-sports.io/players?search=Karl+Darlow&season=2024', { headers });
  const d2 = await r2.json();

  // Try without season
  const r3 = await fetch('https://v3.football.api-sports.io/players?search=Harry+Wilson', { headers });
  const d3 = await r3.json();

  return NextResponse.json({
    harryWilson2024: { count: d1.results, errors: d1.errors, sample: d1.response?.slice(0,3).map((p: any) => ({ id: p.player.id, name: p.player.name, team: p.statistics?.[0]?.team?.name })) },
    karlDarlow2024: { count: d2.results, errors: d2.errors, sample: d2.response?.slice(0,3).map((p: any) => ({ id: p.player.id, name: p.player.name, team: p.statistics?.[0]?.team?.name })) },
    harryWilsonNoSeason: { count: d3.results, errors: d3.errors },
  });
}
