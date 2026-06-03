'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../1/Home1.module.css';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';

const CATEGORIES = [
  'Hip Hop', 'R&B', 'Rock', 'Country', 'Pop', 'EDM', 'Latin', 'Jazz', 'Blues', 'Gospel',
  'Reggae', 'Metal', 'Folk', 'Classical', 'Instrumental', 'Beat Makers', 'Producers',
  'DJs', 'Comedians', 'Joke-Offs', 'Dance-Offs', 'Dance Crews', 'Actors', 'Magicians',
  'Poets', 'Content Creators', 'Fans', 'Venues', 'Promoters', 'Sponsors', 'Advertisers',
  'Writers', 'Guitarists', 'Drummers', 'Pianists', 'Violinists', 'Bassists',
  'Saxophonists', 'Trumpet Players'
];

// Lore-accurate mock names based on TMI Editorial Canon
const ARTIST_NAMES = ['Nova Cipher', 'Verse.XL', 'FlowState.J', 'Ari Volt', 'Punchline.K', 'BarGod.T', 'Vocab.X', 'Ray Journey', 'DJ Apex', 'Lyric.M'];

// Realistic Metadata Engine for the Active Billboard Matrix
const generateRankings = (category: string) => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `${category.replace(/\s+/g, '-').toLowerCase()}-card-${i}`,
    name: ARTIST_NAMES[i % ARTIST_NAMES.length],
    imageUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(category)}-${i}`,
    city: ['Atlanta, GA', 'London, UK', 'Tokyo, JP', 'Los Angeles, CA', 'Toronto, CA'][i % 5],
    flag: ['🇺🇸', '🇬🇧', '🇯🇵', '🇺🇸', '🇨🇦'][i % 5],
    category,
    rank: i + 1,
    fanCount: Math.floor(Math.random() * 50000) + 1000,
    likes: Math.floor(Math.random() * 100000) + 5000,
    isLive: Math.random() > 0.7, // Simulated 30% Live status
    tier: ['Bronze', 'Gold', 'Platinum', 'Diamond'][Math.floor(Math.random() * 4)],
    truthScore: `${Math.floor(Math.random() * 30) + 70}% Truth`
  }));
};

export default function Home12Page() {
  const [catIndex, setCatIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Advanced Billboard Auto-Rotation Engine (5-10s requirement)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCatIndex((prev) => (prev + 1) % CATEGORIES.length);
    }, 8000); // 8-second cycle
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentCategory = CATEGORIES[catIndex];
  const items = generateRankings(currentCategory);
  
  // Inject real editorial news into the marquee instead of hardcoded placeholder strings
  const latestNews = getLatestEditorialArticles(5);
  const tickerNewsString = latestNews.map(article => `[${article.category.toUpperCase()}] ${article.headline}`).join('  ⚡  ');

  return (
    <main className={styles.root}>
      {/* Dynamic World Visual Backdrop from Canonical Asset Manifest */}
      <div className={styles.underlay} style={{ 
        backgroundImage: 'url("/tmi-source/_converted_webp_all/Tmi Homepage 1-2.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: 0.65
      }}>
        <div className={`${styles.blob} ${styles.blobA}`} style={{ background: 'var(--purple)', top: '10%', left: '10%', width: '40vw', height: '40vw', mixBlendMode: 'overlay' }} />
        <div className={`${styles.blob} ${styles.blobB}`} style={{ background: 'var(--cyan)', bottom: '10%', right: '10%', width: '35vw', height: '35vw', mixBlendMode: 'overlay' }} />
      </div>

      {/* Unified Nav Interface */}
      <div className={styles.topBar}>
        <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 900, color: 'var(--cyan)' }}>TMI BILLBOARD WORLD</div>
        <div className={styles.navButtons}>
          <Link href="/home/1" className={styles.tmiBtn}>1</Link>
          <Link href="/home/1-2" className={`${styles.tmiBtn} ${styles.tmiBtnCyan}`} style={{ background: 'rgba(0, 229, 255, 0.1)' }}>1-2</Link>
          <Link href="/home/2" className={styles.tmiBtn}>2</Link>
          <Link href="/home/3" className={styles.tmiBtn}>3</Link>
          <Link href="/home/4" className={styles.tmiBtn}>4</Link>
          <Link href="/home/5" className={styles.tmiBtn}>5</Link>
        </div>
      </div>

      <div className={styles.tickerWrap}>
        <div className={styles.tickerInner}>
          {tickerNewsString}  ⚡  TMI BILLBOARD ROTATION ENGINE ONLINE  ⚡  LIVE DATA PENDING
        </div>
      </div>

      {/* Rotation Control Hub */}
      <div 
        className={styles.billboardContainer} 
        onMouseEnter={() => setIsPaused(true)} 
        onMouseLeave={() => setIsPaused(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setCatIndex((p) => (p - 1 + CATEGORIES.length) % CATEGORIES.length)} 
            className={styles.tmiBtn} 
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            &lt; PREV
          </button>
          <h2 className={styles.categoryHeader}>[{currentCategory}]</h2>
          <button 
            onClick={() => setCatIndex((p) => (p + 1) % CATEGORIES.length)} 
            className={styles.tmiBtn} 
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            NEXT &gt;
          </button>
        </div>

        {/* Render Live Top 10 Realism Roster Grid */}
        <div className={styles.billboardGrid}>
          {items.map((item) => (
            <div key={item.id} className={styles.billboardCard}>
              
              <div 
                className={styles.cardImagePlaceholder} 
                style={{ position: 'relative', height: '220px', width: '100%', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', backgroundColor: '#1a1a1a', border: '1px solid rgba(0, 229, 255, 0.1)' }}
              >
                 <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                 
                 <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '30px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                   <span style={{ opacity: 0.8, letterSpacing: '0.1em', fontSize: 10, color: '#fff', fontFamily: 'var(--font-orbitron)' }}>[MOTION ACTIVE]</span>
                   {item.isLive && <span className={styles.liveBadge} style={{ animation: 'pulse 2s infinite' }}>🔴 REC</span>}
                 </div>
              </div>
              
              <div className={styles.metadataRow}>
                <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-orbitron)', fontWeight: 900, fontSize: 12 }}>
                  #{item.rank} {item.name} {item.flag}
                </span>
                {item.isLive ? (
                  <span style={{ color: '#00FF88', fontWeight: 800, fontSize: 11, textShadow: '0 0 8px rgba(0,255,136,0.4)' }}>LIVE NOW</span>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 10 }}>OFFLINE</span>
                )}
              </div>
              
              <div className={styles.metadataRow}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 {item.city}
                </span>
                <span style={{ color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.tier}
                </span>
              </div>

              <div className={styles.metadataRow} style={{ borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: 8, marginTop: 4 }}>
                <span>FANS: <strong style={{ color: '#fff' }}>{item.fanCount.toLocaleString()}</strong></span>
                <span>LIKES: <strong style={{ color: '#fff' }}>{item.likes.toLocaleString()}</strong></span>
              </div>

              <div className={styles.metadataRow} style={{ marginTop: 4 }}>
                <span style={{ color: 'var(--pink)', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em' }}>{item.category}</span>
                <span style={{ color: '#00e5ff', fontWeight: 900, fontSize: 11 }}>{item.truthScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
