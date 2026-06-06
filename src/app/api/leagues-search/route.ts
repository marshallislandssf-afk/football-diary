import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json({ leagues: [] });

  const headers = { 'x-apisports-key': apiKey };
  const res = await fetch(
    `https://v3.football.api-sports.io/leagues?search=${encodeURIComponent(query)}`,
    { headers }
  );
  const data = await res.json();

  return NextResponse.json({
    leagues: (data.response || []).slice(0, 20).map((l: any) => ({
      id: l.league.id,
      name: l.league.name,
      country: l.country.name,
      logo: l.league.logo,
    }))
  });
}
