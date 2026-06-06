import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const r1 = await fetch('https://v3.football.api-sports.io/teams?search=Wales&type=national', { headers });
  const d1 = await r1.json();

  const r2 = await fetch('https://v3.football.api-sports.io/teams?country=Wales&type=national', { headers });
  const d2 = await r2.json();

  return NextResponse.json({
    bySearch: d1.response?.map((t: any) => ({ id: t.team.id, name: t.team.name, country: t.team.country, national: t.team.national })),
    byCountry: d2.response?.map((t: any) => ({ id: t.team.id, name: t.team.name, national: t.team.national })),
  });
}
