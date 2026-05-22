'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORY_LABELS: Record<string, string> = {
  'battle-of-the-band': 'Battle of the Band',
  'rapper-battle': 'Rapper Battle',
  'comedian-showdown': 'Comedian Showdown',
  'dancer-cypher': 'Dancer Cipher',
  'singer-idol': 'Singer Idol',
  'dj-showcase': 'DJ Showcase',
  'producer-war': 'Producer War',
  'songwriter-duel': 'Songwriter Duel',
  'actor-improv': 'Actor Improv',
  'spoken-word': 'Spoken Word',
  'freestyle-open': 'Freestyle Open',
  'instrument-duel': 'Instrument Duel',
};

export default function ChampionshipCategoryPage({ params }: { params: { category: string } }) {
  const router = useRouter();
  const label = CATEGORY_LABELS[params.category] ?? params.category;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800, marginBottom: 16 }}>
        CHAMPIONSHIP · SEASON STANDINGS
      </div>
      <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', margin: '0 0 12px', textAlign: 'center' }}>
        {label}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 32, textAlign: 'center', maxWidth: 480 }}>
        Season standings, weekly belt holders, monthly trophies, and yearly crown champions.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href="/battles" style={{ padding: '12px 24px', background: '#FFD700', color: '#000', borderRadius: 8, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
          Enter Battle
        </a>
        <a href="/cypher/weekly" style={{ padding: '12px 24px', background: 'rgba(255,215,0,0.15)', color: '#FFD700', borderRadius: 8, fontWeight: 800, fontSize: 13, textDecoration: 'none', border: '1px solid rgba(255,215,0,0.35)' }}>
          Weekly Leaderboard
        </a>
      </div>
    </main>
  );
}
