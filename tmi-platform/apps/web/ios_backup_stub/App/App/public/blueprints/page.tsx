'use client';

import React from 'react';
import Link from 'next/link';
import { ConfettiBackground, GeoBlock, MagButton, MagPill, NeonHead, MAG_COLORS } from '@/components/ui/MagazineUI';

export default function ArticleCategoryPage({ params }: { params: { slug: string } }) {
  // Format slug to readable category (e.g., "hip-hop" -> "Hip Hop")
  const categoryName = params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <ConfettiBackground count={20} />
      
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <NeonHead text={`${categoryName} Articles`} color={MAG_COLORS.CY} size={32} />
          <MagPill text="CATEGORY FEED" bg={MAG_COLORS.PU} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GeoBlock bg="#1A1A2E" border={MAG_COLORS.GD} shape="tagR" height={120} label="LATEST DROP">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>The State of {categoryName} in 2026</h2>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Breaking down the latest moves on the charts.</p>
              </div>
              <Link href={`/magazine/article/state-of-${params.slug}`} style={{ textDecoration: 'none' }}>
                <MagButton label="READ" bg={MAG_COLORS.PK} />
              </Link>
            </div>
          </GeoBlock>

          <GeoBlock bg="#2D001A" border={MAG_COLORS.TL} shape="blob" height={120} label="SPOTLIGHT">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Top 5 {categoryName} Artists to Watch</h2>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>The rising stars dominating the index.</p>
              </div>
              <Link href={`/magazine/article/top-5-${params.slug}-artists`} style={{ textDecoration: 'none' }}>
                <MagButton label="READ" bg={MAG_COLORS.OR} />
              </Link>
            </div>
          </GeoBlock>
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/articles" style={{ textDecoration: 'none' }}>
            <MagButton label="← ALL ARTICLES" bg={MAG_COLORS.DT} border={MAG_COLORS.CY} />
          </Link>
        </div>
      </div>
    </main>
  );
}