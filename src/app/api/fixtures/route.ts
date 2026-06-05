import { NextRequest, NextResponse } from 'next/server';

const LEAGUE_MAP: Record<string, { id: number; calendarYear?: boolean }> = {
  'FIFA World Cup': { id: 1 },
  'FIFA World Cup Final': { id: 1 },
  'FIFA World Cup Group Stage': { id: 1 },
  'UEFA Euro 2020 Final': { id: 4 },
  'UEFA Euro 2020 Group Stage': { id: 4 },
  'UEFA Euro 2016 Group Stage': { id: 4 },
  'UEFA Nations League': { id: 5 },
  'WC Qualification Europe': { id: 32 },
  'UEFA World Cup Qualification Europe': { id: 32 },
  'International Friendly': { id: 10 },
  'CONCACAF Nations League': { id: 26 },
  'Outrigger Challenge Cup': { id: 10 },
  'Premier League': { id: 39 },
  'FA Cup': { id: 45 },
  'FA Cup Replay': { id: 45 },
  'FA Cup 3rd Round': { id: 45 },
  'League Cup': { id: 48 },
  'La Liga': { id: 140 },
  'Tercera Federación Group 5': { id: 142 },
  'Ligue 1': { id: 61 },
  'Ekstraklasa': { id: 106 },
  'I Liga': { id: 107 },
  'II Liga': { id: 108 },
  'SuperLiga': { id: 283 },
  'Brasileirão Série A': { id: 71, calendarYear: true },
  'Copa do Brasil': { id: 73, calendarYear: true },
  'Copa Libertadores': { id: 13, calendarYear: true },
  'UEFA Europa Conference League Qualifying': { id: 848 },
};

function getSeason(competition: string, date: string): number {
  const mapping = LEAGUE_MAP[competition];
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(5, 7));
  if (mapping?.calendarYear) return year;
  if (competition.includes('Euro 2020')) return 2020;
  if (competition.includes('Euro 2016')) return 2016;
  if (competition.includes('World Cup') && !competition.includes('Qualification')) {
    if (year === 2022 || year === 2023) return 2022;
    if (year === 2018 || year === 2019) return 2018;
    return year;
  }
  if (competition.includes('Qualification')) {
    if (year === 2025 || year === 2024) return 2025;
    return year;
  }
  return month >= 7 ? year : year - 1;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const home = searchParams.get('home');
  const away = searchParams.get('away');
  const competition = searchParams.get('competition') || '';

  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

  const headers = { 'x-apisports-key': apiKey };
  const leagueId = LEAGUE_MAP[competition]?.id ?? null;
  const season = getSeason(competition, date);

  try {
    let fixtures: any[] = [];

    // Strategy 1: known league ID + season + date
    if (leagueId) {
      for (const s of [season, season - 1, season + 1]) {
        const res = await fetch(
          `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${s}&date=${date}`,
          { headers }
        );
        const data = await res.json();
        if (data.response?.length) { fixtures = data.response; break; }
      }
    }

    // Strategy 2: search by team name to get ID, then fixtures by team+season
    if (!fixtures.length && home) {
      const teamRes = await fetch(
        `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(home)}`,
        { headers }
      );
      const teamData = await teamRes.json();
      for (const t of (teamData.response || []).slice(0, 3)) {
        for (const s of [season, season - 1, season + 1]) {
          const res = await fetch(
            `https://v3.football.api-sports.io/fixtures?team=${t.team.id}&season=${s}&date=${date}`,
            { headers }
          );
          const data = await res.json();
          if (data.response?.length) { fixtures = data.response; break; }
        }
        if (fixtures.length) break;
      }
    }

    if (!fixtures.length) return NextResponse.json({ fixtures: [] });

    // Filter by team names
    if (home && away) {
      const h = home.toLowerCase();
      const a = away.toLowerCase();
      const filtered = fixtures.filter((f: any) => {
        const fh = (f.teams?.home?.name || '').toLowerCase();
        const fa = (f.teams?.away?.name || '').toLowerCase();
        return (fh.includes(h.split(' ')[0]) || h.includes(fh.split(' ')[0])) &&
               (fa.includes(a.split(' ')[0]) || a.includes(fa.split(' ')[0]));
      });
      if (filtered.length) fixtures = filtered;
    }

    return NextResponse.json({
      fixtures: fixtures.map((f: any) => ({
        id: f.fixture?.id,
        homeScore: f.goals?.home ?? undefined,
        awayScore: f.goals?.away ?? undefined,
        venue: f.fixture?.venue?.name,
        homeName: f.teams?.home?.name,
        awayName: f.teams?.away?.name,
      }))
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
