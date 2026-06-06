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
    if (detail === 'Second Yellow Card') return <span title="Second Yellow">🟨🟥</span>;
    return <span title="Yellow Card">🟨</span>;
  }
  if (type === 'Var') return <span title="VAR">📺</span>;
  return <span />;
}

function getEventColor(type: string, detail: string): string {
  if (type === 'Goal' && detail === 'Missed Penalty') return 'text-[#f85149]';
  if (type === 'Goal') return 'text-[#3fb950]';
  if (type === 'Card' && detail === 'Red Card') return 'text-[#f85149]';
