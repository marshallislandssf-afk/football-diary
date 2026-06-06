import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const r1 = await fetch('https://v3.football.api-sports.io/leagues?id=937', { headers });
  const d1 = await r1.json();

  return NextResponse.json({
    seasons: d1.response?.[0]?.seasons?.map((s: any) => s.year),
  });
}
