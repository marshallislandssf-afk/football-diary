import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get('fixtureId');
  if (!fixtureId) return NextResponse.json({ error: 'Missing fixtureId' }, { status: 400 });

  const headers = { 'x-apisports-key': apiKey };

  try {
    // Fetch lineup and events in parallel
    const [lineupRes, eventsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, { headers }),
      fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, { headers }),
    ]);

    const lineupData = await lineupRes.json();
    const eventsData = await eventsRes.json();

    if (!lineupData.response?.length) {
      return NextResponse.json({ lineup: null });
    }

    // Build a map of substitutions: playerOff name -> { playerOn, minute }
    // and playerOn name -> minute they came on
    const subsOn: Record<string, number> = {};   // name -> minute came on
    const subsOff: Record<string, number> = {};  // name -> minute went off

    (eventsData.response || [])
      .filter((e: any) => e.type === 'subst')
      .forEach((e: any) => {
        if (e.assist?.name) subsOn[e.assist.name] = e.time?.elapsed ?? 0;
        if (e.player?.name) subsOff[e.player.name] = e.time?.elapsed ?? 0;
      });

    const parseTeam = (team: any) => {
      const starters = (team.startXI || []).map((p: any) => ({
        id: p.player?.id,
        name: p.player?.name,
        number: p.player?.number,
        position: p.player?.pos,
        isStarter: true,
        wentOff: p.player?.name in subsOff,
        wentOffMinute: subsOff[p.player?.name],
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
          cameOnMinute: cameOn ? subsOn[p.player?.name] : undefined,
          unusedSub: !cameOn,
        };
      });

      return [...starters, ...subs];
    };

    return NextResponse.json({
      lineup: {
        home: parseTeam(lineupData.response[0]),
        away: lineupData.response[1] ? parseTeam(lineupData.response[1]) : [],
      }
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
