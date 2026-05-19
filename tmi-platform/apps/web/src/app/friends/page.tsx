'use client';
import { useGamificationEngine } from "@/hooks/useGamificationEngine";

import { useState } from 'react';
import Link from 'next/link';

const INITIAL_FRIENDS = [
  // Early access VIP cohort — message/video IDs match thread page
  { id: 'kreach', name: 'Kreach',      role: 'ARTIST',   status: 'online'  as const },
  { id: 'kg',     name: 'KG',          role: 'PRODUCER', status: 'online'  as const },
  // General friends
  { id: '1',      name: 'DJ Kenzo',    role: 'ARTIST',   status: 'online'  as const },
  { id: '2',      name: 'Amara Osei',  role: 'FAN',      status: 'offline' as const },
  { id: '3',      name: 'Yusuf Bello', role: 'ARTIST',   status: 'online'  as const },
  { id: '4',      name: 'Siti Rahayu', role: 'FAN',      status: 'away'    as const },
];

const INITIAL_REQUESTS = [
  { id: '5', name: 'Kwame Asante', role: 'ARTIST', sentAt: '2 hours ago' },
  { id: '6', name: 'Priya Nair',   role: 'FAN',    sentAt: '1 day ago'   },
];

// Discoverable users — shown in Find tab; omit those already in friends list
const DISCOVER_POOL = [
  { id: 'savage', name: 'Savage Guns', role: 'ARTIST',   handle: '@savageguns' },
  { id: 'jason',  name: 'Jason Smith', role: 'PROMOTER', handle: '@jasonsmith' },
  { id: 'c1',     name: 'Wavetek',     role: 'ARTIST',   handle: '@wavetek'     },
  { id: 'c2',     name: 'Zuri Bloom',  role: 'ARTIST',   handle: '@zuribloom'   },
  { id: 'c3',     name: 'Neon Vibe',   role: 'DJ',       handle: '@neonvibe'    },
];

type Tab = 'friends' | 'requests' | 'find';
type FriendRecord = typeof INITIAL_FRIENDS[number];
type RequestRecord = typeof INITIAL_REQUESTS[number];

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('friends');
  const { trackAction } = useGamificationEngine();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<FriendRecord[]>(INITIAL_FRIENDS);
  const [requests, setRequests] = useState<RequestRecord[]>(INITIAL_REQUESTS);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [findSearch, setFindSearch] = useState('');

  const filtered = friends.filter((f) =>
    !removed.has(f.id) && f.name.toLowerCase().includes(search.toLowerCase())
  );

  function acceptRequest(id: string) {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setFriends((prev) => [...prev, { id: req.id, name: req.name, role: req.role, status: 'online' as const }]);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  function declineRequest(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  const discoverFiltered = DISCOVER_POOL.filter(
    (u) => !friends.some((f) => f.id === u.id) &&
           (u.name.toLowerCase().includes(findSearch.toLowerCase()) ||
            u.handle.toLowerCase().includes(findSearch.toLowerCase()))
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
            {t === 'requests' ? `Requests (${requests.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
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
          {requests.map((req) => (
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
                <button
                  onClick={() => acceptRequest(req.id)}
                  className="text-xs px-3 py-1.5 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white rounded-lg transition-colors font-semibold"
                >
                  Accept
                </button>
                <button
                  onClick={() => declineRequest(req.id)}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
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
            value={findSearch}
            onChange={(e) => setFindSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-[#ff6b35]"
          />
          <div className="space-y-3">
            {discoverFiltered.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-[#ff6b35]/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.handle} · {user.role.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFollowed((prev) => {
                      const next = new Set(prev);
                      const wasFollowing = next.has(user.id);
                      wasFollowing ? next.delete(user.id) : next.add(user.id);
                      if (!wasFollowing) trackAction('VOTE_BATTLE');
                      return next;
                    })}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                      followed.has(user.id)
                        ? 'bg-[#ff6b35] text-white'
                        : 'bg-white/5 hover:bg-[#ff6b35]/20 text-[#ff6b35]'
                    }`}
                  >
                    {followed.has(user.id) ? 'Following' : 'Follow'}
                  </button>
                  <Link
                    href={`/messages/new?recipientId=${user.id}&name=${encodeURIComponent(user.name)}`}
                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
            {discoverFiltered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">
                {findSearch ? `No users found for "${findSearch}"` : 'No more users to discover.'}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
