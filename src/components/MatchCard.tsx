'use client';

import { useState } from 'react';
import { Match, Annotation } from '@/lib/types';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Trophy,
  Zap,
  Edit3,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Tag,
} from 'lucide-react';
import clsx from 'clsx';
import { AnnotationBadge } from './AnnotationBadge';
import { LineupView } from './LineupView';
import { MatchNotesPanel } from './MatchNotesPanel';
import { EditMatchModal } from './EditMatchModal';

interface Props {
  match: Match;
  onUpdate: (id: string, updates: Partial<Match>) => void;
  onDelete: (id: string) => void;
}

const ANNOTATION_ICONS: Record<string, React.ReactNode> = {
  promotion: <TrendingUp size={12} />,
  milestone: <Star size={12} />,
  special: <Trophy size={12} />,
  goal: <Zap size={12} />,
  custom: <Tag size={12} />,
};

const COMPETITION_COLORS: Record<string, string> = {
  'Premier League': '#3d0080',
  'La Liga': '#cc0000',
  'Ligue 1': '#003180',
  'Ekstraklasa': '#dc143c',
  'FIFA World Cup Final': '#c9a84c',
  'UEFA Euro 2020 Final': '#003399',
  'Copa Libertadores': '#005ea6',
  'Brasileirão Série A': '#009c3b',
};

function getCompetitionColor(name: string): string {
  return COMPETITION_COLORS[name] || '#30363d';
}

export function MatchCard({ match, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'lineup' | 'notes'>('lineup');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const hasAnnotations = match.annotations && match.annotations.length > 0;
  const hasLineup = match.lineup && (match.lineup.home.length > 0 || match.lineup.away.length > 0);
  const hasNotes = match.notes && match.notes.length > 0;

  const formattedDate = format(new Date(match.date), 'EEE d MMM yyyy');

  return (
    <>
      <div
        className={clsx(
          'rounded-xl border transition-all duration-200',
          expanded
            ? 'border-[#3fb950]/40 bg-[#1c2128]'
            : 'border-[#30363d] bg-[#1c2128] hover:border-[#484f58] hover:bg-[#21262d]'
        )}
      >
        {/* Header row */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Date */}
          <div className="hidden sm:flex flex-col items-center min-w-[52px] text-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#8b949e]">
              {format(new Date(match.date), 'MMM')}
            </span>
            <span className="text-xl font-bold text-[#e6edf3] leading-none">
              {format(new Date(match.date), 'd')}
            </span>
            <span className="text-[10px] text-[#8b949e]">
              {format(new Date(match.date), 'yyyy')}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-[#30363d]" />

          {/* Teams & score */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#e6edf3] text-sm sm:text-base truncate">
                {match.homeTeam.name}
              </span>
              {hasScore ? (
                <span className="font-mono font-bold text-[#3fb950] text-sm px-2 py-0.5 bg-[#3fb950]/10 rounded">
                  {match.homeScore} – {match.awayScore}
                </span>
              ) : (
                <span className="text-[#484f58] text-xs">vs</span>
              )}
              <span className="font-semibold text-[#e6edf3] text-sm sm:text-base truncate">
                {match.awayTeam.name}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white/80"
                style={{ backgroundColor: getCompetitionColor(match.competition.name) + '99' }}
              >
                {match.competition.name}
              </span>
              <span className="text-[11px] text-[#8b949e]">{match.competition.country}</span>
              {match.venue && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#8b949e]">
                  <MapPin size={10} />
                  {match.venue}
                </span>
              )}
              {/* Mobile date */}
              <span className="sm:hidden text-[11px] text-[#8b949e]">
                <Calendar size={10} className="inline mr-1" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Annotations pills */}
          {hasAnnotations && (
            <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
              {match.annotations!.slice(0, 2).map((a) => (
                <AnnotationBadge key={a.id} annotation={a} compact />
              ))}
              {match.annotations!.length > 2 && (
                <span className="text-[10px] text-[#8b949e]">
                  +{match.annotations!.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Indicators */}
          <div className="flex items-center gap-2 ml-auto">
            {hasLineup && (
              <span title="Lineup available">
                <Users size={14} className="text-[#3fb950]" />
              </span>
            )}
            {hasAnnotations && (
              <span title="Has annotations">
                <Star size={14} className="text-[#e3b341]" />
              </span>
            )}
            {match.isManual && (
              <span className="text-[10px] text-[#8b949e] border border-[#30363d] rounded px-1">
                manual
              </span>
            )}
            {expanded ? (
              <ChevronUp size={16} className="text-[#8b949e]" />
            ) : (
              <ChevronDown size={16} className="text-[#8b949e]" />
            )}
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="border-t border-[#30363d] animate-slide-down">
            {/* Annotations */}
            {hasAnnotations && (
              <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-[#21262d]">
                {match.annotations!.map((a) => (
                  <AnnotationBadge key={a.id} annotation={a} />
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-0 px-4 pt-3 border-b border-[#21262d]">
              <button
                className={clsx(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors mr-1',
                  activeTab === 'lineup'
                    ? 'border-[#3fb950] text-[#3fb950]'
                    : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                )}
                onClick={() => setActiveTab('lineup')}
              >
                <Users size={14} className="inline mr-1.5" />
                Lineup
              </button>
              <button
                className={clsx(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'notes'
                    ? 'border-[#3fb950] text-[#3fb950]'
                    : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                )}
                onClick={() => setActiveTab('notes')}
              >
                <Edit3 size={14} className="inline mr-1.5" />
                Notes & Images
                {hasNotes && (
                  <span className="ml-1.5 text-[10px] bg-[#3fb950]/20 text-[#3fb950] px-1.5 rounded-full">
                    {match.notes!.length}
                  </span>
                )}
              </button>

              {/* Actions */}
              <div className="ml-auto flex items-center gap-2 pb-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                  className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#58a6ff] px-2 py-1 rounded hover:bg-[#58a6ff]/10 transition-colors"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#f85149] px-2 py-1 rounded hover:bg-[#f85149]/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#f85149]">Sure?</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
                      className="text-xs text-[#f85149] border border-[#f85149]/40 px-2 py-0.5 rounded hover:bg-[#f85149]/10"
                    >Yes</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                      className="text-xs text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded hover:bg-[#30363d]"
                    >No</button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab content */}
            <div className="p-4">
              {activeTab === 'lineup' && (
                <LineupView
                  match={match}
                  onUpdate={onUpdate}
                />
              )}
              {activeTab === 'notes' && (
                <MatchNotesPanel
                  match={match}
                  onUpdate={onUpdate}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {editing && (
        <EditMatchModal
          match={match}
          onSave={(updates) => { onUpdate(match.id, updates); setEditing(false); }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
