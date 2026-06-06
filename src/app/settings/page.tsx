'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Check, Copy, Globe, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username || '');
          setDisplayName(data.display_name || '');
          setIsPublic(data.is_public || false);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate username
    if (username && !/^[a-z0-9_-]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters, lowercase letters, numbers, hyphens and underscores only.');
      setSaving(false);
      return;
    }

    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username.toLowerCase() || null,
        display_name: displayName || null,
        is_public: isPublic,
      }, { onConflict: 'id' });

    if (err) {
      if (err.message.includes('unique')) {
        setError('That username is already taken. Please choose another.');
      } else {
        setError(err.message);
      }
    } else {
      // Also update all matches visibility
      await supabase
        .from('matches')
        .update({ is_public: isPublic })
        .eq('user_id', user.id);
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const profileUrl = username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${username}` : '';

  const handleCopy = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 size={20} className="animate-spin text-[#8b949e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="font-semibold text-[#e6edf3]">Settings</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Profile */}
        <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-4">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Display name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Username</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#484f58]">footballdiary.vercel.app/u/</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="yourname"
                  className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] placeholder-[#484f58]"
                />
              </div>
              <p className="text-[11px] text-[#484f58] mt-1">3-20 characters, lowercase letters, numbers, hyphens, underscores</p>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-4">Privacy</h2>

          <button
            onClick={() => setIsPublic(v => !v)}
            className="w-full flex items-center gap-3 p-3 bg-[#161b22] hover:bg-[#21262d] rounded-lg transition-colors text-left"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPublic ? 'bg-[#3fb950]/20' : 'bg-[#30363d]'}`}>
              {isPublic ? <Globe size={16} className="text-[#3fb950]" /> : <Lock size={16} className="text-[#8b949e]" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#e6edf3]">
                {isPublic ? 'Public profile' : 'Private profile'}
              </div>
              <div className="text-xs text-[#8b949e]">
                {isPublic
                  ? 'Anyone with your link can view your matches'
                  : 'Only you can see your matches'}
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isPublic ? 'bg-[#3fb950]' : 'bg-[#30363d]'}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {isPublic && username && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 bg-[#161b22] border border-[#3fb950]/30 rounded-lg px-3 py-2">
                
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#3fb950] hover:underline flex-1 truncate"
                >
                  {profileUrl}
                </a>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-[#3fb950] hover:text-[#2ea043] flex-shrink-0 border border-[#3fb950]/30 rounded px-2 py-1">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
              <p className="text-[11px] text-[#484f58]">
                Share this link with friends — they can view your matches without an account.
              </p>
            </div>
          )}

          {isPublic && !username && (
            <p className="text-xs text-[#e3b341] mt-3 bg-[#e3b341]/10 border border-[#e3b341]/20 rounded-lg px-3 py-2">
              Set a username above to get your shareable link.
            </p>
          )}
        </div>

        {/* Account */}
        <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#e6edf3] mb-2">Account</h2>
          <p className="text-xs text-[#8b949e]">{user?.email}</p>
        </div>

        {error && (
          <p className="text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/20 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save settings
        </button>
      </main>
    </div>
  );
}
