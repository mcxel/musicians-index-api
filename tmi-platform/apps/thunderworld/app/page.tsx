import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Thunder World' };
export default function HomePage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Thunder World</h1>
      <p style={{ color: '#8080a0' }}>Module scaffold active. Port 3004 — thunderworld.berntout.com</p>
    </main>
  );
}
