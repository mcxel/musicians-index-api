'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Tab = 'friends' | 'requests' | 'find';
type FriendRecord = { id: string; name: string; role: string; status: 'online' | 'offline' };
type RequestRecord = { id: string; name: string; role: string; sentAt: string };
type FoundUser = { id: string; name: string; role: string; handle: string };

function asFriends(body: unknown): FriendRecord[] {
  const rows = Array.isArray(body)
    ? body
    : body && typeof body === 'object' && Array.isArray((body as { friends?: unknown }).friends)
      ? (body as { friends: unknown[] }).friends
      : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const record = row as Record<string, unknown>;
    const id = String(record.id ?? '');
    const name = String(record.displayName ?? record.name ?? record.username ?? '').trim();
    if (!id || !name) return [];
    const online = record.online === true;
    if (record.relationshipStatus !== 'accepted') return [];
    return [{ id, name, role: String(record.role ?? 'MEMBER'), status: online ? 'online' as const : 'offline' as const }];
  });
}

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('friends');
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [found, setFound] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [findSearch, setFindSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/friends', { cache: 'no-store', credentials: 'include' })
      .then(async (res) => (res.ok ? asFriends(await res.json()) : []))
      .then((rows) => { if (!cancelled) setFriends(rows); })
      .catch(() => { if (!cancelled) setFriends([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const q = findSearch.trim();
    if (q.length < 2) {
      setFound([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { cache: 'no-store', credentials: 'include' })
        .then(async (res) => (res.ok ? res.json() : { users: [] }))
        .then((body: { users?: Array<Record<string, unknown>> }) => {
          if (cancelled) return;
          setFound((body.users ?? []).flatMap((user) => {
            const id = String(user.id ?? '');
            const name = String(user.name ?? '').trim();
            if (!id || !name) return [];
            return [{ id, name, role: String(user.role ?? 'MEMBER'), handle: String(user.handle ?? '') }];
          }));
        })
        .catch(() => { if (!cancelled) setFound([]); });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [findSearch]);

  const filtered = friends.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  async function acceptRequest(id: string) {
    await fetch(`/api/friends/request/${id}/accept`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  async function declineRequest(id: string) {
    await fetch(`/api/friends/request/${id}/decline`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  async function removeFriend(id: string) {
    setFriends((prev) => prev.filter((friend) => friend.id !== id));
    await fetch(`/api/friends/${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
  }

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
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-600'
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
                    onClick={() => void removeFriend(friend.id)}
                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {loading ? (
              <p className="text-gray-500 text-sm text-center py-8">Loading friends…</p>
            ) : null}
            {!loading && filtered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No friends yet.</p>
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
            {found.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role.toLowerCase()}</p>
                </div>
              </div>
            ))}
            {found.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">
                {findSearch.trim().length < 2 ? "Type a name to search real members." : `No members found for "${findSearch}"`}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
