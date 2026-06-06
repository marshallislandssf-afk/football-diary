'use client';

import { useMemo, useState } from 'react';
import { Match, PlayerProfile } from '@/lib/types';
import { getPlayerProfiles } from '@/lib/storage';
import { Users, X, Trophy, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  matches: Match[];
}

function PlayerPhoto({ profile, size = 32 }: { profile: PlayerProfile; size?: number }) {
  const [errored, setErrored] = useState(false);
  if (!profile.photo || errored) {
    return (
      <div
        className="rounded-full bg-[#30363d] flex items-center justify-center text-[#8b949e] font-medium text-xs flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.photo}
      alt={profile.name}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0 bg-[#30363d]"
      onError={() => setErrored(true)}
    />
  );
}

function PlayerProfileModal({
  profile,
  matches,
  onClose,
}: {
  profile: PlayerProfile;
  matches: Match[];
  onClose: () => void;
}) {
  const playerMatches = matches.filter(m => profile.matchIds.includes(m.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            <PlayerPhoto profile={profile} size={48} />
            <div>
              <h2 className="font-semibold text-[#e6edf3] text-base">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {profile.positions.length > 0 && (
                  <span className="text-xs text-[#8b949e]">{profile.positions.join(' / ')}</span>
                )}
                {profile.id && (
                  <span className="text-[10px] text-[#484f58]">ID: {profile.id}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-[#30363d]">
          <div className="bg-[#161b22] rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#3fb950]">{profile.appearances}</div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">Seen</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#e3b341]">{profile.goals}</div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">Goals</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#58a6ff]">{profile.teams.length}</div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">Teams</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#bc8cff]">{profile.positions.length > 0 ? profile.positions[0] : '—'}</div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">Pos</div>
          </div>
        </div>

        {/* Teams */}
        {profile.teams.length > 0 && (
          <div className="px-4 py-3 border-b border-[#30363d]">
            <div className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider mb-2">Teams seen playing for</div>
            <div className="flex flex-wrap gap-2">
              {profile.teams.map(team => (
                <span key={team} className="text-xs bg-[#21262d] text-[#e6edf3] px-2 py-1 rounded-lg">{team}</span>
              ))}
            </div>
          </div>
        )}

        {/* Matches */}
        <div className="px-4 py-3">
          <div className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider mb-2">Matches</div>
          <div className="space-y-2">
            {playerMatches
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-[#161b22] rounded-lg px-3 py-2">
                  <Calendar size={12} className="text-[#484f58] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#e6edf3]">
                      {m.homeTeam.name} vs {m.awayTeam.name}
                    </div>
                    <div className="text-[10px] text-[#8b949e]">
                      {format(new Date(m.date), 'd MMM yyyy')} · {m.competition.name}
                    </div>
                  </div>
                  {m.homeScore !== undefined && (
                    <span className="text-xs font-mono text-[#3fb950]">
                      {m.homeScore}–{m.awayScore}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayerStatsPanel({ matches }: Props) {
  const profiles = useMemo(() => getPlayerProfiles(matches).slice(0, 50), [matches]);
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null);

  const max = profiles[0]?.appearances || 1;

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8 text-[#8b949e] text-sm">
        <Users size={24} className="mx-auto mb-2 opacity-40" />
        No lineup data yet — fetch lineups from API-Sports to see player stats.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {profiles.map((profile, i) => (
          <button
            key={profile.id || profile.name}
            onClick={() => setSelectedProfile(profile)}
            className="w-full flex items-center gap-3 hover:bg-[#21262d] rounded-lg px-2 py-1.5 transition-colors text-left group"
          >
            <span className="w-5 text-xs text-[#484f58] text-right font-mono flex-shrink-0">{i + 1}</span>
            <PlayerPhoto profile={profile} size={28} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-[#e6edf3] truncate group-hover:text-white">{profile.name}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {profile.goals > 0 && (
                    <span className="text-xs font-mono text-[#e3b341]">G:{profile.goals}</span>
                  )}
                  <span className="text-xs font-mono text-[#3fb950]">{profile.appearances}x</span>
                </div>
              </div>
              <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] rounded-full"
                  style={{ width: `${(profile.appearances / max) * 100}%` }}
                />
              </div>
            </div>
            {profile.positions[0] && (
              <span className="text-[10px] text-[#8b949e] w-6 text-center flex-shrink-0">
                {profile.positions[0]}
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedProfile && (
        <PlayerProfileModal
          profile={selectedProfile}
          matches={matches}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
}
