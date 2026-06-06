import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Search WC Qual Europe 2025 fixtures for any Wales match
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=32&season=2025',
    { headers }
  );
  const d1 = await r1.json();

  const walesFixtures = d1.response?.filter((f: any) =>
    f.teams?.home?.name?.toLowerCase().includes('wales') ||
    f.teams?.away?.name?.toLowerCase().includes('wales')
  );

  // Also try league 34 (UEFA World Cup Qual 2026)
  const r2 = await fetch(
    'https://v3.football.api-sports.io/leagues?search=World+Cup+Qual',
    { headers }
  );
  const d2 = await r2.json();

  return NextResponse.json({
    walesInWCQual: walesFixtures?.slice(0, 5).map((f: any) => ({
      id: f.fixture.id,
      date: f.fixture.date,
      home: f.teams.home.name,
      homeId: f.teams.home.id,
      away: f.teams.away.name,
      awayId: f.teams.away.id,
    })),
    wcQualLeagues: d2.response?.slice(0, 8).map((l: any) => ({
      id: l.league.id,
      name: l.league.name,
      seasons: l.seasons?.slice(-2).map((s: any) => s.year),
    })),
  });
}
