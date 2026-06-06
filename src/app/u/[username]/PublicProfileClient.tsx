'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/lib/types';
import { format } from 'date-fns';
import { MapPin, Trophy, Globe, Calendar, ChevronDown, ChevronUp, Star } from 'lucide-react';
import clsx from 'clsx';
import { AnnotationBadge } from '@/components/AnnotationBadge';
import { MatchEvents } from '@/components/MatchEvents';
import { PlayerStatsPanel } from '@/components/PlayerStatsPanel';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  is_public: boolean;
}

interface Props {
  profile: Profile;
  matches: Match[];
}

const COMPETITION_COLORS: Record<string, string> = {
  'Premier League': '#3d008099',
  'La Liga': '#cc000099',
  'Ligue 1': '#00318099',
  'Ekstraklasa': '#dc143c99',
  'FIFA World Cup Final': '#c9a84c99',
  'FIFA World Cup': '#c9a84c99',
  'UEFA Euro 2020 Final': '#00339999',
  'FA Cup': '#1a1a8099',
  'International Friendly': '#55555599',
};

function compColor(name: string) {
  return COMPETITION_COLORS[name] || '#44444499';
}

function PublicMatchCard({ match }: { match: Match }) {
  const [expanded, setExpanded] = useState(false);
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const hasAnnotations = match.annotations && match.annotations.length > 0;
  const hasEvents = match.events && match.events.length > 0;

  return (
    <div className={clsx(
      'rounded-xl border transition-all duration-200',
      expanded ? 'border-[#3fb950]/40 bg-[#1c2128]' : 'border-[#30363d] bg-[#1c2128] hover:border-[#484f58]'
    )}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="hidden sm:flex flex-col items-center min-w-[40px] text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8b949e]">{format(new Date(match.date), 'MMM')}</span>
          <span className="text-xl font-bold text-[#e6edf3] leading-none">{format(new Date(match.date), 'd')}</span>
          <span className="text-[10px] text-[#8b949e]">{format(new Date(match.date), 'yyyy')}</span>
        </div>
        <div className="hidden sm:block w-px h-10 bg-[#30363d]" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#e6edf3] text-sm truncate">{match.homeTeam.name}</span>
            {hasScore ? (
              <span className="font-mono font-bold text-[#3fb950] text-sm px-2 py-0.5 bg-[#3fb950]/10 rounded flex-shrink-0">
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <span className="text-[#484f58] text-xs">vs</span>
            )}
            <span className="font-semibold text-[#e6edf3] text-sm truncate">{match.awayTeam.name}</span>
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
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {hasAnnotations && <Star size={14} className="text-[#e3b341]" />}
          {expanded ? <ChevronUp size={16} className="text-[#8b949e]" /> : <ChevronDown size={16} className="text-[#8b949e]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#30363d]">
          {hasAnnotations && (
            <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-[#21262d]">
              {match.annotations!.map(a => <AnnotationBadge key={a.id} annotation={a} />)}
            </div>
          )}
          {hasEvents ? (
            <MatchEvents
              events={match.events!}
              homeTeam={match.homeTeam.name}
              awayTeam={match.awayTeam.name}
              apiHomeTeam={match.apiHomeTeam}
              apiAwayTeam={match.apiAwayTeam}
            />
          ) : (
            <div className="p-4 text-center text-sm text-[#8b949e]">No events data available</div>
          )}
        </div>
      )}
    </div>
  );
}

export function PublicProfileClient({ profile, matches }: Props) {
  const [tab, setTab] = useState<'matches' | 'players'>('matches');
  const [copied, setCopied] = useState(false);

  const countries = useMemo(() => new Set(matches.map(m => m.competition.country)).size, [matches]);
  const competitions = useMemo(() => new Set(matches.map(m => m.competition.name)).size, [matches]);

  const groupedMatches = useMemo(() => {
    const groups: { year: string; matches: Match[] }[] = [];
    let currentYear = '';
    matches.forEach(m => {
      const year = new Date(m.date).getFullYear().toString();
      if (year !== currentYear) { groups.push({ year, matches: [] }); currentYear = year; }
      groups[groups.length - 1].matches.push(m);
    });
    return groups;
  }, [matches]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">⚽</span>
                <h1 className="text-xl font-bold text-[#e6edf3]">
                  {profile.display_name || profile.username}
                </h1>
              </div>
              <p className="text-sm text-[#8b949e]">@{profile.username} · Football Diary</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] transition-colors flex-shrink-0"
            >
              {copied ? '✓ Copied!' : 'Share link'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#3fb950]">{matches.length}</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5 flex items-center justify-center gap-1"><Calendar size={10} />Matches</div>
            </div>
            <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#58a6ff]">{countries}</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5 flex items-center justify-center gap-1"><Globe size={10} />Countries</div>
            </div>
            <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#e3b341]">{competitions}</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5 flex items-center justify-center gap-1"><Trophy size={10} />Competitions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-0">
          <button
            onClick={() => setTab('matches')}
            className={clsx('px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'matches' ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
          >
            Matches
          </button>
          <button
            onClick={() => setTab('players')}
            className={clsx('px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'players' ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
          >
            Players
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'matches' && (
          matches.length === 0 ? (
            <div className="text-center py-16 text-[#8b949e]">
              <p>No public matches yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedMatches.map(({ year, matches: yearMatches }) => (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xs font-bold text-[#484f58] uppercase tracking-widest">{year}</h2>
                    <div className="flex-1 h-px bg-[#21262d]" />
                    <span className="text-xs text-[#484f58]">{yearMatches.length}</span>
                  </div>
                  <div className="space-y-2">
                    {yearMatches.map(m => <PublicMatchCard key={m.id} match={m} />)}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {tab === 'players' && (
          <div className="max-w-2xl">
            <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5">
              <PlayerStatsPanel matches={matches} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-[#484f58] text-xs">
        <a href="/" className="hover:text-[#8b949e] transition-colors">
          ⚽ Football Diary — track every match you attend
        </a>
      </div>
    </div>
  );
}
