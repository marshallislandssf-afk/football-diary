import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  const season = searchParams.get('season') || '2024';
  const query = searchParams.get('q') || '';

  if (!teamId) return NextResponse.json({ players: [] });

  const headers = { 'x-apisports-key': apiKey };

  const res = await fetch(
    `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}&page=1`,
    { headers }
  );
  const data = await res.json();

  let players = data.response || [];

  // Filter by name if query provided
  if (query.length >= 2) {
    const q = query.toLowerCase();
    players = players.filter((p: any) =>
      p.player.name?.toLowerCase().includes(q) ||
      p.player.firstname?.toLowerCase().includes(q) ||
      p.player.lastname?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    players: players.slice(0, 20).map((p: any) => ({
      id: p.player.id,
      name: p.player.name,
      nationality: p.player.nationality,
      photo: p.player.photo,
      position: p.statistics?.[0]?.games?.position,
      team: p.statistics?.[0]?.team?.name,
    }))
  });
}
