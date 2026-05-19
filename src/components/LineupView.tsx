'use client';

import { useState } from 'react';
import { Match, Player } from '@/lib/types';
import { fetchLineup, searchFixtures } from '@/lib/api-sports';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  match: Match;
  onUpdate: (id: string, updates: Partial<Match>) => void;
}

function PlayerRow({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#21262d] last:border-0">
      {player.number !== undefined && (
        <span className="w-6 text-center text-xs font-mono text-[#8b949e]">
          {player.number}
        </span>
      )}
      <span className="flex-1 text-sm text-[#e6edf3]">{player.name}</span>
      {player.position && (
        <span
          className={clsx(
            'text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide',
            player.position === 'SUB'
              ? 'bg-[#30363d] text-[#8b949e]'
              : player.position === 'G'
              ? 'bg-[#e3b341]/20 text-[#e3b341]'
              : player.position === 'D'
              ? 'bg-[#58a6ff]/20 text-[#58a6ff]'
              : player.position === 'M'
              ? 'bg-[#3fb950]/20 text-[#3fb950]'
              : 'bg-[#f85149]/20 text-[#f85149]'
          )}
        >
          {player.position}
        </span>
      )}
    </div>
  );
}

function TeamLineup({ name, players }: { name: string; players: Player[] }) {
  const starters = players.filter((p) => p.position !== 'SUB');
  const subs = players.filter((p) => p.position === 'SUB');
  const [showSubs, setShowSubs] = useState(false);

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
        {name}
      </h4>
      <div>
        {starters.map((p, i) => (
          <PlayerRow key={p.id || `${p.name}-${i}`} player={p} />
        ))}
      </div>
      {subs.length > 0 && (
        <div className="mt-2">
          <button
            className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3] mb-1"
            onClick={() => setShowSubs((v) => !v)}
          >
            {showSubs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {subs.length} substitutes
          </button>
          {showSubs && subs.map((p, i) => (
            <PlayerRow key={p.id || `${p.name}-sub-${i}`} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LineupView({ match, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const hasLineup = match.lineup && (
    match.lineup.home.length > 0 || match.lineup.away.length > 0
  );

  const fetchFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const fixtures = await searchFixtures(
        match.homeTeam.name,
        match.awayTeam.name,
        match.date
      );

      if (fixtures.length === 0) {
        setError('No fixture found on API-Sports for this match.');
        return;
      }

      const fixture = fixtures[0];
      const lineup = await fetchLineup(fixture.id);

      if (!lineup) {
        setError('Lineup data not available for this fixture.');
        return;
      }

      onUpdate(match.id, {
        lineup,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        venue: fixture.venue || match.venue,
        apiFixtureId: fixture.id,
      });
      setFetched(true);
    } catch (e) {
      setError('Failed to fetch from API-Sports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasLineup) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <p className="text-sm text-[#8b949e] text-center">
          No lineup data yet.
          {match.isManual
            ? ' This is a manually added match — edit to add players manually.'
            : ' Fetch from API-Sports below.'}
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
        {fetched && (
          <p className="text-xs text-[#3fb950]">✓ Lineup fetched successfully</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#8b949e]">
          {match.lineup!.home.filter(p => p.position !== 'SUB').length} starters each side
        </span>
        {!match.isManual && (
          <button
            onClick={fetchFromApi}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>
      <div className="flex gap-6">
        <TeamLineup name={match.homeTeam.name} players={match.lineup!.home} />
        <div className="w-px bg-[#30363d]" />
        <TeamLineup name={match.awayTeam.name} players={match.lineup!.away} />
      </div>
      {error && (
        <p className="text-xs text-[#f85149] mt-2">{error}</p>
      )}
    </div>
  );
}
