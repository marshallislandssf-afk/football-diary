'use client';

import { useState, useRef } from 'react';
import { Match, MatchNote, MatchImage } from '@/lib/types';
import { Plus, Trash2, FileText, X } from 'lucide-react';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface Props {
  match: Match;
  onUpdate: (id: string, updates: Partial<Match>) => void;
}

export function MatchNotesPanel({ match, onUpdate }: Props) {
  const [noteText, setNoteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notes = match.notes || [];
  const images = match.images || [];

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: MatchNote = { id: genId(), text: noteText.trim(), createdAt: new Date().toISOString() };
    onUpdate(match.id, { notes: [...notes, newNote] });
    setNoteText('');
  };

  const deleteNote = (id: string) => {
    onUpdate(match.id, { notes: notes.filter(n => n.id !== id) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target?.result as string;
        const newImage: MatchImage = { id: genId(), url, caption: '', uploadedAt: new Date().toISOString() };
        onUpdate(match.id, { images: [...(match.images || []), newImage] });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteImage = (id: string) => {
    onUpdate(match.id, { images: images.filter(i => i.id !== id) });
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText size={12} />Notes
        </h4>
        {notes.length > 0 && (
          <div className="space-y-2 mb-3">
            {notes.map(note => (
              <div key={note.id} className="flex items-start gap-2 bg-[#161b22] rounded-lg p-3 group">
                <p className="flex-1 text-sm text-[#e6edf3] leading-relaxed">{note.text}</p>
                <button onClick={() => deleteNote(note.id)} className="text-[#484f58] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-all mt-0.5">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note about this match..."
            rows={2}
            className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-none"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }}
          />
          <button onClick={addNote} disabled={!noteText.trim()} className="self-end px-3 py-2 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-40 text-[#e6edf3] text-sm rounded-lg border border-[#30363d] transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">Images</h4>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#30363d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || 'Match photo'} className="w-full h-28 object-cover" />
                <button onClick={() => deleteImage(img.id)} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#30363d] hover:border-[#58a6ff] text-sm text-[#8b949e] hover:text-[#58a6ff] rounded-lg transition-colors w-full justify-center">
          Upload photos
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  );
}
