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
    if (detail === 'Missed Penalty') return <span title="Missed Penalty">x</span>;
    if (detail === 'Penalty') return <span title="Penalty">P</span>;
    if (detail === 'Own Goal') return <span title="Own Goal">OG</span>;
    return <span title="Goal">G</span>;
  }
  if (type === 'Card') {
    if (detail === 'Red Card') return <span title="Red Card">R</span>;
    return <span title="Yellow Card">Y</span>;
  }
  return <span />;
}

function getEventColor(type: string, detail: string): string {
  if (type === 'Goal' && detail === 'Missed Penalty') return 'text-[#f85149]';
  if (type === 'Goal') return 'text-[#3fb950]';
  if (type === 'Card' && detail === 'Red Card') return 'text-[#f85149]';
  if (type === 'Card') return 'text-[#e3b341]';
  return 'text-[#8b949e]';
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderEvent(e: MatchEvent, i: number, effectiveHome: string): JSX.Element {
  const isHome =
    e.team === effectiveHome ||
    normalize(e.team || '').includes(normalize(effectiveHome.split(' ')[0])) ||
    normalize(effectiveHome).includes(normalize((e.team || '').split(' ')[0]));
  const minuteStr = e.extra ? `${e.minute}+${e.extra}'` : `${e.minute}'`;
  const isMissed = e.detail === 'Missed Penalty';
  return (
    <div key={i} className={clsx('flex items-center gap-2 py-1', isHome ? 'flex-row' : 'flex-row-reverse')}>
      <span className="text-[11px] font-mono text-[#484f58] w-12 flex-shrink-0 text-center">{minuteStr}</span>
      <span className={clsx('text-sm flex-shrink-0', getEventColor(e.type, e.detail))}>
        <EventIcon type={e.type} detail={e.detail} />
      </span>
      <span className={clsx('text-xs flex-1', isHome ? 'text-left' : 'text-right', isMissed ? 'line-through text-[#f85149]/70' : 'text-[#e6edf3]')}>
        {e.player}
        {e.assist && e.type === 'Goal' && !isMissed && (
          <span className="text-[#8b949e] ml-1">({e.assist})</span>
        )}
      </span>
    </div>
  );
}

export function MatchEvents({ events, homeTeam, awayTeam, apiHomeTeam }: Props): JSX.Element | null {
  if (!events || events.length === 0) return null;
  const effectiveHome = apiHomeTeam || homeTeam;
  const regular = events.filter((e) => !e.comments?.includes('Penalty Shootout') && e.minute <= 90);
  const extraTime = events.filter((e) => !e.comments?.includes('Penalty Shootout') && e.minute > 90);
  const shootout = events.filter((e) => e.comments?.includes('Penalty Shootout'));
  return (
    <div className="border-b border-[#21262d] px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider">{homeTeam}</span>
        <span className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider">{awayTeam}</span>
      </div>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#21262d] -translate-x-1/2" />
        {regular.map((e, i) => renderEvent(e, i, effectiveHome))}
        {extraTime.length > 0 && (
          <div>
            <div className="text-[10px] text-center text-[#484f58] my-1 uppercase tracking-wider">Extra Time</div>
            {extraTime.map((e, i) => renderEvent(e, i + 1000, effectiveHome))}
          </div>
        )}
        {shootout.length > 0 && (
          <div>
            <div className="text-[10px] text-center text-[#484f58] my-1 uppercase tracking-wider">Penalty Shootout</div>
            {shootout.map((e, i) => renderEvent(e, i + 2000, effectiveHome))}
          </div>
        )}
      </div>
    </div>
  );
}
