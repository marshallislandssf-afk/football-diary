import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) return NextResponse.json({ teams: [] });

  const headers = { 'x-apisports-key': apiKey };

  const res = await fetch(
    `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(query)}`,
    { headers }
  );
  const data = await res.json();

  return NextResponse.json({
    teams: (data.response || []).slice(0, 10).map((t: any) => ({
      id: t.team.id,
      name: t.team.name,
      country: t.team.country,
      logo: t.team.logo,
    }))
  });
}
