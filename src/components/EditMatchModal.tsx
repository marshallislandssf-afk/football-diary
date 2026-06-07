'use client';

import { useState, useEffect, useRef } from 'react';
import { Match, Annotation, Player, Lineup } from '@/lib/types';
import { X, Plus, Trash2, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface SearchedPlayer {
  id: number;
  name: string;
  nationality?: string;
  photo?: string;
  position?: string;
  team?: string;
}

interface PlayerSearchInputProps {
  onSelect: (player: SearchedPlayer) => void;
  season: string;
  placeholder?: string;
}

function PlayerSearchInput({ onSelect, season, placeholder }: PlayerSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/players-search?q=${encodeURIComponent(query)}&season=${season}`);
        const data = await res.json();
        setResults(data.players || []);
        setShow(true);
      } catch { }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, season]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShow(true)}
          placeholder={placeholder || 'Search player...'}
          className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
        />
        {loading && <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] animate-spin" />}
      </div>
      {show && results.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setQuery(''); setShow(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#21262d] text-left transition-colors"
            >
              {p.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt={p.name} className="w-7 h-7 rounded-full object-cover bg-[#30363d] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#e6edf3] truncate">{p.name}</div>
                <div className="text-[10px] text-[#8b949e] truncate">{[p.position, p.team, p.nationality].filter(Boolean).join(' · ')}</div>
              </div>
            </button>
          ))}
          {/* Allow typing name manually */}
          <button
            onClick={() => {
              onSelect({ id: 0, name: query.trim() });
              setQuery('');
              setShow(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#21262d] text-left border-t border-[#30363d]"
          >
            <div className="text-xs text-[#58a6ff]">Add "{query.trim()}" manually</div>
          </button>
        </div>
      )}
      {show && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-30 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl">
          <div className="px-3 py-2 text-xs text-[#8b949e]">No players found</div>
          <button
            onClick={() => { onSelect({ id: 0, name: query.trim() }); setQuery(''); setShow(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#21262d] text-left border-t border-[#30363d]"
          >
            <div className="text-xs text-[#58a6ff]">Add "{query.trim()}" manually</div>
          </button>
        </div>
      )}
    </div>
  );
}

const POSITIONS = ['G', 'D', 'M', 'F', 'SUB'];

function PlayerItem({ player, onRemove, onPositionChange }: {
  player: Player;
  onRemove: () => void;
  onPositionChange: (pos: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const photo = player.id ? `https://media.api-sports.io/football/players/${player.id}.png` : null;

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#21262d] last:border-0">
      {photo && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={player.name} className="w-6 h-6 rounded-full object-cover bg-[#30363d] flex-shrink-0" onError={() => setImgError(true)} />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#30363d] flex-shrink-0" />
      )}
      <span className="flex-1 text-xs text-[#e6edf3] truncate">{player.name}</span>
      <select
        value={player.position || ''}
        onChange={e => onPositionChange(e.target.value)}
        className="bg-[#21262d] border border-[#30363d] rounded text-[10px] text-[#8b949e] px-1 py-0.5 focus:outline-none"
      >
        <option value="">Pos</option>
        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <button onClick={onRemove} className="text-[#484f58] hover:text-[#f85149] flex-shrink-0">
        <X size={11} />
      </button>
    </div>
  );
}

