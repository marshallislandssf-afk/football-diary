'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Match, Annotation, Player, Lineup, MatchEvent } from '@/lib/types';
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
      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" />
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShow(true)}
        placeholder={placeholder || 'Search player...'}
        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
      />
      {loading && <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] animate-spin" />}
      {show && results.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {results.map(p => (
            <button key={p.id} onClick={() => { onSelect(p); setQuery(''); setShow(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#21262d] text-left transition-colors">
              {p.photo && <img src={p.photo} alt={p.name} className="w-7 h-7 rounded-full object-cover bg-[#30363d] flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#e6edf3] truncate">{p.name}</div>
                <div className="text-[10px] text-[#8b949e] truncate">{[p.position, p.team, p.nationality].filter(Boolean).join(' · ')}</div>
              </div>
            </button>
          ))}
          <button onClick={() => { onSelect({ id: 0, name: query.trim() }); setQuery(''); setShow(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#21262d] text-left border-t border-[#30363d]">
            <div className="text-xs text-[#58a6ff]">Add "{query.trim()}" manually</div>
          </button>
        </div>
      )}
      {show && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-30 w-full mt-1 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-xl">
          <div className="px-3 py-2 text-xs text-[#8b949e]">No players found</div>
          <button onClick={() => { onSelect({ id: 0, name: query.trim() }); setQuery(''); setShow(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#21262d] text-left border-t border-[#30363d]">
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
        <img src={photo} alt={player.name} className="w-6 h-6 rounded-full object-cover bg-[#30363d] flex-shrink-0" onError={() => setImgError(true)} />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#30363d] flex-shrink-0" />
      )}
      <span className="flex-1 text-xs text-[#e6edf3] truncate">{player.name}</span>
      <select value={player.position || ''} onChange={e => onPositionChange(e.target.value)} className="bg-[#21262d] border border-[#30363d] rounded text-[10px] text-[#8b949e] px-1 py-0.5 focus:outline-none">
        <option value="">Pos</option>
        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <button onClick={onRemove} className="text-[#484f58] hover:text-[#f85149] flex-shrink-0"><X size={11} /></button>
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
    ? squad.filter(p => p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
        query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      ))
    : squad;

  const addPlayer = (searched: SearchedPlayer, role: 'starter' | 'sub' | 'unused') => {
    if (players.find(p => p.id && p.id === searched.id)) return;
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

  const removePlayer = (player: Player) => onPlayersChange(players.filter(p => p !== player));
  const updatePosition = (player: Player, pos: string) => onPlayersChange(players.map(p => p === player ? { ...p, position: pos } : p));
  const isAdded = (p: SearchedPlayer) => players.some(pl => (pl.id && pl.id === p.id) || pl.name === p.name);

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 truncate">{teamName}</h4>

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
                  {p.photo && <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover bg-[#30363d] flex-shrink-0" />}
                  <span className="flex-1 text-xs text-[#e6edf3] truncate">{p.name}</span>
                  {p.position && <span className="text-[10px] text-[#484f58]">{p.position}</span>}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => addPlayer(p, 'starter')} disabled={isAdded(p)} className="text-[10px] px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] hover:bg-[#238636]/40 disabled:opacity-30 disabled:cursor-not-allowed">ST</button>
                    <button onClick={() => addPlayer(p, 'sub')} disabled={isAdded(p)} className="text-[10px] px-1.5 py-0.5 rounded bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40 disabled:opacity-30 disabled:cursor-not-allowed">SUB</button>
                    <button onClick={() => addPlayer(p, 'unused')} disabled={isAdded(p)} className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-[#484f58] hover:bg-[#484f58]/40 disabled:opacity-30 disabled:cursor-not-allowed">N/P</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <PlayerSearchInput onSelect={p => addPlayer(p, 'starter')} season={season} placeholder="Search player to add..." />
        </div>
      )}

      {starters.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-[#484f58] uppercase tracking-wider mb-1">Starters ({starters.length})</div>
          {starters.map((p, i) => <PlayerItem key={p.id || `${p.name}-${i}`} player={p} onRemove={() => removePlayer(p)} onPositionChange={pos => updatePosition(p, pos)} />)}
        </div>
      )}

      {subs.length > 0 && (
        <div>
          <button onClick={() => setShowSubs(v => !v)} className="flex items-center gap-1 text-[10px] text-[#484f58] uppercase tracking-wider mb-1 hover:text-[#8b949e]">
            {showSubs ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            Subs ({subs.length})
          </button>
          {showSubs && subs.map((p, i) => <PlayerItem key={p.id || `${p.name}-sub-${i}`} player={p} onRemove={() => removePlayer(p)} onPositionChange={pos => updatePosition(p, pos)} />)}
        </div>
      )}
    </div>
  );
}

function getEventLabel(type: string, detail: string): string {
  if (type === 'Goal') {
    if (detail === 'Missed Penalty') return 'Missed Pen';
    if (detail === 'Penalty') return 'Pen';
    if (detail === 'Own Goal') return 'OG';
    return 'Goal';
  }
  if (type === 'Card') return detail.replace(' Card', '');
  return type;
}

function getEventColor(type: string, detail: string): string {
  if (type === 'Goal' && detail === 'Missed Penalty') return 'text-[#f85149]';
  if (type === 'Goal') return 'text-[#3fb950]';
  if (type === 'Card' && detail === 'Red Card') return 'text-[#f85149]';
  if (type === 'Card') return 'text-[#e3b341]';
  return 'text-[#8b949e]';
}

interface EventsEditorProps {
  events: MatchEvent[];
  onEventsChange: (events: MatchEvent[]) => void;
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
}

function EventsEditor({ events, onEventsChange, homePlayers, awayPlayers, homeTeamName, awayTeamName }: EventsEditorProps) {
  const allPlayers = useMemo(() => [...homePlayers, ...awayPlayers], [homePlayers, awayPlayers]);

  const [newEvent, setNewEvent] = useState({
    type: 'Goal' as 'Goal' | 'Card',
    team: homeTeamName,
    playerName: '',
    assistName: '',
    minute: '',
    extra: '',
    detail: 'Normal Goal',
    period: 'normal' as 'normal' | 'extra' | 'shootout',
  });

  const teamPlayers = useMemo(() =>
    newEvent.team === homeTeamName ? homePlayers : awayPlayers,
    [newEvent.team, homePlayers, awayPlayers, homeTeamName]
  );

  const GOAL_DETAILS = ['Normal Goal', 'Penalty', 'Own Goal', 'Missed Penalty'];
  const CARD_DETAILS = ['Yellow Card', 'Red Card', 'Second Yellow Card'];

  const handleTypeChange = (type: 'Goal' | 'Card') => {
    setNewEvent(e => ({
      ...e,
      type,
      detail: type === 'Goal' ? 'Normal Goal' : 'Yellow Card',
    }));
  };

  const addEvent = () => {
    if (!newEvent.playerName || !newEvent.minute) return;
    const player = allPlayers.find(p => p.name === newEvent.playerName);
    const assistPlayer = newEvent.assistName ? allPlayers.find(p => p.name === newEvent.assistName) : undefined;

    const event: MatchEvent = {
      minute: parseInt(newEvent.minute),
      extra: newEvent.extra ? parseInt(newEvent.extra) : undefined,
      team: newEvent.team,
      player: newEvent.playerName,
      playerId: player?.id,
      assist: newEvent.assistName || undefined,
      assistId: assistPlayer?.id,
      type: newEvent.type,
      detail: newEvent.detail,
      comments: newEvent.period === 'shootout' ? 'Penalty Shootout' : undefined,
    };

    onEventsChange([...events, event].sort((a, b) => {
      const aMin = a.minute + (a.extra || 0) / 100;
      const bMin = b.minute + (b.extra || 0) / 100;
      return aMin - bMin;
    }));

    setNewEvent(e => ({ ...e, playerName: '', assistName: '', minute: '', extra: '' }));
  };

  const removeEvent = (index: number) => {
    onEventsChange(events.filter((_, i) => i !== index));
  };

  // Group events for display
  const regularEvents = events.filter(e => !e.comments?.includes('Penalty Shootout') && e.minute <= 90);
  const extraEvents = events.filter(e => !e.comments?.includes('Penalty Shootout') && e.minute > 90);
  const shootoutEvents = events.filter(e => e.comments?.includes('Penalty Shootout'));

  const renderEvent = (e: MatchEvent, index: number) => {
    const minuteStr = e.extra ? `${e.minute}+${e.extra}'` : `${e.minute}'`;
    const isHome = e.team === homeTeamName;
    return (
      <div key={index} className={`flex items-center gap-2 py-1.5 border-b border-[#21262d] last:border-0 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
        <span className="text-[11px] font-mono text-[#484f58] w-10 text-center flex-shrink-0">{minuteStr}</span>
        <span className={`text-[10px] font-bold flex-shrink-0 ${getEventColor(e.type, e.detail)}`}>{getEventLabel(e.type, e.detail)}</span>
        <span className={`text-xs flex-1 ${isHome ? 'text-left' : 'text-right'} text-[#e6edf3] truncate`}>
          {e.player}
          {e.assist && e.type === 'Goal' && <span className="text-[#8b949e] ml-1">({e.assist})</span>}
        </span>
        <button onClick={() => removeEvent(index)} className="text-[#484f58] hover:text-[#f85149] flex-shrink-0"><Trash2 size={11} /></button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Existing events */}
      {events.length > 0 && (
        <div className="bg-[#161b22] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider">{homeTeamName}</span>
            <span className="text-[10px] font-medium text-[#484f58] uppercase tracking-wider">{awayTeamName}</span>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#21262d] -translate-x-1/2" />
            {regularEvents.map((e, i) => renderEvent(e, events.indexOf(e)))}
            {extraEvents.length > 0 && (
              <div>
                <div className="text-[10px] text-center text-[#484f58] my-1 uppercase tracking-wider">Extra Time</div>
                {extraEvents.map(e => renderEvent(e, events.indexOf(e)))}
              </div>
            )}
            {shootoutEvents.length > 0 && (
              <div>
                <div className="text-[10px] text-center text-[#484f58] my-1 uppercase tracking-wider">Penalty Shootout</div>
                {shootoutEvents.map(e => renderEvent(e, events.indexOf(e)))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add event form */}
      <div className="bg-[#161b22] rounded-lg p-3 space-y-3">
        <div className="text-xs font-medium text-[#8b949e]">Add event</div>

        {/* Type toggle */}
        <div className="flex gap-2">
          {(['Goal', 'Card'] as const).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${newEvent.type === t ? 'bg-[#238636] text-white' : 'bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Team */}
          <div>
            <label className="block text-[10px] text-[#484f58] mb-1">Team</label>
            <select
              value={newEvent.team}
              onChange={e => setNewEvent(ev => ({ ...ev, team: e.target.value, playerName: '', assistName: '' }))}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
            >
              <option value={homeTeamName}>{homeTeamName}</option>
              <option value={awayTeamName}>{awayTeamName}</option>
            </select>
          </div>

          {/* Detail */}
          <div>
            <label className="block text-[10px] text-[#484f58] mb-1">Detail</label>
            <select
              value={newEvent.detail}
              onChange={e => setNewEvent(ev => ({ ...ev, detail: e.target.value }))}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
            >
              {(newEvent.type === 'Goal' ? GOAL_DETAILS : CARD_DETAILS).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Player */}
        <div>
          <label className="block text-[10px] text-[#484f58] mb-1">Player *</label>
          {teamPlayers.filter(p => !p.unusedSub).length > 0 ? (
            <select
              value={newEvent.playerName}
              onChange={e => setNewEvent(ev => ({ ...ev, playerName: e.target.value }))}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
            >
              <option value="">Select player...</option>
              {teamPlayers.filter(p => !p.unusedSub).map(p => (
                <option key={p.id || p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          ) : (
            <input
              value={newEvent.playerName}
              onChange={e => setNewEvent(ev => ({ ...ev, playerName: e.target.value }))}
              placeholder="Player name..."
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none placeholder-[#484f58]"
            />
          )}
        </div>

        {/* Assist — only for goals */}
        {newEvent.type === 'Goal' && newEvent.detail !== 'Missed Penalty' && newEvent.detail !== 'Own Goal' && (
          <div>
            <label className="block text-[10px] text-[#484f58] mb-1">Assist (optional)</label>
            {teamPlayers.filter(p => !p.unusedSub).length > 0 ? (
              <select
                value={newEvent.assistName}
                onChange={e => setNewEvent(ev => ({ ...ev, assistName: e.target.value }))}
                className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
              >
                <option value="">No assist</option>
                {teamPlayers.filter(p => !p.unusedSub && p.name !== newEvent.playerName).map(p => (
                  <option key={p.id || p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={newEvent.assistName}
                onChange={e => setNewEvent(ev => ({ ...ev, assistName: e.target.value }))}
                placeholder="Assist player name..."
                className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none placeholder-[#484f58]"
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {/* Minute */}
          <div>
            <label className="block text-[10px] text-[#484f58] mb-1">Minute *</label>
            <input
              type="number"
              min="1"
              max="130"
              value={newEvent.minute}
              onChange={e => setNewEvent(ev => ({ ...ev, minute: e.target.value }))}
              placeholder="90"
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none placeholder-[#484f58]"
            />
          </div>

          {/* Extra time */}
          <div>
            <label className="block text-[10px] text-[#484f58] mb-1">+Extra</label>
            <input
              type="number"
              min="0"
              value={newEvent.extra}
              onChange={e => setNewEvent(ev => ({ ...ev, extra: e.target.value }))}
              placeholder="0"
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none placeholder-[#484f58]"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-[10px] text-[#484f58] mb-1">Period</label>
            <select
              value={newEvent.period}
              onChange={e => setNewEvent(ev => ({ ...ev, period: e.target.value as any }))}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
            >
              <option value="normal">Normal</option>
              <option value="extra">Extra Time</option>
              <option value="shootout">Shootout</option>
            </select>
          </div>
        </div>

        <button
          onClick={addEvent}
          disabled={!newEvent.playerName || !newEvent.minute}
          className="w-full py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={13} />
          Add event
        </button>
      </div>
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
  const [activeTab, setActiveTab] = useState<'details' | 'lineup' | 'events' | 'annotations'>('details');

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
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);

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
      events,
    });
  };

  const addAnnotation = () => {
    if (!newAnnotation.text.trim()) return;
    setAnnotations(prev => [...prev, { id: genId(), type: newAnnotation.type, text: newAnnotation.text.trim(), emoji: newAnnotation.emoji || undefined }]);
    setNewAnnotation({ type: 'special', text: '', emoji: '' });
  };

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'lineup', label: 'Lineup' },
    { key: 'events', label: 'Events' },
    { key: 'annotations', label: 'Annotations' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="font-semibold text-[#e6edf3]">Edit Match</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]"><X size={18} /></button>
        </div>

        <div className="flex border-b border-[#30363d] px-5 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ' +
                (activeTab === tab.key ? 'border-[#3fb950] text-[#3fb950]' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]')}
            >
              {tab.label}
              {tab.key === 'events' && events.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-[#3fb950]/20 text-[#3fb950] px-1.5 rounded-full">{events.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
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

          {activeTab === 'lineup' && (
            <div>
              <p className="text-xs text-[#8b949e] mb-4">Search for players or select from squad. Use ST, SUB or N/P to categorise each player.</p>
              <div className="flex gap-4">
                <TeamLineupEditor teamName={form.homeTeamName} teamApiId={match.homeTeam.apiId} players={homePlayers} onPlayersChange={setHomePlayers} season={season} />
                <div className="w-px bg-[#30363d]" />
                <TeamLineupEditor teamName={form.awayTeamName} teamApiId={match.awayTeam.apiId} players={awayPlayers} onPlayersChange={setAwayPlayers} season={season} />
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <EventsEditor
              events={events}
              onEventsChange={setEvents}
              homePlayers={homePlayers}
              awayPlayers={awayPlayers}
              homeTeamName={form.homeTeamName}
              awayTeamName={form.awayTeamName}
            />
          )}

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
