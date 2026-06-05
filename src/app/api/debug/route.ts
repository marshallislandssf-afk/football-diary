import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Get ALL fixtures on that date and look for North Macedonia or anything international
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?date=2025-11-18&season=2025',
    { headers }
  );
  const d1 = await r1.json();

  // Find North Macedonia
  const northMac = d1.response?.filter((f: any) =>
    f.teams?.home?.name?.toLowerCase().includes('macedonia') ||
    f.teams?.away?.name?.toLowerCase().includes('macedonia') ||
    f.teams?.home?.name?.toLowerCase().includes('north') ||
    f.teams?.away?.name?.toLowerCase().includes('north')
  );

 // Also show all unique leagues on that date
  const seen = new Set();
  const leagues = (d1.response || []).filter((f: any) => {
    if (seen.has(f.league.id)) return false;
    seen.add(f.league.id);
    return true;
  }).map((f: any) => ({ id: f.league.id, name: f.league.name }));

  return NextResponse.json({
    northMacedoniaFixtures: northMac?.map((f: any) => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      league: f.league.name,
      leagueId: f.league.id,
      date: f.fixture.date,
    })),
    leaguesOnDate: leagues,
  });
}
