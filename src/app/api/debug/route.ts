import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // Fetch events for the World Cup Final (fixture ID 979139 from earlier debug)
  const res = await fetch(
    'https://v3.football.api-sports.io/fixtures/events?fixture=979139',
    { headers }
  );
  const data = await res.json();

  const subs = data.response?.filter((e: any) => e.type === 'subst');

  return NextResponse.json({
    totalEvents: data.results,
    substitutions: subs?.map((e: any) => ({
      team: e.team.name,
      playerOn: e.assist?.name,
      playerOff: e.player?.name,
      minute: e.time?.elapsed,
    }))
  });
}
