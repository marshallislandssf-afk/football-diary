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

  // Fetch page 1
  const res1 = await fetch(
    `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}&page=1`,
    { headers }
  );
  const data1 = await res1.json();
  let players = data1.response || [];

  // Fetch remaining pages if any
  const totalPages = data1.paging?.total || 1;
  for (let page = 2; page <= Math.min(totalPages, 4); page++) {
    const res = await fetch(
      `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}&page=${page}`,
      { headers }
    );
    const data = await res.json();
    if (data.response?.length) players = [...players, ...data.response];
  }

  // Filter by name if query provided
 if (query.length >= 1) {
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = normalize(query);
    players = players.filter((p: any) =>
      normalize(p.player.name || '').includes(q) ||
      normalize(p.player.firstname || '').includes(q) ||
      normalize(p.player.lastname || '').includes(q)
    );
  }

  return NextResponse.json({
    players: players.slice(0, 50).map((p: any) => ({
      id: p.player.id,
      name: p.player.name,
      nationality: p.player.nationality,
      photo: p.player.photo,
      position: p.statistics?.[0]?.games?.position,
      team: p.statistics?.[0]?.team?.name,
    }))
  });
}
