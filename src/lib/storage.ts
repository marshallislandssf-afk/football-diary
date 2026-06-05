import { Match } from './types';
import { INITIAL_MATCHES } from '../data/matches';

const STORAGE_KEY = 'football_diary_matches';

export function getMatches(): Match[] {
  if (typeof window === 'undefined') return INITIAL_MATCHES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MATCHES));
    return INITIAL_MATCHES;
  } catch {
    return INITIAL_MATCHES;
  }
}

export function saveMatches(matches: Match[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function addMatch(match: Match): Match[] {
  const matches = getMatches();
  const updated = [...matches, match].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  saveMatches(updated);
  return updated;
}

export function getPlayerStats(matches: Match[]): { name: string; count: number; positions: string[] }[] {
  const map = new Map<string, { count: number; positions: Set<string> }>();
  matches.forEach((m) => {
    if (!m.lineup) return;
    [...(m.lineup.home || []), ...(m.lineup.away || [])].forEach((p) => {
      // Only count players who actually played — starters and subs who came on
      // Exclude unused substitutes
      if (p.unusedSub) return;
      const key = p.name;
      if (!map.has(key)) map.set(key, { count: 0, positions: new Set() });
      const entry = map.get(key)!;
      entry.count++;
      if (p.position && p.position !== 'SUB') entry.positions.add(p.position);
    });
  });
  return Array.from(map.entries())
    .map(([name, { count, positions }]) => ({ name, count, positions: Array.from(positions) }))
    .sort((a, b) => b.count - a.count);
}

