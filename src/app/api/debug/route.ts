import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Get all WC Qual Europe fixtures on that date
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=32&season=2025&date=2025-11-18',
    { headers }
  );
  const d1 = await r1.json();

  return NextResponse.json({
    total: d1.results,
    allFixtures: d1.response?.map((f: any) => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
    }))
  });
}
