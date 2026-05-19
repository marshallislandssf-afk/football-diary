import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get('fixtureId');

  if (!fixtureId) {
    return NextResponse.json({ error: 'Missing fixtureId param' }, { status: 400 });
  }

  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`,
    { headers: { 'x-apisports-key': apiKey } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'API-Sports request failed', status: res.status }, { status: 502 });
  }

  const data = await res.json();

  if (!data.response || data.response.length < 1) {
    return NextResponse.json({ lineup: null });
  }

  const parseTeam = (team: any) => {
    const starters = (team.startXI || []).map((p: any) => ({
      id: p.player?.id,
      name: p.player?.name,
      number: p.player?.number,
      position: p.player?.pos,
    }));
    const subs = (team.substitutes || []).map((p: any) => ({
      id: p.player?.id,
      name: p.player?.name,
      number: p.player?.number,
      position: 'SUB',
    }));
    return [...starters, ...subs];
  };

  const lineup = {
    home: parseTeam(data.response[0]),
    away: data.response[1] ? parseTeam(data.response[1]) : [],
  };

  return NextResponse.json({ lineup });
}
