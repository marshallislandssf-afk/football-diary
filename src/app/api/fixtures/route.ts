import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const home = searchParams.get('home');
  const away = searchParams.get('away');

  if (!date) {
    return NextResponse.json({ error: 'Missing date param' }, { status: 400 });
  }

  const headers = { 'x-apisports-key': apiKey };
  const year = parseInt(date.slice(0, 4));
  // API-Sports season = year the season started
  // e.g. May 2026 fixtures belong to season 2025 (2025/26)
  // e.g. Aug 2025 fixtures belong to season 2025 (2025/26)
  // e.g. Jan 2025 fixtures might belong to season 2024 (2024/25)
  const month = parseInt(date.slice(5, 7));
  // Seasons typically start July/August, so Jan-June belong to previous year's season
  const season = month >= 7 ? year : year - 1;

  try {
    // Step 1: find home team ID
    const teamRes = await fetch(
      `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(home || '')}`,
      { headers }
    );
    const teamData = await teamRes.json();
    const teams = teamData.response || [];

    if (!teams.length) {
      return NextResponse.json({ fixtures: [], debug: 'No team found for: ' + home });
    }

    // Step 2: try each matched team, searching by team+season+date
    for (const teamResult of teams.slice(0, 5)) {
      const teamId = teamResult.team.id;

      // Try current season first, then fallback to previous
      for (const s of [season, season - 1, season + 1]) {
        const fixRes = await fetch(
          `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=${s}&date=${date}`,
          { headers }
        );
        const fixData = await fixRes.json();

        if (!fixData.response?.length) continue;

        // Filter to match away team name
        const awayLower = (away || '').toLowerCase();
        const matches = fixData.response.filter((f: any) => {
          const fa = (f.teams?.away?.name || '').toLowerCase();
          const fh = (f.teams?.home?.name || '').toLowerCase();
          if (!awayLower) return true;
          return (
            fa.includes(awayLower.split(' ')[0]) ||
            awayLower.split(' ')[0].includes(fa.split(' ')[0]) ||
            fh.includes(awayLower.split(' ')[0]) ||
            awayLower.split(' ')[0].includes(fh.split(' ')[0])
          );
        });

        if (matches.length) {
          return NextResponse.json({
            fixtures: matches.map((f: any) => ({
              id: f.fixture?.id,
              homeScore: f.goals?.home ?? undefined,
              awayScore: f.goals?.away ?? undefined,
              venue: f.fixture?.venue?.name,
              homeName: f.teams?.home?.name,
              awayName: f.teams?.away?.name,
              league: f.league?.name,
            }))
          });
        }
      }
    }

    // Step 3: last resort — search by date only
    const dateRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}`,
      { headers }
    );
    const dateData = await dateRes.json();
    const allFixtures = dateData.response || [];

    const h = (home || '').toLowerCase();
    const a = (away || '').toLowerCase();
    const dateMatches = allFixtures.filter((f: any) => {
      const fh = (f.teams?.home?.name || '').toLowerCase();
      const fa = (f.teams?.away?.name || '').toLowerCase();
      return (
        (fh.includes(h.split(' ')[0]) || h.includes(fh.split(' ')[0])) &&
        (fa.includes(a.split(' ')[0]) || a.includes(fa.split(' ')[0]))
      );
    });

    return NextResponse.json({
      fixtures: dateMatches.map((f: any) => ({
        id: f.fixture?.id,
        homeScore: f.goals?.home ?? undefined,
        awayScore: f.goals?.away ?? undefined,
        venue: f.fixture?.venue?.name,
        homeName: f.teams?.home?.name,
        awayName: f.teams?.away?.name,
        league: f.league?.name,
      }))
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
