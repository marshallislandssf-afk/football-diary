import { Match } from '@/lib/types';
import { useMemo } from 'react';
import { Globe, Trophy, Calendar, Users } from 'lucide-react';

interface Props {
  matches: Match[];
}

export function StatsBar({ matches }: Props) {
  const stats = useMemo(() => {
    const countries = new Set(matches.map(m => m.competition.country));
    const competitions = new Set(matches.map(m => m.competition.name));
    const withLineups = matches.filter(m => m.lineup && (m.lineup.home.length > 0 || m.lineup.away.length > 0)).length;
    return { total: matches.length, countries: countries.size, competitions: competitions.size, withLineups };
  }, [matches]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Matches', value: stats.total, icon: <Calendar size={14} />, color: 'text-[#3fb950]' },
        { label: 'Countries', value: stats.countries, icon: <Globe size={14} />, color: 'text-[#58a6ff]' },
        { label: 'Competitions', value: stats.competitions, icon: <Trophy size={14} />, color: 'text-[#e3b341]' },
        { label: 'With Lineups', value: stats.withLineups, icon: <Users size={14} />, color: 'text-[#bc8cff]' },
      ].map(s => (
        <div key={s.label} className="bg-[#1c2128] border border-[#30363d] rounded-xl p-4">
          <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${s.color}`}>{s.icon}{s.label}</div>
          <div className="text-2xl font-bold text-[#e6edf3] font-mono">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
