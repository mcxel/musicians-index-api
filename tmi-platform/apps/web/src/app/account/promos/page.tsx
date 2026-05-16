// /account/promos: User's promo code and temporary membership history
import { TemporaryMembershipEngine } from '@/lib/subscriptions/TemporaryMembershipEngine';
import { useSession } from 'next-auth/react';

export default function AccountPromosPage() {
  const { data: session } = useSession();
  const email = session?.user?.email || '';
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
          {memberships.map(m => (
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
