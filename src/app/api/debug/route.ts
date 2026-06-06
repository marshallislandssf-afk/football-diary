import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Emirates Cup 2014 fixtures
  const r1 = await fetch('https://v3.football.api-sports.io/fixtures?league=937&season=2014', { headers });
  const d1 = await r1.json();

  return NextResponse.json({
    total: d1.results,
    fixtures: d1.response?.map((f: any) => ({
      id: f.fixture.id,
      date: f.fixture.date,
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
    }))
  });
}
