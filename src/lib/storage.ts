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

    const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    (m.events || []).forEach((e) => {
      if (e.type !== 'Goal') return;
      if (e.detail === 'Missed Penalty') return;
      if (e.comments?.includes('Penalty Shootout')) return;
      if (!e.player) return;

      const allPlayers = [...(m.lineup!.home || []), ...(m.lineup!.away || [])];

      // 1. Match by player ID
      let lineupPlayer = e.playerId
        ? allPlayers.find(p => p.id === e.playerId)
        : undefined;

      // 2. Exact normalised name match
      if (!lineupPlayer) {
        lineupPlayer = allPlayers.find(p => norm(p.name) === norm(e.player || ''));
      }

      // 3. Last name match — only skip if ambiguous surname
      if (!lineupPlayer) {
        const eventLastName = norm(e.player || '').split(' ').pop() || '';
        if (eventLastName.length > 2) {
          const matches = allPlayers.filter(p =>
            norm(p.name).split(' ').pop() === eventLastName
          );
          if (matches.length === 1) lineupPlayer = matches[0];
        }
      }

      // 4. Loose partial match — event name contains player last name or vice versa
      if (!lineupPlayer) {
        const eventNorm = norm(e.player || '');
        lineupPlayer = allPlayers.find(p => {
          const playerNorm = norm(p.name);
          const playerLast = playerNorm.split(' ').pop() || '';
          const eventLast = eventNorm.split(' ').pop() || '';
          return playerLast.length > 3 && eventLast.length > 3 && (
            playerNorm.includes(eventNorm) ||
            eventNorm.includes(playerNorm) ||
            playerLast === eventLast
          );
        });
      }

      if (!lineupPlayer) return;

      const key = lineupPlayer.id
        ? `id:${lineupPlayer.id}`
        : `name:${norm(lineupPlayer.name)}`;

      if (map.has(key)) {
        map.get(key)!.goals++;
      }
    });

  return Array.from(map.values()).sort((a, b) => b.appearances - a.appearances);
}
