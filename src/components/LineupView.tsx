'use client';

import { useState, useMemo } from 'react';
import { Match, Player, PlayerProfile } from '@/lib/types';
import { searchFixtures, fetchLineupAndEvents } from '@/lib/api-sports';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import { getPlayerProfiles } from '@/lib/storage';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Props {
  match: Match;
  onUpdate: (id: string, updates: Partial<Match>) => void;
  allMatches?: Match[];
}

// Mini player profile modal shown when clicking a player in the lineup
function PlayerQuickProfile({
  profile,
  allMatches,
  onClose,
}: {
  profile: PlayerProfile;
  allMatches: Match[];
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const playerMatches = allMatches.filter(m => profile.matchIds.includes(m.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            {profile.photo && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo} alt={profile.name} width={40} height={40} className="rounded-full object-cover bg-[#30363d]" onError={() => setImgError(true)} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#30363d] flex items-center justify-center text-[#8b949e] text-xs font-medium">
                {profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-[#e6edf3] text-sm">{profile.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {profile.positions[0] && <span className="text-xs text-[#8b949e]">{profile.positions[0]}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4 border-b border-[#30363d]">
          <div className="bg-[#161b22] rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-[#3fb950]">{profile.appearances}</div>
            <div className="text-[10px] text-[#8b949e]">Seen</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-[#e3b341]">{profile.goals}</div>
            <div className="text-[10px] text-[#8b949e]">Goals</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-[#58a6ff]">{profile.teams.length}</div>
            <div className="text-[10px] text-[#8b949e]">Teams</div>
          </div>
        </div>

        {playerMatches.length > 0 && (
          <div className="p-4">
            <div className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider mb-2">Matches</div>
            <div className="space-y-2">
              {playerMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                <div key={m.id} className="flex items-center gap-2 bg-[#161b22] rounded-lg px-3 py-2">
                  <Calendar size={11} className="text-[#484f58] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#e6edf3] truncate">{m.homeTeam.name} vs {m.awayTeam.name}</div>
                    <div className="text-[10px] text-[#8b949e]">{format(new Date(m.date), 'd MMM yyyy')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerRow({ player, onClick }: { player: Player; onClick?: () => void }) {
  const isUnused = player.unusedSub;
  return (
    <div
      className={clsx(
        'flex items-center gap-2 py-1.5 border-b border-[#21262d] last:border-0',
        isUnused && 'opacity-40',
        onClick && !isUnused && 'cursor-pointer hover:bg-[#21262d] rounded px-1 -mx-1'
      )}
      onClick={onClick && !isUnused ? onClick : undefined}
    >
      {player.number !== undefined && (
        <span className="w-6 text-center text-xs font-mono text-[#8b949e]">{player.number}</span>
      )}
      <span className={clsx('flex-1 text-sm', isUnused ? 'text-[#8b949e]' : 'text-[#e6edf3]')}>
        {player.name}
      </span>
      {player.cameOn && player.cameOnMinute !== undefined && (
        <span className="text-[10px] text-[#3fb950] font-mono">+{player.cameOnMinute}&apos;</span>
      )}
      {player.wentOff && player.wentOffMinute !== undefined && (
        <span className="text-[10px] text-[#f85149] font-mono">{player.wentOffMinute}&apos;</span>
      )}
      {player.position && !player.unusedSub && (
        <span className={clsx(
          'text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide',
          player.position === 'SUB' ? 'bg-[#30363d] text-[#8b949e]'
          : player.position === 'G' ? 'bg-[#e3b341]/20 text-[#e3b341]'
          : player.position === 'D' ? 'bg-[#58a6ff]/20 text-[#58a6ff]'
          : player.position === 'M' ? 'bg-[#3fb950]/20 text-[#3fb950]'
          : 'bg-[#f85149]/20 text-[#f85149]'
        )}>
          {player.position}
        </span>
      )}
      {player.unusedSub && <span className="text-[10px] text-[#484f58] italic">unused</span>}
    </div>
  );
}

function TeamLineup({
  name,
  players,
  allMatches,
  profiles,
}: {
  name: string;
  players: Player[];
  allMatches: Match[];
  profiles: PlayerProfile[];
}) {
  const starters = players.filter(p => p.isStarter);
  const activeSubs = players.filter(p => !p.isStarter && p.cameOn);
  const unusedSubs = players.filter(p => !p.isStarter && p.unusedSub);
  const [showUnused, setShowUnused] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null);

  const getProfile = (player: Player): PlayerProfile | null => {
    if (player.id) return profiles.find(p => p.id === player.id) || null;
    return profiles.find(p => p.name.toLowerCase() === player.name.toLowerCase()) || null;
  };

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">{name}</h4>
      <div>
        {starters.map((p, i) => (
          <PlayerRow
            key={p.id || `${p.name}-${i}`}
            player={p}
            onClick={() => { const prof = getProfile(p); if (prof) setSelectedProfile(prof); }}
          />
        ))}
      </div>
      {activeSubs.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] text-[#484f58] uppercase tracking-wider mb-1">Substitutes used</div>
          {activeSubs.sort((a, b) => (a.cameOnMinute || 0) - (b.cameOnMinute || 0)).map((p, i) => (
            <PlayerRow
              key={p.id || `${p.name}-sub-${i}`}
              player={p}
              onClick={() => { const prof = getProfile(p); if (prof) setSelectedProfile(prof); }}
            />
          ))}
        </div>
      )}
      {unusedSubs.length > 0 && (
        <div className="mt-2">
          <button className="flex items-center gap-1 text-xs text-[#484f58] hover:text-[#8b949e] mb-1" onClick={() => setShowUnused(v => !v)}>
            {showUnused ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {unusedSubs.length} unused subs
          </button>
          {showUnused && unusedSubs.map((p, i) => <PlayerRow key={p.id || `${p.name}-unused-${i}`} player={p} />)}
        </div>
      )}

      {selectedProfile && (
        <PlayerQuickProfile
          profile={selectedProfile}
          allMatches={allMatches}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

export function LineupView({ match, onUpdate, allMatches = [] }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const profiles = useMemo(() => getPlayerProfiles(allMatches), [allMatches]);

  const fetchFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const fixtures = await searchFixtures(
        match.homeTeam.name,
        match.awayTeam.name,
        match.date,
        match.competition.name,
        match.competition.leagueId,
        match.homeTeam.apiId,
        match.awayTeam.apiId,
      );

      if (fixtures.length === 0) {
        setError('No fixture found. Try editing the competition or fetching with different team names.');
        return;
      }

      const fixture = fixtures[0];
      const { lineup, events, apiHomeTeam, apiAwayTeam } = await fetchLineupAndEvents(fixture.id);

      if (!lineup) {
        setError('Lineup data not available for this fixture.');
        return;
      }

      onUpdate(match.id, {
        lineup,
        events,
        apiHomeTeam,
        apiAwayTeam,
        homeScore: fixture.homeScore ?? match.homeScore,
        awayScore: fixture.awayScore ?? match.awayScore,
        venue: fixture.venue || match.venue,
        apiFixtureId: fixture.id,
      });
      setFetched(true);
    } catch {
      setError('Failed to fetch from API-Sports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasLineup) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <p className="text-sm text-[#8b949e] text-center">
          {match.isManual ? 'Manually added match.' : 'No lineup data yet.'}
        </p>
        {!match.isManual && (
          <button
            onClick={fetchFromApi}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Fetching lineup…' : 'Fetch Lineup from API-Sports'}
          </button>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 rounded-lg px-3 py-2 max-w-sm text-center">
            <AlertCircle size={12} className="shrink-0" />
            {error}
          </div>
        )}
        {fetched && <p className="text-xs text-[#3fb950]">Lineup fetched successfully</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#8b949e]">
          {match.lineup!.home.filter(p => p.isStarter).length} starters · tap a player to view profile
        </span>
        <button onClick={fetchFromApi} disabled={loading} className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors">
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      <div className="flex gap-6">
        <TeamLineup name={match.homeTeam.name} players={match.lineup!.home} allMatches={allMatches} profiles={profiles} />
        <div className="w-px bg-[#30363d]" />
        <TeamLineup name={match.awayTeam.name} players={match.lineup!.away} allMatches={allMatches} profiles={profiles} />
      </div>
      {error && <p className="text-xs text-[#f85149] mt-2">{error}</p>}
    </div>
  );
}
