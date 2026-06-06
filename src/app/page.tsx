'use client';

import { useState, useEffect, useMemo } from 'react';
import { Match } from '@/lib/types';
import { getMatches, saveMatch, updateMatch, deleteMatch, importFromLocalStorage } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { MatchCard } from '@/components/MatchCard';
import { AddMatchModal } from '@/components/AddMatchModal';
import { PlayerStatsPanel } from '@/components/PlayerStatsPanel';
import { StatsBar } from '@/components/StatsBar';
import { Plus, Search, Users, SlidersHorizontal, LogOut, Upload, Globe } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

type Tab = 'matches' | 'players';

export default function Home() {
  const { user, signOut } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (user) {
      getMatches()
        .then(setMatches)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleUpdate = async (id: string, updates: Partial<Match>) => {
    if (!user) return;
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    try {
      await updateMatch(id, updates, user.id);
    } catch (e) {
      console.error('Failed to update match', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setMatches(prev => prev.filter(m => m.id !== id));
    try {
      await deleteMatch(id);
    } catch (e) {
      console.error('Failed to delete match', e);
    }
  };

  const handleAdd = async (match: Match) => {
    if (!user) return;
    setMatches(prev => [match, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    try {
      await saveMatch(match, user.id);
    } catch (e) {
      console.error('Failed to save match', e);
    }
  };

  const handleImportLocalStorage = async () => {
    if (!user) return;
    setImporting(true);
    try {
      const stored = localStorage.getItem('football_diary_matches_v2');
      if (!stored) { alert('No local data found.'); return; }
      const localMatches: Match[] = JSON.parse(stored);
      await importFromLocalStorage(localMatches, user.id);
      const updated = await getMatches();
      setMatches(updated);
      alert(`Imported ${localMatches.length} matches successfully!`);
    } catch (e) {
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const countries = useMemo(() => Array.from(new Set(matches.map(m => m.competition.country))).sort(), [matches]);
  const years = useMemo(() => Array.from(new Set(matches.map(m => new Date(m.date).getFullYear().toString()))).sort((a, b) => parseInt(b) - parseInt(a)), [matches]);

  const sortedMatches = useMemo(() => {
    return [...matches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(m => {
        if (search) {
          const q = search.toLowerCase();
          if (![m.homeTeam.name, m.awayTeam.name, m.competition.name, m.competition.country, m.venue || ''].some(s => s.toLowerCase().includes(q))) return false;
        }
        if (filterCountry && m.competition.country !== filterCountry) return false;
        if (filterYear && new Date(m.date).getFullYear().toString() !== filterYear) return false;
        return true;
      });
  }, [matches, search, filterCountry, filterYear]);

  const groupedMatches = useMemo(() => {
    const groups: { year: string; matches: Match[] }[] = [];
    let currentYear = '';
    sortedMatches.forEach(m => {
      const year = new Date(m.date).getFullYear().toString();
      if (year !== currentYear) { groups.push({ year, matches: [] }); currentYear = year; }
      groups[groups.length - 1].matches.push(m);
    });
    return groups;
  }, [sortedMatches]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚽</span>
            <span className="font-bold text-[#e6edf3] text-base tracking-tight">Football Diary</span>
          </div>

          <nav className="flex items-center gap-1">
            {(['matches', 'players'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                  activeTab === tab ? 'bg-[#21262d] text-[#e6edf3]' : 'text-[#8b949e] hover:text-[#e6edf3]')}
              >
                {tab === 'players' ? <><Users size={14} className="inline mr-1" />Players</> : 'Matches'}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Match</span>
            </button>

            {/* User menu */}
            <div className="flex items-center gap-1">
              <span className="hidden sm:block text-xs text-[#8b949e] max-w-[120px] truncate">
                {user?.email}
              </span>
              <button
                onClick={signOut}
                title="Sign out"
                className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] rounded-lg hover:bg-[#21262d] transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#8b949e] text-sm">Loading your matches…</div>
          </div>
        ) : (
          <>
            {activeTab === 'matches' && (
              <div className="space-y-6">
                <StatsBar matches={matches} />

                {/* Import banner — show if they have no matches but have localStorage data */}
                {matches.length === 0 && (
                  <div className="bg-[#1c2128] border border-[#e3b341]/30 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#e6edf3]">Import your existing matches</p>
                      <p className="text-xs text-[#8b949e] mt-0.5">Found data from before you created an account</p>
                    </div>
                    <button
                      onClick={handleImportLocalStorage}
                      disabled={importing}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#e3b341]/20 hover:bg-[#e3b341]/30 text-[#e3b341] text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                      <Upload size={14} />
                      {importing ? 'Importing…' : 'Import'}
                    </button>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search teams, competitions, venues…"
                      className="w-full bg-[#1c2128] border border-[#30363d] rounded-lg pl-8 pr-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(v => !v)}
                    className={clsx('flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors',
                      showFilters || filterCountry || filterYear
                        ? 'border-[#58a6ff] text-[#58a6ff] bg-[#58a6ff]/10'
                        : 'border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] bg-[#1c2128]')}
                  >
                    <SlidersHorizontal size={14} />
                    Filter
                    {(filterCountry || filterYear) && (
                      <span className="text-[10px] bg-[#58a6ff] text-white rounded-full w-4 h-4 flex items-center justify-center">
                        {[filterCountry, filterYear].filter(Boolean).length}
                      </span>
                    )}
                  </button>
                </div>

                {showFilters && (
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#8b949e]">Country</label>
                      <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="bg-[#1c2128] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] focus:outline-none">
                        <option value="">All</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#8b949e]">Year</label>
                      <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="bg-[#1c2128] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] focus:outline-none">
                        <option value="">All</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    {(filterCountry || filterYear) && (
                      <button onClick={() => { setFilterCountry(''); setFilterYear(''); }} className="text-xs text-[#f85149] hover:underline">Clear</button>
                    )}
                  </div>
                )}

                <p className="text-sm text-[#8b949e]">
                  {sortedMatches.length === matches.length ? `${matches.length} matches` : `${sortedMatches.length} of ${matches.length} matches`}
                </p>

                {groupedMatches.length === 0 ? (
                  <div className="text-center py-16 text-[#8b949e]">
                    <p className="text-lg mb-2">No matches yet</p>
                    <p className="text-sm">Click Add Match to get started</p>
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
                          {yearMatches.map(match => (
                            <MatchCard key={match.id} match={match} onUpdate={handleUpdate} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'players' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-[#e6edf3] mb-1">Players Watched</h1>
                  <p className="text-sm text-[#8b949e]">Players ranked by appearances across all matches with lineup data.</p>
                </div>
                <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5">
                  <PlayerStatsPanel matches={matches} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showAddModal && <AddMatchModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
