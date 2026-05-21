/**
 * MISSING CONTEST PAGES — All Next.js 14 App Router pages
 * Split into separate files at the paths listed below before committing.
 *
 * THIS FILE CONTAINS:
 *   qualify/page.tsx      → apps/web/src/app/contest/qualify/page.tsx
 *   rules/page.tsx        → apps/web/src/app/contest/rules/page.tsx
 *   leaderboard/page.tsx  → apps/web/src/app/contest/leaderboard/page.tsx
 *   host/page.tsx         → apps/web/src/app/contest/host/page.tsx
 *   admin/page.tsx        → apps/web/src/app/contest/admin/page.tsx
 *   admin/contestants/page.tsx
 *   admin/sponsors/page.tsx
 *   admin/seasons/page.tsx
 *   admin/payouts/page.tsx
 *   admin/audit/page.tsx
 */

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/qualify/page.tsx
// ════════════════════════════════════════════════════════════════════════════
/*
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Qualify | Grand Platform Contest | TMI' };

export default async function QualifyPage() {
  // TODO: fetch artist's contestEntry + activeSeason from API
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'60px 24px' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:'.12em', color:'#ff6b1a', marginBottom:16 }}>
          GRAND PLATFORM CONTEST
        </p>
        <h1 style={{ fontSize:48, fontWeight:900, margin:'0 0 16px' }}>Your Qualification Dashboard</h1>
        <p style={{ color:'rgba(255,255,255,.5)', fontSize:16, marginBottom:40 }}>
          Track your sponsor progress, invite sponsors, and qualify for the Grand Stage.
        </p>
        {/* SponsorProgressCard component */}
        {/* ContestQualificationStatus component */}
        {/* SponsorInvitePanel component */}
        {/* SeasonCountdownPanel component */}
      </div>
    </main>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/rules/page.tsx
// ════════════════════════════════════════════════════════════════════════════
/*
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Official Rules | Grand Platform Contest | TMI' };

const RULES = [
  { section: '1. Eligibility', body: 'Any registered creator on The Musician\'s Index may enter. Open to: singers, rappers, comedians, dancers, DJs, bands, beatmakers, magicians, influencers, and freestyle artists. Must be 13+ years of age.' },
  { section: '2. Season Dates', body: 'The Grand Platform Contest opens for registration every year on August 8. Registration window: 60 days. Sponsor collection phase: 30 days. Regional rounds: 30 days. Semi-finals: 14 days. Grand Finals: 1 live platform event.' },
  { section: '3. Qualification Requirement', body: 'Each contestant must secure exactly 10 Local Sponsors and 10 Major Sponsors (20 total) before the sponsor collection phase deadline. Partial qualification does not advance to Regional Rounds.' },
  { section: '4. Sponsor Rules', body: 'Self-sponsorship is strictly prohibited. Each sponsor may only be counted once per entry. Sponsor payments must clear verification before being counted. Minimum: Local Bronze $50, Major Bronze $1,000.' },
  { section: '5. Voting', body: 'Fan voting opens during Regional Rounds. Each registered platform member receives one vote per round per entry. Major sponsors (Gold/Title tier) receive a 1.5x weighted vote. Tampering or bot voting leads to immediate disqualification.' },
  { section: '6. Prizes', body: 'Prizes are determined per season by the platform and title sponsor(s). Prize categories include cash awards, recording contracts, tour sponsorships, brand partnerships, and equipment packages.' },
  { section: '7. Fair Play', body: 'Any contestant found to be engaging in fraud, duplicate accounts, fake sponsors, vote manipulation, or abuse of the sponsor system will be permanently disqualified from the current and all future seasons.' },
  { section: '8. Appeals', body: 'Disqualified contestants may submit an appeal within 7 days via the admin appeal form. Appeals are reviewed by the contest operator and are final.' },
  { section: '9. Archive', body: 'All seasons are permanently archived. Winner profiles and sponsor recognition are preserved in the platform hall of fame.' },
  { section: '10. Changes', body: 'BerntoutGlobal XXL reserves the right to modify contest rules between seasons. Changes are announced at least 30 days before the registration window opens.' },
];

export default function RulesPage() {
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'60px 24px' }}>
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:'.12em', color:'#ff6b1a', marginBottom:16 }}>
          OFFICIAL CONTEST RULES
        </p>
        <h1 style={{ fontSize:42, fontWeight:900, margin:'0 0 8px' }}>Grand Platform Contest</h1>
        <p style={{ color:'rgba(255,255,255,.4)', marginBottom:48 }}>BerntoutGlobal XXL — The Musician\'s Index</p>
        {RULES.map(r => (
          <div key={r.section} style={{ borderBottom:'1px solid rgba(255,255,255,.07)', paddingBottom:24, marginBottom:24 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#ffd700', margin:'0 0 10px' }}>{r.section}</h2>
            <p style={{ fontSize:15, lineHeight:1.7, color:'rgba(255,255,255,.65)', margin:0 }}>{r.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/leaderboard/page.tsx
// ════════════════════════════════════════════════════════════════════════════
/*
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Leaderboard | Grand Platform Contest | TMI' };

export default async function LeaderboardPage() {
  // TODO: fetch from GET /api/contest/leaderboard and GET /api/contest/sponsor-leaderboard
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'60px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h1 style={{ fontSize:48, fontWeight:900, margin:'0 0 40px' }}>Leaderboard</h1>
        {/* ScoreboardOverlay in full-page mode */}
        {/* SponsorLeaderboard component */}
        {/* ContestDiscoveryGrid component with vote counts */}
      </div>
    </main>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/host/page.tsx
