import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // All II Liga fixtures on 2026-05-09
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=108&season=2025&date=2026-05-09',
    { headers }
  );
  const d1 = await r1.json();

  // Search for Wieczysta team
  const r2 = await fetch(
    'https://v3.football.api-sports.io/teams?search=Wieczysta',
    { headers }
  );
  const d2 = await r2.json();

  // All WC Qual fixtures on 2025-11-18 (no season filter)
  const r3 = await fetch(
    'https://v3.football.api-sports.io/fixtures?date=2025-11-18',
    { headers }
  );
  const d3 = await r3.json();
  const northMac = d3.response?.filter((f: any) =>
    f.teams?.home?.name?.toLowerCase().includes('macedon') ||
    f.teams?.away?.name?.toLowerCase().includes('macedon') ||
    f.teams?.home?.name?.toLowerCase().includes('wales') ||
    f.teams?.away?.name?.toLowerCase().includes('wales')
  );

  return NextResponse.json({
    iiLigaFixtures: d1.response?.map((f: any) => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
    })),
    wieczystTeams: d2.response?.map((t: any) => ({
      id: t.team.id,
      name: t.team.name,
      country: t.team.country,
    })),
    walesNorthMac: northMac?.map((f: any) => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      league: f.league.name,
      leagueId: f.league.id,
    })),
  });
}
