import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Get the Wales vs FYR Macedonia fixture details
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=32&season=2024&date=2025-11-18',
    { headers }
  );
  const d1 = await r1.json();

  const walesFixture = d1.response?.find((f: any) =>
    f.teams?.home?.name === 'Wales'
  );

  // Get Wales team ID from fixture and fetch their squad
  const walesTeamId = walesFixture?.teams?.home?.id;
  let walesSquad = null;
  if (walesTeamId) {
    const r2 = await fetch(
      `https://v3.football.api-sports.io/players?team=${walesTeamId}&season=2024`,
      { headers }
    );
    const d2 = await r2.json();
    walesSquad = d2.response?.slice(0, 5).map((p: any) => ({ id: p.player.id, name: p.player.name }));
  }

  return NextResponse.json({
    walesFixture: walesFixture ? {
      fixtureId: walesFixture.fixture.id,
      homeTeam: walesFixture.teams.home.name,
      homeTeamId: walesFixture.teams.home.id,
      awayTeam: walesFixture.teams.away.name,
      awayTeamId: walesFixture.teams.away.id,
    } : null,
    walesTeamId,
    walesSquadSample: walesSquad,
  });
}
