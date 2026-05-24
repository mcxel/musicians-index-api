import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'WillDoIt' };
export default function HomePage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>WillDoIt</h1>
      <p style={{ color: '#8080a0' }}>Module scaffold active. Port 3006 — willdoit.berntout.com</p>
    </main>
  );
}
