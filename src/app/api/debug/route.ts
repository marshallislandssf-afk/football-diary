import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const r1 = await fetch('https://v3.football.api-sports.io/teams?search=Wisla+Krakow', { headers });
  const d1 = await r1.json();

  const r2 = await fetch('https://v3.football.api-sports.io/teams?search=Chrobry', { headers });
  const d2 = await r2.json();

  return NextResponse.json({
    wisla: d1.response?.slice(0,5).map((t:any) => ({ id: t.team.id, name: t.team.name, country: t.team.country })),
    chrobry: d2.response?.slice(0,5).map((t:any) => ({ id: t.team.id, name: t.team.name, country: t.team.country })),
  });
}
