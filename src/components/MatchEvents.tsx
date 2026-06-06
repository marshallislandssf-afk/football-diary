'use client';

import { MatchEvent } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  events: MatchEvent[];
  homeTeam: string;
  awayTeam: string;
  apiHomeTeam?: string;
  apiAwayTeam?: string;
}

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === 'Goal') {
    if (detail === 'Missed Penalty') return <span title="Missed Penalty">✗</span>;
    if (detail === 'Penalty') return <span title="Penalty">⚽P</span>;
    if (detail === 'Own Goal') return <span title="Own Goal">⚽OG</span>;
    return <span title="Goal">⚽</span>;
  }
  if (type === 'Card') {
    if (detail === 'Red Card') return <span title="Red Card">🟥</span>;
    if (detail === 'Second Yellow Card') return <span title="Second Yellow / Red">🟨🟥</span>;
    return <span title="Yellow Card">🟨</span>;
  }
  if (type === 'Var') return <span title="VAR">📺</span>;
  return null;
}

function getEventColor(type: string, detail: string) {
  if (type === 'Goal' && detail === 'Missed Penalty') return 'text-[#f85149]';
  if (type === 'Goal') return 'text-[#3fb950]';
  if (type === 'Card' && detail === 'Red Card') return 'text-[#f85149]';
  if (type === 'Card') return 'text-[#e3b341]';
  return 'text-[#8b949e]';
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function MatchEvents({ events, homeTeam, awayTeam, apiHomeTeam, apiAwayTeam }: Props) {
  if (!events || events.length === 0) return null;

  const effectiveHome = apiHomeTeam || homeTeam;

  const regular = events.filter(e => !e.comments?.includes('Penalty Shootout') && e.minute <= 90);
  const extraTime = events.filter(e => !e.comments?.includes('Penalty Shootout') && e.minute > 90);
  const shootout = events.filter(e => e.comments?.includes('Penalty Shootout'));

  const renderEvent = (e: MatchEvent, i: number) => {
    const isHome =
      e.team === effectiveHome ||
      normalize(e.team || '').includes(normalize(effectiveHome.split(' ')[0])) ||
      normalize(effectiveHome).includes(normalize((e.team || '').split(' ')[0]));

    const minuteStr = e.extra ? `${e.minute}+${e.extra}'` : `${e.minute}'`;
    const isMissed = e.detail === 'Missed Penalty';

    return (
      <div
        key={i}
        className={clsx('flex items-center gap-2 py-1', isHome ? 'flex-row' : 'flex-row-reverse')}
      >
