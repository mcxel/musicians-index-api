import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Transistor Hut' };

export default function HomePage() {
  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ marginTop: 0 }}>Transistor Hut Storefront</h1>
      <p style={{ color: '#72738f' }}>
        Hardware, kiosk supplies, and operational accessories for BernoutGlobal modules.
      </p>
      <Link href='/inventory'>Open inventory catalog</Link>
    </main>
  );
}
