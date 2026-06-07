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

  const normalize = (s: string) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const currentYear = new Date().getFullYear();
  const seasonYear = parseInt(season);
  const isHistorical = currentYear - seasonYear > 2;

  let players: any[] = [];

  if (!isHistorical) {
    // Recent matches — use squads endpoint for full current registered squad
    const squadRes = await fetch(
      `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
      { headers }
    );
    const squadData = await squadRes.json();
    players = squadData.response?.[0]?.players || [];
  }

  // Historical matches, or if squads returned nothing — use paginated players endpoint
  if (players.length === 0) {
    const res1 = await fetch(
      `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}&page=1`,
      { headers }
    );
    const data1 = await res1.json();
    let allPlayers = data1.response || [];

    const totalPages = data1.paging?.total || 1;
    for (let page = 2; page <= Math.min(totalPages, 4); page++) {
      const res = await fetch(
        `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}&page=${page}`,
        { headers }
      );
      const data = await res.json();
      if (data.response?.length) allPlayers = [...allPlayers, ...data.response];
    }

    players = allPlayers.map((p: any) => ({
      id: p.player.id,
      name: p.player.name,
      nationality: p.player.nationality,
      photo: p.player.photo,
      position: p.statistics?.[0]?.games?.position,
      team: p.statistics?.[0]?.team?.name,
    }));
  }

  // Filter by query if provided
  if (query.length >= 1) {
    const q = normalize(query);
    players = players.filter((p: any) =>
      normalize(p.name || '').includes(q) ||
      normalize(p.firstname || '').includes(q) ||
      normalize(p.lastname || '').includes(q)
    );
  }

  return NextResponse.json({
    players: players.slice(0, 60).map((p: any) => ({
      id: p.id,
      name: p.name,
      nationality: p.nationality,
      photo: p.photo || (p.id ? `https://media.api-sports.io/football/players/${p.id}.png` : undefined),
      position: p.position,
      team: p.team,
    }))
  });
}
