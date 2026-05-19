'use client';

import { useState } from 'react';
import { Match, Annotation } from '@/lib/types';
import { X, Plus, Trash2 } from 'lucide-react';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface Props {
  match: Match;
  onSave: (updates: Partial<Match>) => void;
  onClose: () => void;
}

const ANNOTATION_TYPES = ['promotion', 'milestone', 'special', 'goal', 'custom'] as const;

export function EditMatchModal({ match, onSave, onClose }: Props) {
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

  const [annotations, setAnnotations] = useState<Annotation[]>(
    match.annotations || []
  );
  const [newAnnotation, setNewAnnotation] = useState({
    type: 'special' as Annotation['type'],
    text: '',
    emoji: '',
  });

  const handleSave = () => {
    onSave({
      date: form.date,
      homeTeam: { ...match.homeTeam, name: form.homeTeamName },
      awayTeam: { ...match.awayTeam, name: form.awayTeamName },
      homeScore: form.homeScore !== '' ? parseInt(form.homeScore) : undefined,
      awayScore: form.awayScore !== '' ? parseInt(form.awayScore) : undefined,
      competition: {
        ...match.competition,
        name: form.competition,
        country: form.country,
      },
      venue: form.venue || undefined,
      annotations,
    });
  };

  const addAnnotation = () => {
    if (!newAnnotation.text.trim()) return;
    setAnnotations((prev) => [
      ...prev,
      {
        id: genId(),
        type: newAnnotation.type,
        text: newAnnotation.text.trim(),
        emoji: newAnnotation.emoji || undefined,
      },
    ]);
    setNewAnnotation({ type: 'special', text: '', emoji: '' });
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1c2128] border border-[#30363d] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="font-semibold text-[#e6edf3]">Edit Match</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Date</label>
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
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Team</label>
              <input
                value={form.homeTeamName}
                onChange={(e) => setForm({ ...form, homeTeamName: e.target.value })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Away Team</label>
              <input
                value={form.awayTeamName}
                onChange={(e) => setForm({ ...form, awayTeamName: e.target.value })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Home Score</label>
              <input
                type="number"
                min="0"
                value={form.homeScore}
                onChange={(e) => setForm({ ...form, homeScore: e.target.value })}
                placeholder="–"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
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
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          {/* Competition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Competition</label>
              <input
                value={form.competition}
                onChange={(e) => setForm({ ...form, competition: e.target.value })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
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

          {/* Annotations */}
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-2">
              Special Annotations
            </label>
            {annotations.length > 0 && (
              <div className="space-y-2 mb-3">
                {annotations.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-2 bg-[#161b22] rounded-lg p-2.5"
                  >
                    {a.emoji && <span>{a.emoji}</span>}
                    <span className="flex-1 text-xs text-[#e6edf3]">{a.text}</span>
                    <span className="text-[10px] text-[#8b949e] capitalize mr-1">{a.type}</span>
                    <button
                      onClick={() => removeAnnotation(a.id)}
                      className="text-[#484f58] hover:text-[#f85149]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Add annotation form */}
            <div className="bg-[#161b22] rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <select
                  value={newAnnotation.type}
                  onChange={(e) =>
                    setNewAnnotation({
                      ...newAnnotation,
                      type: e.target.value as Annotation['type'],
                    })
                  }
                  className="bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
                >
                  {ANNOTATION_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  value={newAnnotation.emoji}
                  onChange={(e) =>
                    setNewAnnotation({ ...newAnnotation, emoji: e.target.value })
                  }
                  placeholder="Emoji"
                  className="w-16 bg-[#21262d] border border-[#30363d] rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  value={newAnnotation.text}
                  onChange={(e) =>
                    setNewAnnotation({ ...newAnnotation, text: e.target.value })
                  }
                  placeholder="Annotation text…"
                  className="flex-1 bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
                  onKeyDown={(e) => e.key === 'Enter' && addAnnotation()}
                />
                <button
                  onClick={addAnnotation}
                  disabled={!newAnnotation.text.trim()}
                  className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#30363d]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
