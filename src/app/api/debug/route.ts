import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Try players/squads endpoint - returns registered squad without needing stats
  const r1 = await fetch(
    'https://v3.football.api-sports.io/players/squads?team=1105',
    { headers }
  );
  const d1 = await r1.json();

  // Also try players endpoint with different seasons
  const r2 = await fetch(
    'https://v3.football.api-sports.io/players?team=1105&season=2024',
    { headers }
  );
  const d2 = await r2.json();

  // Search for Miovski directly with his club team
  const r3 = await fetch(
    'https://v3.football.api-sports.io/players?search=Miovski&season=2024&league=39',
    { headers }
  );
  const d3 = await r3.json();

  return NextResponse.json({
    squadEndpoint: {
      count: d1.results,
      players: d1.response?.[0]?.players?.slice(0, 10).map((p: any) => ({ id: p.id, name: p.name, position: p.position })),
    },
    playersEndpoint: { count: d2.results, errors: d2.errors },
    miovskiSearch: d3.response?.slice(0, 3).map((p: any) => ({ id: p.player.id, name: p.player.name, team: p.statistics?.[0]?.team?.name })),
  });
}
