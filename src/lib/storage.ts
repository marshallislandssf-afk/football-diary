import { Match, PlayerProfile } from './types';

export function getPlayerProfiles(matches: Match[]): PlayerProfile[] {
  const map = new Map<string, PlayerProfile>();

  matches.forEach((m) => {
    if (!m.lineup) return;

    const processPlayer = (p: any, teamName: string) => {
      if (p.unusedSub) return;
      const key = p.id ? `id:${p.id}` : `name:${p.name.toLowerCase().trim()}`;

      if (!map.has(key)) {
        map.set(key, {
          id: p.id,
          name: p.name,
          photo: p.id ? `https://media.api-sports.io/football/players/${p.id}.png` : undefined,
          positions: [],
          appearances: 0,
          goals: 0,
          matchIds: [],
          teams: [],
        });
      }

      const profile = map.get(key)!;
      profile.appearances++;
      if (!profile.matchIds.includes(m.id)) profile.matchIds.push(m.id);
      if (p.position && p.position !== 'SUB' && !profile.positions.includes(p.position)) {
        profile.positions.push(p.position);
      }
      if (!profile.teams.includes(teamName)) profile.teams.push(teamName);
      if (p.name.length > profile.name.length) profile.name = p.name;
    };

    [...(m.lineup.home || [])].forEach(p => processPlayer(p, m.homeTeam.name));
    [...(m.lineup.away || [])].forEach(p => processPlayer(p, m.awayTeam.name));

    // Count goals from events (exclude shootout and missed penalties)
    (m.events || []).forEach((e) => {
      if (e.type !== 'Goal') return;
      if (e.detail === 'Missed Penalty') return;
      if (e.comments?.includes('Penalty Shootout')) return;
      if (!e.player) return;

      const allPlayers = [...(m.lineup!.home || []), ...(m.lineup!.away || [])];
      const lineupPlayer = allPlayers.find(p =>
        p.name === e.player ||
        p.name?.toLowerCase().includes((e.player || '').toLowerCase().split(' ').pop() || '') ||
        (e.player || '').toLowerCase().includes(p.name?.toLowerCase().split(' ').pop() || '')
      );

      const key = lineupPlayer?.id
        ? `id:${lineupPlayer.id}`
        : `name:${(e.player || '').toLowerCase().trim()}`;

      if (map.has(key)) {
        map.get(key)!.goals++;
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => b.appearances - a.appearances);
}
