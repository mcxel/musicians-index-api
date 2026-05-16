// /admin/users/grants: Admin view for all user promo/invite grants
import { TemporaryMembershipEngine } from '@/lib/subscriptions/TemporaryMembershipEngine';

export default function AdminUserGrantsPage() {
  const memberships = TemporaryMembershipEngine.listAll();
  return (
    <div className="max-w-4xl mx-auto p-8 bg-black/90 rounded-xl mt-12 text-white">
      <h1 className="text-2xl font-bold mb-4">User Promo & Invite Grants</h1>
      <table className="w-full text-left">
        <thead>
          <tr className="text-cyan-400">
            <th>Email</th><th>Tier</th><th>Role</th><th>Duration</th><th>Granted</th><th>Expires</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map(m => (
            <tr key={m.id}>
              <td>{m.email}</td>
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
