import type { Metadata } from 'next';
import ExploreUnifiedCoordinator from '@/components/explore/ExploreUnifiedCoordinator';

export const metadata: Metadata = {
  title: 'Explore | TMI',
  description: 'Explore TMI — Universal Search, Snips vertical discovery, and community Public Page browsing.',
};

export default function ExplorePage() {
  return (
    <main
      data-testid="explore-page-root"
      style={{
        minHeight: '100vh',
        background: '#04050d',
        color: '#fff',
        paddingBottom: 80,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Explore Section Hero */}
      <section
        style={{
          textAlign: 'center',
          padding: '40px 20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 900, marginBottom: 8 }}>
          DISCOVERY CENTER
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Explore TMI
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
          Search everything across the network, discover short-form vertical Snips, and experience community Fan & Performer Public Pages.
        </p>
      </section>

      {/* Unified Coordinator: SEARCH | SNIPS | BROWSE */}
      <ExploreUnifiedCoordinator />
    </main>
  );
}
