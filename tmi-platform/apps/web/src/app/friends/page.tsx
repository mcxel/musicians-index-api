'use client';

import { useState } from 'react';
import Link from 'next/link';

const MOCK_FRIENDS = [
  { id: '1', name: 'DJ Kenzo', role: 'ARTIST', status: 'online', avatar: null },
  { id: '2', name: 'Amara Osei', role: 'FAN', status: 'offline', avatar: null },
  { id: '3', name: 'Yusuf Bello', role: 'ARTIST', status: 'online', avatar: null },
  { id: '4', name: 'Siti Rahayu', role: 'FAN', status: 'away', avatar: null },
];

const MOCK_REQUESTS = [
  { id: '5', name: 'Kwame Asante', role: 'ARTIST', sentAt: '2 hours ago' },
  { id: '6', name: 'Priya Nair', role: 'FAN', sentAt: '1 day ago' },
];

type Tab = 'friends' | 'requests' | 'find';

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('friends');
  const [search, setSearch] = useState('');
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const filtered = MOCK_FRIENDS.filter((f) =>
    !removed.has(f.id) && f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Friends</h1>
      <p className="text-gray-400 mb-8">Connect with artists and fans on the platform.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-0">
        {(['friends', 'requests', 'find'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-semibold capitalize rounded-t transition-colors ${
              tab === t
                ? 'bg-[#ff6b35] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'requests' ? `Requests (${MOCK_REQUESTS.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Friends Tab */}
      {tab === 'friends' && (
        <div>
          <input
            type="text"
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-[#ff6b35]"
          />
          <div className="space-y-3">
            {filtered.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-[#ff6b35]/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] font-bold text-sm">
                      {friend.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${
                        friend.status === 'online'
                          ? 'bg-green-500'
                          : friend.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{friend.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{friend.role.toLowerCase()} · {friend.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/messages/new?recipientId=${friend.id}&name=${encodeURIComponent(friend.name)}`}
                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Message
                  </Link>
                  <Link
                    href={`/video/rooms/new?inviteId=${friend.id}&name=${encodeURIComponent(friend.name)}`}
                    className="text-xs px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors"
                  >
                    Video
                  </Link>
                  <button
                    onClick={() => setRemoved(prev => new Set([...prev, friend.id]))}
                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No friends found.</p>
            )}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {MOCK_REQUESTS.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] font-bold text-sm">
                  {req.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{req.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{req.role.toLowerCase()} · {req.sentAt}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white rounded-lg transition-colors font-semibold">
                  Accept
                </button>
                <button className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors">
                  Decline
                </button>
              </div>
            </div>
          ))}
          {MOCK_REQUESTS.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No pending requests.</p>
          )}
        </div>
      )}

      {/* Find Tab */}
      {tab === 'find' && (
        <div>
          <input
            type="text"
            placeholder="Search by name or username..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-[#ff6b35]"
          />
          <p className="text-gray-500 text-sm text-center py-8">
            Search for artists and fans to connect with.
          </p>
        </div>
      )}
    </main>
  );
}
