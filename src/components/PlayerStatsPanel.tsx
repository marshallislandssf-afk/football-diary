'use client';

import { useMemo } from 'react';
import { Match } from '@/lib/types';
import { getPlayerStats } from '@/lib/storage';
import { Users } from 'lucide-react';

interface Props {
  matches: Match[];
}

export function PlayerStatsPanel({ matches }: Props) {
  const stats = useMemo(() => getPlayerStats(matches).slice(0, 20), [matches]);

  const max = stats[0]?.count || 1;

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-[#8b949e] text-sm">
        <Users size={24} className="mx-auto mb-2 opacity-40" />
        No lineup data yet — fetch lineups from API-Sports to see player stats.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stats.map((player, i) => (
        <div key={player.name} className="flex items-center gap-3">
          <span className="w-5 text-xs text-[#484f58] text-right font-mono">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm text-[#e6edf3] truncate">{player.name}</span>
              <span className="text-xs font-mono text-[#3fb950] ml-2">
                {player.count}×
              </span>
            </div>
            <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] rounded-full transition-all duration-500"
                style={{ width: `${(player.count / max) * 100}%` }}
              />
            </div>
          </div>
          {player.positions.length > 0 && player.positions[0] !== 'SUB' && (
            <span className="text-[10px] text-[#8b949e] w-8 text-center">
              {player.positions[0]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
