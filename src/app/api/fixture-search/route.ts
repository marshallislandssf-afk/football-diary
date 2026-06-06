import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const home = searchParams.get('home');
  const away = searchParams.get('away');

  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

  const headers = { 'x-apisports-key': apiKey };

  function normalize(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function teamMatches(apiName: string, searchName: string): boolean {
    const a = normalize(apiName);
    const s = normalize(searchName);
    if (a === s) return true;
    if (a.includes(s) || s.includes(a)) return true;
    const words = s.split(' ').filter((w: string) => w.length > 3);
    return words.length > 0 && words.every((w: string) => a.includes(w));
  }

  try {
    const year = parseInt(date.slice(0, 4));
    const month = parseInt(date.slice(5, 7));
    const season = month >= 7 ? year : year - 1;

    const results: any[] = [];

    for (const s of [season, season - 1, season + 1]) {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${date}&season=${s}`,
        { headers }
      );
      const data = await res.json();
      if (data.response?.length) {
        results.push(...data.response);
        break;
      }
    }

    if (results.length === 0) {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${date}`,
        { headers }
      );
      const data = await res.json();
      if (data.response?.length) results.push(...data.response);
    }

    if (results.length === 0) return NextResponse.json({ fixtures: [] });

    let filtered = results;
    if (home || away) {
      filtered = results.filter((f: any) => {
        const fh = f.teams?.home?.name || '';
        const fa = f.teams?.away?.name || '';
        const homeOk = !home || teamMatches(fh, home) || teamMatches(fa, home);
        const awayOk = !away || teamMatches(fa, away) || teamMatches(fh, away);
        return homeOk && awayOk;
      });
    }

    return NextResponse.json({
      fixtures: filtered.map((f: any) => ({
        id: f.fixture?.id,
        date: f.fixture?.date,
        homeTeam: f.teams?.home?.name,
        homeTeamId: f.teams?.home?.id,
        awayTeam: f.teams?.away?.name,
        awayTeamId: f.teams?.away?.id,
        homeScore: f.goals?.home ?? undefined,
        awayScore: f.goals?.away ?? undefined,
        venue: f.fixture?.venue?.name,
        league: f.league?.name,
        leagueId: f.league?.id,
        country: f.league?.country,
      }))
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
