// /admin/promos: Admin promo code management dashboard
import { PromoCodeEngine } from '@/lib/promos/PromoCodeEngine';
import { PromoAuditEngine } from '@/lib/promos/PromoAuditEngine';

export default function AdminPromosPage() {
  const codes = PromoCodeEngine.listCodes();
  return (
    <div className="max-w-4xl mx-auto p-8 bg-black/90 rounded-xl mt-12 text-white">
      <h1 className="text-2xl font-bold mb-4">Promo Codes</h1>
      <table className="w-full text-left mb-8">
        <thead>
          <tr className="text-cyan-400">
            <th>Code</th><th>Type</th><th>Tier</th><th>Role</th><th>Duration</th><th>Redemptions</th><th>Revoked</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(c => (
            <tr key={c.code}>
              <td className="font-mono">{c.code}</td>
              <td>{c.type}</td>
              <td>{c.tier}</td>
              <td>{c.role}</td>
              <td>{c.duration}</td>
              <td>{c.redemptions.length}</td>
              <td>{c.revoked ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-bold mb-2">Audit Log</h2>
      <div className="bg-gray-900 p-4 rounded">
        {PromoAuditEngine.getLogs().map((log, i) => (
          <div key={i} className="mb-2 text-xs">
            <span className="text-fuchsia-400">[{log.timestamp.toLocaleString()}]</span> {log.actor} {log.action} <span className="font-mono">{log.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
