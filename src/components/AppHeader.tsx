'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase-client';
import { LogOut, Settings, Globe } from 'lucide-react';
import Link from 'next/link';

export function AppHeader({ onAddMatch }: { onAddMatch: () => void }) {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('username, is_public')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username);
          setIsPublic(data.is_public);
        }
      });
  }, [user]);

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚽</span>
          <span className="font-bold text-[#e6edf3] text-base tracking-tight">Football Diary</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share profile link */}
          {username && isPublic && (
            <Link
              href={`/u/${username}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#3fb950] border border-[#3fb950]/30 rounded-lg hover:bg-[#3fb950]/10 transition-colors"
            >
              <Globe size={13} />
              My profile
            </Link>
          )}

          <Link
            href="/settings"
            className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] rounded-lg hover:bg-[#21262d] transition-colors"
            title="Settings"
          >
            <Settings size={15} />
          </Link>

          <button
            onClick={signOut}
            title="Sign out"
            className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] rounded-lg hover:bg-[#21262d] transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
