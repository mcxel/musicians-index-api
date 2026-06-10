'use client';

import React from 'react';
import Link from 'next/link';
import { ConfettiBackground, GeoBlock, MagButton, MagPill, NeonHead, MAG_COLORS } from '@/components/ui/MagazineUI';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

const CAT_COLOR: Record<string, string> = {
  feature:   MAG_COLORS.PK,
  interview: MAG_COLORS.CY,
  review:    MAG_COLORS.PU,
  editorial: MAG_COLORS.GD,
  news:      MAG_COLORS.GN,
};

export default function ArticlesPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <ConfettiBackground count={15} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <NeonHead text="ALL ARTICLES" color={MAG_COLORS.CY} size={32} />
          <MagPill text={`${MAGAZINE_ISSUE_1.length} ARTICLES`} bg={MAG_COLORS.OR} />
        </div>

        {/* Article list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MAGAZINE_ISSUE_1.map((article) => {
            const accent = CAT_COLOR[article.category] ?? MAG_COLORS.CY;
            return (
              <GeoBlock
                key={article.slug}
                bg="#1A1A2E"
                border={accent}
                shape="tagR"
                height={120}
                label={article.category.toUpperCase()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{article.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                        {article.title}
                      </h2>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.4 }}>
                        {article.subtitle}
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, color: accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {article.category}
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>·</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{article.author}</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>·</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/magazine/article/${article.slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <MagButton label="READ" bg={accent} />
                  </Link>
                </div>
              </GeoBlock>
            );
          })}
        </div>

        {/* Back nav */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/magazine" style={{ textDecoration: 'none' }}>
            <MagButton label="← BACK TO MAGAZINE" bg={MAG_COLORS.DT} border={MAG_COLORS.CY} />
          </Link>
        </div>
      </div>
    </main>
  );
}
