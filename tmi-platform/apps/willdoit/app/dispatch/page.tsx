import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'WillDoIt Dispatch' };

export default function DispatchPage() {
  return (
    <main style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ marginTop: 0 }}>Universal WillDoIt Dispatch</h1>
      <p style={{ color: '#70708f' }}>
        Single worker, dual workers, crews, and emergency teams for approved module requests.
      </p>
    </main>
  );
}
