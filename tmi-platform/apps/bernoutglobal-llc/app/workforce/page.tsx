import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Workforce Control' };

const PANELS = [
  'Universal Worker Request',
  'Active Worker Jobs',
  'Dual Worker Jobs',
  'Crew Jobs',
  'Worker Budget',
  'Worker History',
  'Emergency Dispatch',
];

export default function WorkforcePage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ marginTop: 0 }}>BernoutGlobal LLC Workforce</h1>
      <p style={{ color: '#70708f' }}>
        Universal owner and business support dispatch through WillDoIt contracts only.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {PANELS.map((p) => (
          <section key={p} style={{ border: '1px solid #232338', borderRadius: 12, padding: '0.9rem', background: '#0d0d17' }}>
            <h2 style={{ margin: 0, fontSize: '1rem' }}>{p}</h2>
          </section>
        ))}
      </div>
    </main>
  );
}
