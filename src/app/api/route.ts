import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const season = searchParams.get('season') || new Date().getFullYear().toString();

  if (!query || query.length < 2) return NextResponse.json({ players: [] });

  const headers = { 'x-apisports-key': apiKey };

  const res = await fetch(
    `https://v3.football.api-sports.io/players?search=${encodeURIComponent(query)}&season=${season}`,
    { headers }
  );
  const data = await res.json();

  return NextResponse.json({
    players: (data.response || []).slice(0, 10).map((p: any) => ({
      id: p.player.id,
      name: p.player.name,
      firstname: p.player.firstname,
      lastname: p.player.lastname,
      nationality: p.player.nationality,
      photo: p.player.photo,
      position: p.statistics?.[0]?.games?.position,
      team: p.statistics?.[0]?.team?.name,
    }))
  });
}
