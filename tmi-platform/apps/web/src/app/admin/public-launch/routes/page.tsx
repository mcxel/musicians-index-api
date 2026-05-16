import { getPublicLaunchSnapshot } from '@/lib/share/PublicLaunchStatusEngine';

export default function AdminPublicLaunchRoutesPage() {
  const snapshot = getPublicLaunchSnapshot();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Route Diagnostics</h1>
      <p style={{ color: '#9fe', maxWidth: 760 }}>
        Route map status for the soft launch homepage and magazine visibility gate.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                borderBottom: '1px solid #00ffff44',
                padding: '10px 6px',
              }}
            >
              Route
            </th>
            <th
              style={{
                textAlign: 'left',
                borderBottom: '1px solid #00ffff44',
                padding: '10px 6px',
              }}
            >
              Expected
            </th>
            <th
              style={{
                textAlign: 'left',
                borderBottom: '1px solid #00ffff44',
                padding: '10px 6px',
              }}
            >
              Status
            </th>
            <th
              style={{
                textAlign: 'left',
                borderBottom: '1px solid #00ffff44',
                padding: '10px 6px',
              }}
            >
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {snapshot.routes.map((route) => (
            <tr key={route.route}>
              <td style={{ borderBottom: '1px solid #ffffff1a', padding: '10px 6px' }}>
                {route.route}
              </td>
              <td style={{ borderBottom: '1px solid #ffffff1a', padding: '10px 6px' }}>
                {route.publicExpected ? 'Public' : 'Protected'}
              </td>
              <td
                style={{
                  borderBottom: '1px solid #ffffff1a',
                  padding: '10px 6px',
                  color: route.status === 'PASS' ? '#00ffff' : '#ffcf55',
                }}
              >
                {route.status}
              </td>
              <td
                style={{ borderBottom: '1px solid #ffffff1a', padding: '10px 6px', color: '#9bb' }}
              >
                {route.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
