'use client';

import { useState, useEffect, useRef } from 'react';
import { Match } from '@/lib/types';
import { X, Search, Loader2, ChevronDown } from 'lucide-react';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface League {
  id: number;
  name: string;
  country: string;
  logo?: string;
  seasons?: number[];
}

interface Props {
  onAdd: (match: Match) => void;
  onClose: () => void;
}

export function AddMatchModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    homeTeamName: '',
    awayTeamName: '',
    homeScore: '',
    awayScore: '',
    venue: '',
  });

  // League search
  const [leagueQuery, setLeagueQuery] = useState('');
  const [leagueResults, setLeagueResults] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [leagueLoading, setLeagueLoading] = useState(false);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const leagueRef = useRef<HTMLDivElement>(null);

  // Debounced league search
  useEffect(() => {
    if (leagueQuery.length < 2) { setLeagueResults([]); return; }
    const timer = setTimeout(async () => {
      setLeagueLoading(true);
      try {
        const res = await fetch(`/api/leagues-search?q=${encodeURIComponent(leagueQuery)}`);
        const data = await res.json();
        setLeagueResults(data.leagues || []);
        setShowLeagueDropdown(true);
      } catch { }
      finally { setLeagueLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [leagueQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) {
        setShowLeagueDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isValid = form.homeTeamName.trim() && form.awayTeamName.trim() && form.date && selectedLeague;

  const handleAdd = () => {
    if (!isValid) return;
    const match: Match = {
      id: genId(),
      date: form.date,
      homeTeam: { name: form.homeTeamName.trim() },
      awayTeam: { name: form.awayTeamName.trim() },
      homeScore: form.homeScore !== '' ? parseInt(form.homeScore) : undefined,
      awayScore: form.awayScore !== '' ? parseInt(form.awayScore) : undefined,
      competition: {
        name: selectedLeague!.name,
        country: selectedLeague!.country,
        leagueId: selectedLeague!.id,
      },
      venue: form.venue.trim() || undefined,
      isManual: false,
    };
    onAdd(match);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="font-semibold text-[#e6edf3]">Add Match</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Team *</label>
              <input
                value={form.homeTeamName}
                onChange={(e) => setForm({ ...form, homeTeamName: e.target.value })}
                placeholder="e.g. Exeter City"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Team *</label>
              <input
                value={form.awayTeamName}
                onChange={(e) => setForm({ ...form, awayTeamName: e.target.value })}
                placeholder="e.g. Liverpool"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Score</label>
              <input
                type="number" min="0"
                value={form.homeScore}
                onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
                placeholder="–"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Score</label>
              <input
                type="number" min="0"
                value={form.awayScore}
                onChange={(e) => setForm({ ...form, awayScore: e.target.value })}
                placeholder="–"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
          </div>

          {/* Competition search */}
          <div ref={leagueRef}>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Competition *</label>
            {selectedLeague ? (
              <div className="flex items-center gap-2 bg-[#161b22] border border-[#3fb950]/40 rounded-lg px-3 py-2">
                {selectedLeague.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedLeague.logo} alt="" className="w-5 h-5 object-contain" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#e6edf3] font-medium">{selectedLeague.name}</div>
                  <div className="text-xs text-[#8b949e]">{selectedLeague.country}</div>
                </div>
                <button
                  onClick={() => { setSelectedLeague(null); setLeagueQuery(''); }}
                  className="text-[#8b949e] hover:text-[#f85149]"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
                <input
                  value={leagueQuery}
                  onChange={(e) => setLeagueQuery(e.target.value)}
                  onFocus={() => leagueResults.length > 0 && setShowLeagueDropdown(true)}
                  placeholder="Search competition (e.g. Premier League, La Liga)…"
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-8 pr-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
                />
                {leagueLoading && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] animate-spin" />
                )}
                {showLeagueDropdown && leagueResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    {leagueResults.map((league) => (
                      <button
                        key={league.id}
                        onClick={() => {
                          setSelectedLeague(league);
                          setLeagueQuery('');
                          setShowLeagueDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#21262d] text-left transition-colors"
                      >
                        {league.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={league.logo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#e6edf3]">{league.name}</div>
                          <div className="text-xs text-[#8b949e]">{league.country}</div>
                        </div>
                        <span className="text-xs text-[#484f58]">#{league.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showLeagueDropdown && leagueResults.length === 0 && leagueQuery.length >= 2 && !leagueLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg px-3 py-3 text-sm text-[#8b949e]">
                    No competitions found for "{leagueQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Venue</label>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="Stadium name, City"
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-[#30363d]">
          <p className="text-xs text-[#484f58]">* Required fields</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3]">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!isValid}
              className="px-5 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
