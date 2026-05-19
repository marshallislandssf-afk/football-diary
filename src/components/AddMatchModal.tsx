'use client';

import { useState } from 'react';
import { Match } from '@/lib/types';
import { X } from 'lucide-react';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface Props {
  onAdd: (match: Match) => void;
  onClose: () => void;
}

export function AddMatchModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    homeTeamName: '',
    awayTeamName: '',
    homeScore: '',
    awayScore: '',
    competition: '',
    country: '',
    venue: '',
    isManual: true,
  });

  const isValid = form.homeTeamName.trim() && form.awayTeamName.trim() && form.date && form.competition.trim();

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
        name: form.competition.trim(),
        country: form.country.trim() || 'Unknown',
      },
      venue: form.venue.trim() || undefined,
      isManual: true,
    };
    onAdd(match);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="font-semibold text-[#e6edf3]">Add Match Manually</h2>
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
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Score</label>
              <input
                type="number"
                min="0"
                value={form.homeScore}
                onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
                placeholder="–"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Score</label>
              <input
                type="number"
                min="0"
                value={form.awayScore}
                onChange={(e) => setForm({ ...form, awayScore: e.target.value })}
                placeholder="–"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Competition *</label>
              <input
                value={form.competition}
                onChange={(e) => setForm({ ...form, competition: e.target.value })}
                placeholder="e.g. Premier League"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. England"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>
          </div>

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
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3]"
            >
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
