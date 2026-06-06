import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Search for Emirates Cup league
  const r1 = await fetch('https://v3.football.api-sports.io/leagues?search=Emirates+Cup', { headers });
  const d1 = await r1.json();

  // Try club friendlies on that date
  const r2 = await fetch('https://v3.football.api-sports.io/fixtures?date=2014-08-03&league=667&season=2014', { headers });
  const d2 = await r2.json();

  // Try general friendlies
  const r3 = await fetch('https://v3.football.api-sports.io/fixtures?date=2014-08-03&league=10&season=2014', { headers });
  const d3 = await r3.json();

  return NextResponse.json({
    emiratesCupLeague: d1.response?.map((l: any) => ({ id: l.league.id, name: l.league.name })),
    clubFriendlies: d2.response?.slice(0,5).map((f: any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })),
    friendlies: d3.response?.slice(0,5).map((f: any) => ({ id: f.fixture.id, home: f.teams.home.name, away: f.teams.away.name })),
  });
}
