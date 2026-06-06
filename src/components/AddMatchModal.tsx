'use client';

import { useState, useEffect, useRef } from 'react';
import { Match } from '@/lib/types';
import { X, Search, Loader2, ChevronRight, AlertCircle } from 'lucide-react';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface League {
  id: number;
  name: string;
  country: string;
  logo?: string;
}

interface Team {
  id: number;
  name: string;
  country: string;
  logo?: string;
}

interface FixtureResult {
  id: number;
  date: string;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  league: string;
  leagueId: number;
  country: string;
}

interface TeamSearchProps {
  label: string;
  value: Team | null;
  onChange: (team: Team | null) => void;
  placeholder?: string;
}

function TeamSearch({ label, value, onChange, placeholder }: TeamSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teams-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.teams || []);
        setShowDropdown(true);
      } catch { }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref}>
      <label className="block text-xs font-medium text-[#8b949e] mb-1.5">{label}</label>
      {value ? (
        <div className="flex items-center gap-2 bg-[#161b22] border border-[#3fb950]/40 rounded-lg px-3 py-2">
          {value.logo && <img src={value.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#e6edf3] font-medium truncate">{value.name}</div>
            <div className="text-xs text-[#8b949e]">{value.country}</div>
          </div>
          <button onClick={() => onChange(null)} className="text-[#8b949e] hover:text-[#f85149] flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder={placeholder || 'Search team or type name…'}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-8 pr-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
          />
          {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] animate-spin" />}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {results.map(team => (
                <button
                  key={team.id}
                  onClick={() => { onChange(team); setQuery(''); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#21262d] text-left transition-colors"
                >
                  {team.logo && <img src={team.logo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#e6edf3]">{team.name}</div>
                    <div className="text-xs text-[#8b949e]">{team.country}</div>
                  </div>
                  <span className="text-xs text-[#484f58]">#{team.id}</span>
                </button>
              ))}
              {/* Allow using typed name if not found */}
              {query.length >= 2 && (
                <button
                  onClick={() => {
                    onChange({ id: 0, name: query.trim(), country: '', logo: undefined });
                    setQuery('');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#21262d] text-left transition-colors border-t border-[#30363d]"
                >
                  <div className="text-sm text-[#8b949e]">Use "{query.trim()}" as team name</div>
                </button>
              )}
            </div>
          )}
          {showDropdown && results.length === 0 && query.length >= 2 && !loading && (
            <div className="absolute z-20 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl">
              <div className="px-3 py-2.5 text-sm text-[#8b949e]">No results found</div>
              <button
                onClick={() => {
                  onChange({ id: 0, name: query.trim(), country: '', logo: undefined });
                  setQuery('');
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#21262d] text-left transition-colors border-t border-[#30363d]"
              >
                <div className="text-sm text-[#58a6ff]">Use "{query.trim()}" as team name</div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  onAdd: (match: Match) => void;
  onClose: () => void;
}

export function AddMatchModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<'form' | 'pick-fixture'>('form');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    homeScore: '',
    awayScore: '',
    venue: '',
  });

  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team | null>(null);
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team | null>(null);

  // League search
  const [leagueQuery, setLeagueQuery] = useState('');
  const [leagueResults, setLeagueResults] = useState<League[]>([]);
  const [leagueLoading, setLeagueLoading] = useState(false);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const leagueRef = useRef<HTMLDivElement>(null);

  // Fixture search results
  const [fixtureResults, setFixtureResults] = useState<FixtureResult[]>([]);
  const [fixtureLoading, setFixtureLoading] = useState(false);
  const [fixtureError, setFixtureError] = useState('');

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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) setShowLeagueDropdown(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchFixtures = async () => {
    if (!form.date) return;
    setFixtureLoading(true);
    setFixtureError('');
    try {
      const params = new URLSearchParams({ date: form.date });
      if (selectedHomeTeam) params.set('home', selectedHomeTeam.name);
      if (selectedAwayTeam) params.set('away', selectedAwayTeam.name);
      const res = await fetch(`/api/fixture-search?${params}`);
      const data = await res.json();
      if (data.fixtures?.length === 0) {
        setFixtureError('No fixtures found for this date and teams. You can still save manually below.');
      } else {
        setFixtureResults(data.fixtures || []);
        setStep('pick-fixture');
      }
    } catch {
      setFixtureError('Search failed. Save manually instead.');
    } finally {
      setFixtureLoading(false);
    }
  };

  const selectFixture = (fixture: FixtureResult) => {
    const match: Match = {
      id: genId(),
      date: form.date,
      homeTeam: {
        name: fixture.homeTeam,
        apiId: fixture.homeTeamId || selectedHomeTeam?.id || undefined,
      },
      awayTeam: {
        name: fixture.awayTeam,
        apiId: fixture.awayTeamId || selectedAwayTeam?.id || undefined,
      },
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      competition: {
        name: fixture.league,
        country: fixture.country,
        leagueId: fixture.leagueId,
      },
      venue: fixture.venue || form.venue.trim() || undefined,
      isManual: false,
      apiFixtureId: fixture.id,
    };
    onAdd(match);
    onClose();
  };

  const saveManually = () => {
    const match: Match = {
      id: genId(),
      date: form.date,
      homeTeam: {
        name: selectedHomeTeam?.name || 'Home Team',
        apiId: selectedHomeTeam?.id || undefined,
      },
      awayTeam: {
        name: selectedAwayTeam?.name || 'Away Team',
        apiId: selectedAwayTeam?.id || undefined,
      },
      homeScore: form.homeScore !== '' ? parseInt(form.homeScore) : undefined,
      awayScore: form.awayScore !== '' ? parseInt(form.awayScore) : undefined,
      competition: selectedLeague
        ? { name: selectedLeague.name, country: selectedLeague.country, leagueId: selectedLeague.id }
        : { name: 'Unknown', country: 'Unknown' },
      venue: form.venue.trim() || undefined,
      isManual: true,
    };
    onAdd(match);
    onClose();
  };

  if (step === 'pick-fixture') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
            <div>
              <h2 className="font-semibold text-[#e6edf3]">Select the correct match</h2>
              <p className="text-xs text-[#8b949e] mt-0.5">{fixtureResults.length} fixture{fixtureResults.length !== 1 ? 's' : ''} found on {form.date}</p>
            </div>
            <button onClick={() => setStep('form')} className="text-[#8b949e] hover:text-[#e6edf3]">
              <X size={18} />
            </button>
          </div>

          <div className="p-3 space-y-2">
            {fixtureResults.map(fixture => (
              <button
                key={fixture.id}
                onClick={() => selectFixture(fixture)}
                className="w-full flex items-center gap-3 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-xl p-3 text-left transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#e6edf3]">{fixture.homeTeam}</span>
                    {fixture.homeScore !== undefined && (
                      <span className="text-xs font-mono text-[#3fb950] bg-[#3fb950]/10 px-1.5 rounded">
                        {fixture.homeScore}–{fixture.awayScore}
                      </span>
                    )}
                    <span className="text-xs text-[#484f58]">vs</span>
                    <span className="text-sm font-medium text-[#e6edf3]">{fixture.awayTeam}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#8b949e]">{fixture.league}</span>
                    <span className="text-[10px] text-[#484f58]">·</span>
                    <span className="text-xs text-[#484f58]">{fixture.country}</span>
                    {fixture.venue && (
                      <>
                        <span className="text-[10px] text-[#484f58]">·</span>
                        <span className="text-xs text-[#484f58] truncate">{fixture.venue}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#484f58] group-hover:text-[#e6edf3] flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-[#30363d]">
            <p className="text-xs text-[#8b949e] mb-3">Can't find the right match?</p>
            <button
              onClick={saveManually}
              className="w-full py-2 border border-[#30363d] hover:border-[#484f58] text-sm text-[#8b949e] hover:text-[#e6edf3] rounded-lg transition-colors"
            >
              Save manually without fixture data
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <TeamSearch label="Home Team" value={selectedHomeTeam} onChange={setSelectedHomeTeam} placeholder="Search or type team name…" />
          <TeamSearch label="Away Team" value={selectedAwayTeam} onChange={setSelectedAwayTeam} placeholder="Search or type team name…" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Score</label>
              <input type="number" min="0" value={form.homeScore} onChange={e => setForm({ ...form, homeScore: e.target.value })} placeholder="–" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Score</label>
              <input type="number" min="0" value={form.awayScore} onChange={e => setForm({ ...form, awayScore: e.target.value })} placeholder="–" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]" />
            </div>
          </div>

          {/* Competition — optional */}
          <div ref={leagueRef}>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
              Competition <span className="text-[#484f58] font-normal">(optional — can be matched from fixture)</span>
            </label>
            {selectedLeague ? (
              <div className="flex items-center gap-2 bg-[#161b22] border border-[#3fb950]/40 rounded-lg px-3 py-2">
                {selectedLeague.logo && <img src={selectedLeague.logo} alt="" className="w-5 h-5 object-contain" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#e6edf3] font-medium">{selectedLeague.name}</div>
                  <div className="text-xs text-[#8b949e]">{selectedLeague.country}</div>
                </div>
                <button onClick={() => { setSelectedLeague(null); setLeagueQuery(''); }} className="text-[#8b949e] hover:text-[#f85149]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
                <input
                  value={leagueQuery}
                  onChange={e => setLeagueQuery(e.target.value)}
                  onFocus={() => leagueResults.length > 0 && setShowLeagueDropdown(true)}
                  placeholder="Search competition…"
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-8 pr-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
                />
                {leagueLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] animate-spin" />}
                {showLeagueDropdown && leagueResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {leagueResults.map(league => (
                      <button key={league.id} onClick={() => { setSelectedLeague(league); setLeagueQuery(''); setShowLeagueDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#21262d] text-left transition-colors">
                        {league.logo && <img src={league.logo} alt="" className="w-6 h-6 object-contain flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#e6edf3]">{league.name}</div>
                          <div className="text-xs text-[#8b949e]">{league.country}</div>
                        </div>
                        <span className="text-xs text-[#484f58]">#{league.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Venue</label>
            <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Stadium name, City" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]" />
          </div>

          {fixtureError && (
            <div className="flex items-start gap-2 text-xs text-[#e3b341] bg-[#e3b341]/10 border border-[#e3b341]/20 rounded-lg px-3 py-2">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              {fixtureError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-[#30363d]">
          <p className="text-xs text-[#484f58]">* Required</p>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3]">Cancel</button>
            <button
              onClick={saveManually}
              disabled={!form.date}
              className="px-4 py-2 border border-[#30363d] hover:border-[#484f58] disabled:opacity-40 text-sm text-[#8b949e] hover:text-[#e6edf3] rounded-lg transition-colors"
            >
              Save manually
            </button>
            <button
              onClick={searchFixtures}
              disabled={fixtureLoading || !form.date}
              className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {fixtureLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Find match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
