'use client';

import Link from 'next/link';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

// Real counts from canonical magazine data — no fake incrementing counters (Rule 20)
const totalArticles = MAGAZINE_ISSUE_1.length;
const interviewCount = MAGAZINE_ISSUE_1.filter((a) => a.category === 'interview').length;
const reviewCount = MAGAZINE_ISSUE_1.filter((a) => a.category === 'review').length;
const featureCount = MAGAZINE_ISSUE_1.filter((a) => a.category === 'feature').length;

export default function Home2NewsDensityRail() {
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 10px' }}>
      <div style={{ border: '1px solid rgba(0,255,255,0.35)', borderRadius: 10, background: 'linear-gradient(165deg, rgba(8,16,36,0.94), rgba(5,5,16,0.96))', padding: '10px 12px', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Pill text='ARTICLES LIVE' color='#00FFFF' />
          {interviewCount > 0 && <Pill text='INTERVIEWS' color='#FF2DAA' />}
          {reviewCount > 0 && <Pill text='REVIEWS' color='#FFD700' />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <Stat label='Total Articles' value={totalArticles.toString()} color='#00FFFF' />
          {interviewCount > 0 && <Stat label='Interviews' value={interviewCount.toString()} color='#FF2DAA' />}
          {reviewCount > 0 && <Stat label='Reviews' value={reviewCount.toString()} color='#FFD700' />}
          {featureCount > 0 && <Stat label='Features' value={featureCount.toString()} color='#00FF88' />}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Jump href='/articles/news' label='News Desk' color='#00FFFF' />
          <Jump href='/articles?category=interview' label='Interviews' color='#FF2DAA' />
          <Jump href='/magazine' label='All Issues' color='#FFD700' />
        </div>
      </div>
    </section>
  );
}

function Pill({ text, color }: { text: string; color: string }) {
  return <span style={{ fontSize: 8, fontWeight: 800, color: '#050510', background: color, letterSpacing: '0.1em', borderRadius: 4, padding: '2px 6px' }}>{text}</span>;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ border: `1px solid ${color}55`, borderRadius: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 8, letterSpacing: '0.12em', fontWeight: 800, color }}>{label}</div><div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{value}</div></div>;
}

function Jump({ href, label, color }: { href: string; label: string; color: string }) {
  return <Link href={href} style={{ textDecoration: 'none', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color, border: `1px solid ${color}50`, borderRadius: 6, padding: '5px 8px' }}>{label}</Link>;
}
