'use client';
import { useEffect, useState } from 'react';
import type { UserPublic, ArtistPublic } from '@tmi/contracts';
import { UserManagement } from '@/components/admin/UserManagement';

export default function AdminDashboard() {
  const [users, setUsers]     = useState<UserPublic[]>([]);
  const [artists, setArtists] = useState<ArtistPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => {
        if (!r.ok) return r.json().then(d => { throw new Error(d.error || `HTTP ${r.status}`); });
        return r.json();
      })
      .then(d => {
        if (d.users)   setUsers(d.users);
        if (d.artists) setArtists(d.artists);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold text-purple-400 mb-2">Admin Dashboard</h1>
      {loading && (
        <p className="text-sm text-gray-400 mb-6">Loading users…</p>
      )}
      {!loading && error && (
        <p className="text-sm text-red-400 mb-6">API error: {error}</p>
      )}
      {!loading && !error && users.length === 0 && (
        <p className="text-sm text-yellow-400 mb-6">
          No users returned — ensure you are logged in as ADMIN (tmi_role=ADMIN cookie required).
        </p>
      )}
      {!loading && !error && users.length > 0 && (
        <p className="text-sm text-green-400 mb-6">{users.length} user{users.length !== 1 ? 's' : ''} loaded</p>
      )}
      <UserManagement users={users} artists={artists} />
    </div>
  );
}