function TeamLineupEditor({ teamName, teamApiId, players, onPlayersChange, season }: {
  teamName: string;
  teamApiId?: number;
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  season: string;
}) {
  const starters = players.filter(p => p.isStarter);
  const subs = players.filter(p => !p.isStarter);
  const [showSubs, setShowSubs] = useState(true);
  const [squad, setSquad] = useState<SearchedPlayer[]>([]);
  const [squadLoading, setSquadLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Load squad on mount if we have a team ID
  useEffect(() => {
    if (!teamApiId) return;
    setSquadLoading(true);
    fetch(`/api/players-search?teamId=${teamApiId}&season=${season}`)
      .then(r => r.json())
      .then(d => setSquad(d.players || []))
      .catch(() => {})
      .finally(() => setSquadLoading(false));
  }, [teamApiId, season]);

  const filteredSquad = query.length >= 1
    ? squad.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : squad;

  const addPlayer = (searched: SearchedPlayer, role: 'starter' | 'sub' | 'unused') => {
    if (players.find(p => p.id === searched.id || p.name === searched.name)) return;
    const newPlayer: Player = {
      id: searched.id || undefined,
      name: searched.name,
      position: searched.position || (role === 'starter' ? undefined : 'SUB'),
      isStarter: role === 'starter',
      cameOn: role === 'sub',
      unusedSub: role === 'unused',
    };
    onPlayersChange([...players, newPlayer]);
  };

  const removePlayer = (player: Player) => {
    onPlayersChange(players.filter(p => p !== player));
  };

  const updatePosition = (player: Player, pos: string) => {
    onPlayersChange(players.map(p => p === player ? { ...p, position: pos } : p));
  };

  const isAdded = (p: SearchedPlayer) => players.some(pl => pl.id === p.id || pl.name === p.name);

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 truncate">{teamName}</h4>

      {/* Squad picker */}
      {teamApiId ? (
        <div className="mb-3">
          <div className="relative mb-1.5">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={squadLoading ? 'Loading squad...' : 'Filter squad...'}
              disabled={squadLoading}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58] disabled:opacity-50"
            />
          </div>
          {filteredSquad.length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-h-36 overflow-y-auto mb-2">
              {filteredSquad.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 border-b border-[#21262d] last:border-0">
                  {p.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover bg-[#30363d] flex-shrink-0" />
                  )}
                  <span className="flex-1 text-xs text-[#e6edf3] truncate">{p.name}</span>
                  {p.position && <span className="text-[10px] text-[#484f58]">{p.position}</span>}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => addPlayer(p, 'starter')}
                      disabled={isAdded(p)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] hover:bg-[#238636]/40 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ST
                    </button>
                    <button
                      onClick={() => addPlayer(p, 'sub')}
                      disabled={isAdded(p)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      SUB
                    </button>
                    <button
                      onClick={() => addPlayer(p, 'unused')}
                      disabled={isAdded(p)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-[#484f58] hover:bg-[#484f58]/40 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      N/P
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <PlayerSearchInput onSelect={p => addPlayer(p, false)} season={season} placeholder="Search player to add..." />
          <p className="text-[10px] text-[#484f58] mt-1">No team ID — searching all leagues</p>
        </div>
      )}

      {/* Selected starters */}
      {starters.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-[#484f58] uppercase tracking-wider mb-1">Starters ({starters.length})</div>
          {starters.map((p, i) => (
            <PlayerItem key={p.id || `${p.name}-${i}`} player={p} onRemove={() => removePlayer(p)} onPositionChange={pos => updatePosition(p, pos)} />
          ))}
        </div>
      )}

      {/* Selected subs */}
      {subs.length > 0 && (
        <div>
          <button onClick={() => setShowSubs(v => !v)} className="flex items-center gap-1 text-[10px] text-[#484f58] uppercase tracking-wider mb-1 hover:text-[#8b949e]">
            {showSubs ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            Subs ({subs.length})
          </button>
          {showSubs && subs.map((p, i) => (
            <PlayerItem key={p.id || `${p.name}-sub-${i}`} player={p} onRemove={() => removePlayer(p)} onPositionChange={pos => updatePosition(p, pos)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  match: Match;
  onSave: (updates: Partial<Match>) => void;
  onClose: () => void;
}

const ANNOTATION_TYPES = ['special', 'promotion', 'milestone', 'goal', 'custom'] as const;

export function EditMatchModal({ match, onSave, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'annotations'>('details');

  const [form, setForm] = useState({
    date: match.date.split('T')[0],
    homeTeamName: match.homeTeam.name,
    awayTeamName: match.awayTeam.name,
    homeScore: match.homeScore?.toString() ?? '',
    awayScore: match.awayScore?.toString() ?? '',
    competition: match.competition.name,
    country: match.competition.country,
    venue: match.venue ?? '',
  });

  const [annotations, setAnnotations] = useState<Annotation[]>(match.annotations || []);
  const [newAnnotation, setNewAnnotation] = useState({ type: 'special' as Annotation['type'], text: '', emoji: '' });

  const [homePlayers, setHomePlayers] = useState<Player[]>(match.lineup?.home || []);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>(match.lineup?.away || []);

  // Season derived from match date
  const matchYear = parseInt(form.date.slice(0, 4));
  const matchMonth = parseInt(form.date.slice(5, 7));
  const season = (matchMonth >= 7 ? matchYear : matchYear - 1).toString();

  const handleSave = () => {
    const lineup: Lineup | undefined = (homePlayers.length > 0 || awayPlayers.length > 0)
      ? { home: homePlayers, away: awayPlayers }
      : match.lineup;

    onSave({
      date: form.date,
      homeTeam: { ...match.homeTeam, name: form.homeTeamName },
      awayTeam: { ...match.awayTeam, name: form.awayTeamName },
      homeScore: form.homeScore !== '' ? parseInt(form.homeScore) : undefined,
      awayScore: form.awayScore !== '' ? parseInt(form.awayScore) : undefined,
      competition: { ...match.competition, name: form.competition, country: form.country },
      venue: form.venue || undefined,
      annotations,
      lineup,
    });
  };

  const addAnnotation = () => {
    if (!newAnnotation.text.trim()) return;
    setAnnotations(prev => [...prev, { id: genId(), type: newAnnotation.type, text: newAnnotation.text.trim(), emoji: newAnnotation.emoji || undefined }]);
    setNewAnnotation({ type: 'special', text: '', emoji: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="font-semibold text-[#e6edf3]">Edit Match</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#30363d] px-5">
          {(['details', 'lineup', 'annotations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ' +
                (activeTab === tab ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
            >
              {tab === 'lineup' ? 'Lineup' : tab === 'annotations' ? 'Annotations' : 'Details'}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Details tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Team</label>
                  <input value={form.homeTeamName} onChange={e => setForm({ ...form, homeTeamName: e.target.value })} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Team</label>
                  <input value={form.awayTeamName} onChange={e => setForm({ ...form, awayTeamName: e.target.value })} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Score</label>
                  <input type="number" min="0" value={form.homeScore} onChange={e => setForm({ ...form, homeScore: e.target.value })} placeholder="-" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Score</label>
                  <input type="number" min="0" value={form.awayScore} onChange={e => setForm({ ...form, awayScore: e.target.value })} placeholder="-" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Competition</label>
                  <input value={form.competition} onChange={e => setForm({ ...form, competition: e.target.value })} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Country</label>
                  <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Venue</label>
                <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Stadium name, City" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]" />
              </div>
            </div>
          )}

          {/* Lineup tab */}
          {activeTab === 'lineup' && (
            <div>
              <p className="text-xs text-[#8b949e] mb-4">
                Search for players by name. Player photos and IDs will be stored automatically for accurate stats tracking.
              </p>
              <div className="flex gap-4">
                <TeamLineupEditor
                  teamName={form.homeTeamName}
                  teamApiId={match.homeTeam.apiId}
                  players={homePlayers}
                  onPlayersChange={setHomePlayers}
                  season={season}
                />
                <div className="w-px bg-[#30363d]" />
                <TeamLineupEditor
                  teamName={form.awayTeamName}
                  teamApiId={match.awayTeam.apiId}
                  players={awayPlayers}
                  onPlayersChange={setAwayPlayers}
                  season={season}
                />
              </div>
            </div>
          )}

          {/* Annotations tab */}
          {activeTab === 'annotations' && (
            <div className="space-y-3">
              {annotations.length > 0 && (
                <div className="space-y-2">
                  {annotations.map(a => (
                    <div key={a.id} className="flex items-start gap-2 bg-[#161b22] rounded-lg p-2.5">
                      {a.emoji && <span>{a.emoji}</span>}
                      <span className="flex-1 text-xs text-[#e6edf3]">{a.text}</span>
                      <span className="text-[10px] text-[#8b949e] capitalize mr-1">{a.type}</span>
                      <button onClick={() => setAnnotations(prev => prev.filter(x => x.id !== a.id))} className="text-[#484f58] hover:text-[#f85149]"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-[#161b22] rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <select value={newAnnotation.type} onChange={e => setNewAnnotation({ ...newAnnotation, type: e.target.value as Annotation['type'] })} className="bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none">
                    {ANNOTATION_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                  <input value={newAnnotation.emoji} onChange={e => setNewAnnotation({ ...newAnnotation, emoji: e.target.value })} placeholder="Emoji" className="w-16 bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <input value={newAnnotation.text} onChange={e => setNewAnnotation({ ...newAnnotation, text: e.target.value })} placeholder="Annotation text..." className="flex-1 bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]" onKeyDown={e => e.key === 'Enter' && addAnnotation()} />
                  <button onClick={addAnnotation} disabled={!newAnnotation.text.trim()} className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"><Plus size={14} /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#30363d]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-lg transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
