'use client';

import React from 'react';
import Link from 'next/link';
import { ConfettiBackground, GeoBlock, MagButton, MagPill, NeonHead, MAG_COLORS } from '@/components/ui/MagazineUI';
import AdRenderer from '@/components/ads/AdRenderer';
import AdSenseSlot, { AD_SLOTS } from '@/components/ads/AdSenseSlot';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

const CAT_COLOR: Record<string, string> = {
  feature:   MAG_COLORS.PK,
  interview: MAG_COLORS.CY,
  review:    MAG_COLORS.PU,
  editorial: MAG_COLORS.GD,
  news:      MAG_COLORS.GN,
};

const SHAPE_BY_CAT: Record<string, 'blob' | 'hex' | 'tagR' | 'default'> = {
  feature:   'blob',
  interview: 'hex',
  editorial: 'tagR',
  review:    'default',
  news:      'default',
};

export default function MagazinePage() {
  const featured = MAGAZINE_ISSUE_1.slice(0, 2);
  const rest     = MAGAZINE_ISSUE_1.slice(2);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <ConfettiBackground count={30} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10 }}>

        {/* Masthead */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <NeonHead text="THE MUSICIAN'S INDEX" color={MAG_COLORS.OR} size={48} />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <MagPill text="ISSUE 001 · DIGITAL FIRST" bg={MAG_COLORS.PK} />
            <MagPill text={`${MAGAZINE_ISSUE_1.length} ARTICLES`} bg={MAG_COLORS.CY} />
          </div>
        </div>

        {/* Main Sponsor Billboard */}
        <div style={{ marginBottom: 40, width: '100%' }}>
          <AdRenderer zone="billboard" />
        </div>

        {/* Featured articles + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start', marginBottom: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {featured.map((article) => {
              const accent = CAT_COLOR[article.category] ?? MAG_COLORS.CY;
              const shape  = SHAPE_BY_CAT[article.category] ?? 'blob';
              return (
                <GeoBlock
                  key={article.slug}
                  bg="#1A0A3A"
                  border={accent}
                  shape={shape}
                  height={260}
                  label={article.category.toUpperCase()}
                >
                  <div style={{ textAlign: 'center', padding: '0 12px' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{article.icon}</div>
                    <NeonHead text={article.title.toUpperCase()} color={accent} size={20} />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 16, lineHeight: 1.5 }}>
                      {article.subtitle}
                    </p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
                      {article.author} · {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <Link href={`/magazine/article/${article.slug}`} style={{ textDecoration: 'none' }}>
                      <MagButton label="READ FULL STORY" bg={accent} />
                    </Link>
                  </div>
                </GeoBlock>
              );
            })}
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 20 }}>
            <AdRenderer zone="sidebar" />
          </div>
        </div>

        {/* More articles grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <NeonHead text="MORE FROM THIS ISSUE" color={MAG_COLORS.CY} size={22} />
            <Link href="/articles" style={{ textDecoration: 'none' }}>
              <MagButton label="VIEW ALL →" bg={MAG_COLORS.DT} border={MAG_COLORS.CY} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {rest.map((article) => {
              const accent = CAT_COLOR[article.category] ?? MAG_COLORS.CY;
              return (
                <div
                  key={article.slug}
                  style={{
                    background: '#0D0D24',
                    border: `1px solid ${accent}33`,
                    borderRadius: 12,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{article.icon}</span>
                    <div>
                      <div style={{ fontSize: 8, fontWeight: 800, color: accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                        {article.category}
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                        {article.title}
                      </h3>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                    {article.subtitle}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{article.author}</span>
                    <Link href={`/magazine/article/${article.slug}`} style={{ textDecoration: 'none' }}>
                      <MagButton label="READ →" bg={accent} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mid-page leaderboard — between articles and footer */}
        <div style={{ marginBottom: 32 }}>
          <AdSenseSlot
            slot={AD_SLOTS.magazineLeaderboard}
            format="horizontal"
            label="ADVERTISEMENT"
            style={{ minHeight: 90 }}
          />
        </div>

        {/* Subscribe + read full issue CTA */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,45,170,0.1), rgba(170,45,255,0.1))',
          border: '1px solid rgba(255,45,170,0.25)',
          borderRadius: 16,
          padding: '24px',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.2em', marginBottom: 8 }}>READ THE FULL ISSUE</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Earn XP · Discover Artists · Win Prizes</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Flip pages, listen to articles, and earn more points in the magazine than anywhere else on the platform.
          </div>
          <Link href="/magazine/1" style={{
            display: 'inline-block', padding: '12px 32px',
            background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
            color: '#fff', borderRadius: 10,
            fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
            textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,170,0.35)',
          }}>
            OPEN ISSUE 1 →
          </Link>
        </div>

      </div>
    </main>
  );
}