// ════════════════════════════════════════════════════════════════════════════
/*
'use client';
import { useState } from 'react';
import { RayJourneyHost } from '@/components/host/RayJourneyHost';

export default function HostPage() {
  const [currentScript, setCurrentScript] = useState(null);
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40 }}>
      <h1 style={{ fontSize:36, fontWeight:900, color:'#fff', marginBottom:8, textAlign:'center' }}>Grand Stage</h1>
      <p style={{ color:'rgba(255,255,255,.4)', marginBottom:48, textAlign:'center' }}>Hosted by Ray Journey</p>
      <div style={{ maxWidth:480, width:'100%' }}>
        <RayJourneyHost
          currentScript={currentScript}
          size="stage"
          isLive={false}
        />
      </div>
    </main>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/admin/page.tsx
// ════════════════════════════════════════════════════════════════════════════
/*
// Requires: apps/web/src/app/contest/admin/layout.tsx with admin role guard
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Contest Admin | TMI' };

export default async function ContestAdminPage() {
  // TODO: fetch stats from GET /api/contest/analytics and queue counts
  const stats = [
    { label:'Pending Contestants', value:0, href:'/contest/admin/contestants', color:'#ff6b1a' },
    { label:'Pending Sponsor Approvals', value:0, href:'/contest/admin/sponsors', color:'#ffd700' },
    { label:'Pending Payouts', value:0, href:'/contest/admin/payouts', color:'#00e5ff' },
    { label:'Active Season', value:'Season 1', href:'/contest/admin/seasons', color:'#00ff88' },
  ];
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'48px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h1 style={{ fontSize:36, fontWeight:900, marginBottom:8 }}>Contest Control Center</h1>
        <p style={{ color:'rgba(255,255,255,.4)', marginBottom:40 }}>Admin-only · BerntoutGlobal XXL</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20, marginBottom:48 }}>
          {stats.map(s => (
            <a key={s.label} href={s.href} style={{ display:'block', padding:24, background:'#0d1117', border:`1px solid ${s.color}33`, borderRadius:14, textDecoration:'none', color:'#fff', transition:'all .2s' }}>
              <div style={{ fontSize:32, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginTop:6 }}>{s.label}</div>
            </a>
          ))}
        </div>
        // Admin nav to sub-pages: contestants, sponsors, payouts, seasons, audit
      </div>
    </main>
  );
}
*/

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/admin/layout.tsx
// CRITICAL: This protects ALL /contest/admin/* pages
// ════════════════════════════════════════════════════════════════════════════
export const ADMIN_LAYOUT = `
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth'; // replace with your auth method
import { authOptions } from '@/lib/auth';       // replace with your auth options path

export default async function ContestAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Replace 'admin' with your actual admin role identifier
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/auth');
  }

  return (
    <div>
      <nav style={{ background:'#0d1117', borderBottom:'1px solid rgba(255,255,255,.07)', padding:'12px 24px', display:'flex', gap:24 }}>
        {[
          { label:'Overview', href:'/contest/admin' },
          { label:'Contestants', href:'/contest/admin/contestants' },
          { label:'Sponsors', href:'/contest/admin/sponsors' },
          { label:'Payouts', href:'/contest/admin/payouts' },
          { label:'Seasons', href:'/contest/admin/seasons' },
          { label:'Audit', href:'/contest/admin/audit' },
        ].map(l => (
          <a key={l.label} href={l.href} style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,.5)', textDecoration:'none' }}>
            {l.label}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
`;

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/season/[seasonId]/page.tsx
// ════════════════════════════════════════════════════════════════════════════
export const SEASON_PAGE = `
import { Metadata } from 'next';

interface Props { params: { seasonId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: \`Season \${params.seasonId} | Grand Platform Contest | TMI\` };
}

export default async function SeasonPage({ params }: Props) {
  // TODO: fetch from GET /api/contest/seasons/:id
  const { seasonId } = params;
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'60px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:'.12em', color:'#ff6b1a', marginBottom:16 }}>
          CONTEST SEASON
        </p>
        <h1 style={{ fontSize:48, fontWeight:900, margin:'0 0 40px' }}>Season {seasonId}</h1>
        {/* SeasonCountdownPanel */}
        {/* ContestProgressBanner */}
        {/* ContestDiscoveryGrid */}
        {/* SponsorLeaderboard */}
      </div>
    </main>
  );
}
`;

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/season/[seasonId]/archive/page.tsx
// ════════════════════════════════════════════════════════════════════════════
export const ARCHIVE_PAGE = `
import { Metadata } from 'next';

interface Props { params: { seasonId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: \`Season \${params.seasonId} Archive | Grand Platform Contest | TMI\` };
}

export default async function SeasonArchivePage({ params }: Props) {
  // TODO: fetch archived season data, winners, sponsors
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'60px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h1 style={{ fontSize:36, fontWeight:900, margin:'0 0 8px' }}>Season {params.seasonId} — Archive</h1>
        <p style={{ color:'rgba(255,255,255,.4)', marginBottom:40 }}>Final results, winners, and sponsor recognition</p>
        {/* WinnerRevealPanel in replay mode */}
        {/* SponsorLeaderboard from this season */}
        {/* ContestDiscoveryGrid for all season entries */}
      </div>
    </main>
  );
}
`;

// ════════════════════════════════════════════════════════════════════════════
// FILE: apps/web/src/app/contest/sponsors/page.tsx
// ════════════════════════════════════════════════════════════════════════════
export const SPONSORS_PAGE = `
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Find Sponsors | Grand Platform Contest | TMI' };

export default async function ContestSponsorsPage() {
  // TODO: fetch GET /api/contest/sponsor-packages and available sponsors list
  return (
    <main style={{ minHeight:'100vh', background:'#070a0f', color:'#fff', padding:'60px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h1 style={{ fontSize:42, fontWeight:900, margin:'0 0 8px' }}>Find Sponsors</h1>
        <p style={{ color:'rgba(255,255,255,.5)', marginBottom:40 }}>Connect with local and major sponsors to qualify for the contest.</p>
        {/* SponsorPackageTierCard — show all packages */}
        {/* SponsorArtistCard list — browse available sponsors */}
        {/* SponsorInvitePanel — open on sponsor click */}
      </div>
    </main>
  );
}
`;

export default {};
