'use client';

import { useState } from 'react';
import { Match } from '@/lib/types';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Star, Edit3, Trash2, Users, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { AnnotationBadge } from './AnnotationBadge';
import { LineupView } from './LineupView';
import { MatchNotesPanel } from './MatchNotesPanel';
import { MatchEvents } from './MatchEvents';
import { EditMatchModal } from './EditMatchModal';

interface Props {
  match: Match;
  onUpdate: (id: string, updates: Partial<Match>) => void;
  onDelete: (id: string) => void;
}

const COMPETITION_COLORS: Record<string, string> = {
  'Premier League': '#3d008099',
  'La Liga': '#cc000099',
  'Ligue 1': '#00318099',
  'Ekstraklasa': '#dc143c99',
  'FIFA World Cup Final': '#c9a84c99',
  'FIFA World Cup': '#c9a84c99',
  'UEFA Euro 2020 Final': '#00339999',
  'Copa Libertadores': '#005ea699',
  'Brasileirão Série A': '#009c3b99',
  'FA Cup': '#1a1a8099',
  'International Friendly': '#55555599',
};

function compColor(name: string) {
  return COMPETITION_COLORS[name] || '#44444499';
}

export function MatchCard({ match, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'lineup' | 'notes'>('events');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const hasAnnotations = match.annotations && match.annotations.length > 0;
  const hasLineup = match.lineup && (match.lineup.home.length > 0 || match.lineup.away.length > 0);
  const hasEvents = match.events && match.events.length > 0;
  const hasNotes = match.notes && match.notes.length > 0;
  const d = {
    mon: format(new Date(match.date), 'MMM'),
    day: format(new Date(match.date), 'd'),
    yr: format(new Date(match.date), 'yyyy'),
  };

  return (
    <>
      <div className={clsx(
        'rounded-xl border transition-all duration-200',
        expanded ? 'border-[#3fb950]/40 bg-[#1c2128]' : 'border-[#30363d] bg-[#1c2128] hover:border-[#484f58] hover:bg-[#21262d]'
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
          <div className="hidden sm:flex flex-col items-center min-w-[40px] text-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#8b949e]">{d.mon}</span>
            <span className="text-xl font-bold text-[#e6edf3] leading-none">{d.day}</span>
            <span className="text-[10px] text-[#8b949e]">{d.yr}</span>
          </div>
          <div className="hidden sm:block w-px h-10 bg-[#30363d]" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#e6edf3] text-sm sm:text-base truncate">{match.homeTeam.name}</span>
              {hasScore ? (
                <span className="font-mono font-bold text-[#3fb950] text-sm px-2 py-0.5 bg-[#3fb950]/10 rounded flex-shrink-0">
                  {match.homeScore} – {match.awayScore}
                </span>
              ) : (
                <span className="text-[#484f58] text-xs">vs</span>
              )}
              <span className="font-semibold text-[#e6edf3] text-sm sm:text-base truncate">{match.awayTeam.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white/80 flex-shrink-0" style={{ backgroundColor: compColor(match.competition.name) }}>
                {match.competition.name}
              </span>
              <span className="text-[11px] text-[#8b949e]">{match.competition.country}</span>
              {match.venue && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#8b949e]">
                  <MapPin size={10} />{match.venue}
                </span>
              )}
              {match.isManual && <span className="text-[10px] text-[#8b949e] border border-[#30363d] rounded px-1">manual</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {hasLineup && <Users size={14} className="text-[#3fb950]" />}
            {hasAnnotations && <Star size={14} className="text-[#e3b341]" />}
            {expanded ? <ChevronUp size={16} className="text-[#8b949e]" /> : <ChevronDown size={16} className="text-[#8b949e]" />}
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-[#30363d]">
            {hasAnnotations && (
              <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-[#21262d]">
                {match.annotations!.map(a => <AnnotationBadge key={a.id} annotation={a} />)}
              </div>
            )}

            {/* Tabs + actions */}
            <div className="border-b border-[#21262d]">
              <div className="flex items-center gap-0 px-4 pt-3 overflow-x-auto">
                <button
                  className={clsx('px-3 py-2 text-sm font-medium border-b-2 transition-colors mr-1 whitespace-nowrap',
                    activeTab === 'events' ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
                  onClick={() => setActiveTab('events')}
                >
                  Events
                  {hasEvents && <span className="ml-1.5 text-[10px] bg-[#3fb950]/20 text-[#3fb950] px-1.5 rounded-full">{match.events!.filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty' && !e.comments?.includes('Penalty Shootout')).length}</span>}
                </button>
                <button
                  className={clsx('px-3 py-2 text-sm font-medium border-b-2 transition-colors mr-1 whitespace-nowrap',
                    activeTab === 'lineup' ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
                  onClick={() => setActiveTab('lineup')}
                >
                  <Users size={13} className="inline mr-1" />Lineup
                </button>
                <button
                  className={clsx('px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeTab === 'notes' ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
                  onClick={() => setActiveTab('notes')}
                >
                  <Edit3 size={13} className="inline mr-1" />Notes
                  {hasNotes && <span className="ml-1.5 text-[10px] bg-[#3fb950]/20 text-[#3fb950] px-1.5 rounded-full">{match.notes!.length}</span>}
                </button>

                <div className="ml-auto flex items-center gap-1 pb-1 pl-2 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); setEditing(true); }}
                    className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#58a6ff] px-2 py-1 rounded hover:bg-[#58a6ff]/10 transition-colors"
                  >
                    <Edit3 size={12} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  {!confirmDelete ? (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                      className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#f85149] px-2 py-1 rounded hover:bg-[#f85149]/10 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#f85149] hidden sm:inline">Sure?</span>
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(match.id); }}
                        className="text-xs text-white bg-[#f85149] px-2 py-1 rounded hover:bg-[#f85149]/80"
                      >
                        Yes
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDelete(false); }}
                        className="text-xs text-[#8b949e] border border-[#30363d] px-2 py-1 rounded hover:bg-[#30363d]"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {activeTab === 'events' && (
              <div>
                {hasEvents ? (
                  <MatchEvents
                    events={match.events!}
                    homeTeam={match.homeTeam.name}
                    awayTeam={match.awayTeam.name}
                    apiHomeTeam={match.apiHomeTeam}
                    apiAwayTeam={match.apiAwayTeam}
                  />
                ) : (
                  <div className="p-4 text-center text-sm text-[#8b949e]">
                    {match.isManual ? 'No events for manually added matches.' : 'Fetch lineup to load match events.'}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'lineup' && (
              <div className="p-4">
                <LineupView match={match} onUpdate={onUpdate} />
              </div>
            )}
            {activeTab === 'notes' && (
              <div className="p-4">
                <MatchNotesPanel match={match} onUpdate={onUpdate} />
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <EditMatchModal
          match={match}
          onSave={updates => { onUpdate(match.id, updates); setEditing(false); }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
