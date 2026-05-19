'use client';

import { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { saveApiKey } from '@/lib/storage';

interface Props {
  apiKey: string;
  onKeyChange: (key: string) => void;
}

export function SettingsPanel({ apiKey, onKeyChange }: Props) {
  const [input, setInput] = useState(apiKey);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveApiKey(input.trim());
    onKeyChange(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
          <Key size={11} className="inline mr-1" />
          API-Sports Key
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type={visible ? 'text' : 'password'}
              placeholder="Paste your API key here"
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] pr-9 font-mono"
            />
            <button
              onClick={() => setVisible((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e]"
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saved ? <CheckCircle size={14} /> : null}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <p className="text-[11px] text-[#484f58] mt-1.5">
          Your key is stored locally in your browser only. Get one at{' '}
          <a
            href="https://api-sports.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#58a6ff] hover:underline"
          >
            api-sports.io
          </a>
        </p>
      </div>
    </div>
  );
}
