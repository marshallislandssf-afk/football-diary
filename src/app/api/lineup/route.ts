import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get('fixtureId');
  if (!fixtureId) return NextResponse.json({ error: 'Missing fixtureId' }, { status: 400 });

  const headers = { 'x-apisports-key': apiKey };

  try {
    const [lineupRes, eventsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, { headers }),
      fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, { headers }),
    ]);

    const lineupData = await lineupRes.json();
    const eventsData = await eventsRes.json();

    if (!lineupData.response?.length) {
      return NextResponse.json({ lineup: null, events: [] });
    }

    const subsOn: Record<string, { minute: number }> = {};
    const subsOff: Record<string, { minute: number }> = {};

    const rawEvents = eventsData.response || [];

    rawEvents
      .filter((e: any) => e.type === 'subst')
      .forEach((e: any) => {
        if (e.assist?.name) subsOn[e.assist.name] = { minute: e.time?.elapsed ?? 0 };
        if (e.player?.name) subsOff[e.player.name] = { minute: e.time?.elapsed ?? 0 };
      });

    const parseTeam = (team: any) => {
      const starters = (team.startXI || []).map((p: any) => ({
        id: p.player?.id,
        name: p.player?.name,
        number: p.player?.number,
        position: p.player?.pos,
        isStarter: true,
        wentOff: p.player?.name in subsOff,
        wentOffMinute: subsOff[p.player?.name]?.minute,
      }));

      const subs = (team.substitutes || []).map((p: any) => {
        const cameOn = p.player?.name in subsOn;
        return {
          id: p.player?.id,
          name: p.player?.name,
          number: p.player?.number,
          position: cameOn ? p.player?.pos : 'SUB',
          isStarter: false,
          cameOn,
          cameOnMinute: cameOn ? subsOn[p.player?.name]?.minute : undefined,
          unusedSub: !cameOn,
        };
      });

      return [...starters, ...subs];
    };

    const events = rawEvents
      .filter((e: any) => e.type !== 'subst')
      .map((e: any) => ({
        minute: e.time?.elapsed ?? 0,
        extra: e.time?.extra ?? undefined,
        team: e.team?.name,
        player: e.player?.name,
        playerId: e.player?.id ?? undefined,
        assist: e.assist?.name ?? undefined,
        assistId: e.assist?.id ?? undefined,
        type: e.type,
        detail: e.detail,
        comments: e.comments ?? undefined,
      }));

    return NextResponse.json({
      lineup: {
        home: parseTeam(lineupData.response[0]),
        away: lineupData.response[1] ? parseTeam(lineupData.response[1]) : [],
      },
      events,
      apiHomeTeam: lineupData.response[0]?.team?.name,
      apiAwayTeam: lineupData.response[1]?.team?.name,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
