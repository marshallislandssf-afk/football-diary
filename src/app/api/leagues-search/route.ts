import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const country = searchParams.get('country');

  if (!query && !country) return NextResponse.json({ leagues: [] });

  const headers = { 'x-apisports-key': apiKey };

  const params = new URLSearchParams();
  if (query) params.set('search', query);
  if (country) params.set('country', country);

  const res = await fetch(
    `https://v3.football.api-sports.io/leagues?${params}`,
    { headers }
  );
  const data = await res.json();

  return NextResponse.json({
    leagues: (data.response || []).slice(0, 20).map((l: any) => ({
      id: l.league.id,
      name: l.league.name,
      country: l.country.name,
      logo: l.league.logo,
      seasons: l.seasons?.map((s: any) => s.year).slice(-5),
    }))
  });
}
