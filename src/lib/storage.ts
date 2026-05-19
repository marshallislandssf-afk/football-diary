import { Match } from './types';
import { INITIAL_MATCHES } from '../data/matches';

const STORAGE_KEY = 'football_diary_matches';
const API_KEY_STORAGE = 'football_diary_api_key';

export function getMatches(): Match[] {
  if (typeof window === 'undefined') return INITIAL_MATCHES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    // First run — seed with initial data
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

export function updateMatch(id: string, updates: Partial<Match>): Match[] {
  const matches = getMatches();
  const updated = matches.map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveMatches(updated);
  return updated;
}

export function deleteMatch(id: string): Match[] {
  const matches = getMatches();
  const updated = matches.filter((m) => m.id !== id);
  saveMatches(updated);
  return updated;
}

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function saveApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function getPlayerStats(matches: Match[]): { name: string; count: number; positions: string[] }[] {
  const map = new Map<string, { count: number; positions: Set<string> }>();
  matches.forEach((m) => {
    if (!m.lineup) return;
    [...(m.lineup.home || []), ...(m.lineup.away || [])].forEach((p) => {
      const key = p.name;
      if (!map.has(key)) map.set(key, { count: 0, positions: new Set() });
      const entry = map.get(key)!;
      entry.count++;
      if (p.position) entry.positions.add(p.position);
    });
  });
  return Array.from(map.entries())
    .map(([name, { count, positions }]) => ({ name, count, positions: Array.from(positions) }))
    .sort((a, b) => b.count - a.count);
}
