'use client';
import { useEffect, useState } from 'react';
import { TemporaryMembershipEngine } from '@/lib/subscriptions/TemporaryMembershipEngine';

export default function AccountPromosPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: { email?: string } }) => {
        if (d.authenticated && d.user?.email) {
          setEmail(d.user.email);
        } else {
          setEmail('');
        }
      })
      .catch(() => setEmail(''))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-2xl mx-auto p-8 mt-12 text-white">Loading promos...</div>;
  }

  if (!email) {
    return <div className="max-w-2xl mx-auto p-8 mt-12 text-white">Please sign in to view promotions.</div>;
  }

  const memberships = TemporaryMembershipEngine.getMembershipsForEmail(email);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-black/80 rounded-xl mt-12 text-white">
      <h1 className="text-2xl font-bold mb-4">My Promo Codes & Memberships</h1>
      <table className="w-full text-left">
        <thead>
          <tr className="text-cyan-400">
            <th>Tier</th><th>Role</th><th>Duration</th><th>Granted</th><th>Expires</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((m) => (
            <tr key={m.id}>
              <td>{m.tier}</td>
              <td>{m.role}</td>
              <td>{m.duration}</td>
              <td>{m.grantedAt.toLocaleString()}</td>
              <td>{m.expiresAt === 'lifetime' ? 'Lifetime' : new Date(m.expiresAt).toLocaleString()}</td>
              <td>{m.upgradedToPaid ? 'Upgraded' : 'Active'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
