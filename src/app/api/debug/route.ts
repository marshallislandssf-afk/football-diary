import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Search specifically for Wales national team
  const r1 = await fetch('https://v3.football.api-sports.io/teams?search=Wales&type=national', { headers });
  const d1 = await r1.json();

  // Also try by country
  const r2 = await fetch('https://v3.football.api-sports.io/teams?country=Wales&type=national', { headers });
  const d2 = await r2.json();

  // Try the World Cup 2026 qualifier league
  const r3 = await fetch('https://v3.football.api-sports.io/leagues?type=cup&search=World+Cup', { headers });
  const d3 = await r3.json();

  return NextResponse.json({
    walesBySearch: d1.response?.slice(0,5).map((t:any) => ({ id: t.team.id, name: t.team.name, country: t.team.country, national: t.team.national })),
    walesByCountry: d2.response?.slice(0,5).map((t:any) => ({ id: t.team.id, name: t.team.name, national: t.team.national })),
    worldCupLeagues: d3.response?.slice(0,8).map((l:any) => ({ id: l.league.id, name: l.league.name, type: l.league.type, seasons: l.seasons?.slice(-1).map((s:any) => s.year) })),
  });
}
