import { dropOffAnalysisEngine } from '@/lib/learning/DropOffAnalysisEngine';

export default function AdminLearningDropoffPage() {
  const hotspots = dropOffAnalysisEngine.getHotspots(25);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Learning: Drop-off</h1>
      <p style={{ color: '#9befff' }}>Detect friction routes and exit patterns early to prevent stale engagement loops.</p>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(hotspots, null, 2)}
      </pre>
    </main>
  );
}
