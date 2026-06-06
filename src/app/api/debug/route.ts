import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No key' });
  const headers = { 'x-apisports-key': apiKey };

  const statusRes = await fetch('https://v3.football.api-sports.io/status', { headers });
  const statusData = await statusRes.json();

  return NextResponse.json({
    keyFound: true,
    plan: statusData.response?.subscription?.plan,
    requestsToday: statusData.response?.requests?.current,
    requestsLimit: statusData.response?.requests?.limit_day,
  });
}
