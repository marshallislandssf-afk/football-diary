
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  // World Cup Final events — we know this fixture ID works
  const r1 = await fetch(
    'https://v3.football.api-sports.io/fixtures/events?fixture=979139',
    { headers }
  );
  const d1 = await r1.json();

  return NextResponse.json({
    totalEvents: d1.results,
    allEvents: d1.response?.map((e: any) => ({
      minute: e.time?.elapsed,
      extra: e.time?.extra,
      team: e.team?.name,
      player: e.player?.name,
      assist: e.assist?.name,
      type: e.type,
      detail: e.detail,
      comments: e.comments,
    }))
  });
}
