import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const results: any = {};

  // Try all plausible seasons for WC Qual Europe (league 32)
  for (const season of [2023, 2024, 2025, 2026]) {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=32&season=${season}&date=2025-11-18`,
      { headers }
    );
    const d = await r.json();
    results[`season_${season}`] = {
      count: d.results,
      errors: d.errors,
      fixtures: d.response?.map((f: any) => ({
        home: f.teams.home.name,
        away: f.teams.away.name,
      }))
    };
  }

  // Also search all fixtures on that date without league filter
  const r2 = await fetch(
    `https://v3.football.api-sports.io/fixtures?date=2025-11-18&season=2025`,
    { headers }
  );
  const d2 = await r2.json();
  const wales = d2.response?.filter((f: any) =>
    f.teams?.home?.name?.toLowerCase().includes('wales') ||
    f.teams?.away?.name?.toLowerCase().includes('wales') ||
    f.teams?.home?.name?.toLowerCase().includes('cymru') ||
    f.teams?.away?.name?.toLowerCase().includes('cymru')
  );
  results.walesAnyLeague = wales?.map((f: any) => ({
    home: f.teams.home.name,
    away: f.teams.away.name,
    league: f.league.name,
    leagueId: f.league.id,
  }));

  return NextResponse.json(results);
}
