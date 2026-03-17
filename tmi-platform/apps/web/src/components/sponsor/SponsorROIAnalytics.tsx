/**
 * SponsorROIAnalytics.tsx
 * Repo: apps/web/src/components/sponsor/SponsorROIAnalytics.tsx
 * Purpose: Sponsor analytics + ROI dashboard widget
 */
'use client';
import { TrendingUp, Eye, Mic2, BarChart2, DollarSign } from 'lucide-react';

interface SponsorROIAnalyticsProps {
  sponsorId: string;
  seasonName?: string;
  totalInvested: number;
  artistsSponsored: number;
  profileViews: number;
  stageMentions: number;
  overlayImpressions: number;
  estimatedReach: number;
  estimatedCPM?: number;
  onViewFullReport?: () => void;
}

function MetricCard({ icon, label, value, sub, color = '#ff6b1a' }: any) {
  return (
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:10, padding:'16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ color, opacity:.8 }}>{icon}</div>
        <span style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em' }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:900, color, letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export function SponsorROIAnalytics({
  totalInvested, artistsSponsored, profileViews, stageMentions,
  overlayImpressions, estimatedReach, estimatedCPM, onViewFullReport
}: SponsorROIAnalyticsProps) {
  const cpm = estimatedCPM ?? (overlayImpressions > 0 ? Math.round((totalInvested / overlayImpressions) * 1000 * 100) / 100 : 0);
  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,107,26,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h3 style={{ fontSize:18, fontWeight:700, color:'#ff6b1a', margin:'0 0 4px' }}>Sponsor Analytics</h3>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', margin:0 }}>Your contest investment performance</p>
        </div>
        {onViewFullReport && (
          <button onClick={onViewFullReport} style={{ padding:'8px 14px', background:'rgba(0,229,255,.08)', border:'1px solid rgba(0,229,255,.3)', borderRadius:8, color:'#00e5ff', fontSize:12, cursor:'pointer' }}>
            Full Report
          </button>
        )}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        <MetricCard icon={<DollarSign size={16}/>} label="Total Invested" value={`$${totalInvested.toLocaleString()}`} color="#ff6b1a" />
        <MetricCard icon={<BarChart2 size={16}/>} label="Artists Backed" value={artistsSponsored} color="#ffd700" />
        <MetricCard icon={<Eye size={16}/>} label="Profile Views" value={profileViews.toLocaleString()} color="#00e5ff" />
        <MetricCard icon={<Mic2 size={16}/>} label="Stage Mentions" value={stageMentions} color="#00ff88" />
        <MetricCard icon={<TrendingUp size={16}/>} label="Overlay Impressions" value={overlayImpressions.toLocaleString()} color="#ff6b1a" />
        <MetricCard icon={<TrendingUp size={16}/>} label="Est. CPM" value={`$${cpm}`} sub="per 1,000 impressions" color="#ffd700" />
      </div>
      <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'rgba(255,255,255,.5)' }}>Estimated Total Reach</span>
        <span style={{ fontSize:24, fontWeight:800, color:'#ffd700' }}>{estimatedReach.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── SponsorLeaderboard ───────────────────────────────────────────────────────
/**
 * SponsorLeaderboard.tsx
 * Repo: apps/web/src/components/sponsor/SponsorLeaderboard.tsx
 */
interface LeaderboardEntry {
  rank: number;
  sponsorId: string;
  sponsorName: string;
  sponsorLogo?: string;
  tier: string;
  artistsBacked: number;
  totalInvested: number;
  seasonName?: string;
}

interface SponsorLeaderboardProps {
  entries?: LeaderboardEntry[];
  title?: string;
  maxShow?: number;
  onViewSponsor?: (sponsorId: string) => void;
}

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

export function SponsorLeaderboard({ entries = [], title = 'Top Sponsors This Season', maxShow = 10, onViewSponsor }: SponsorLeaderboardProps) {
  const shown = entries.slice(0, maxShow);
  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,215,0,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:18, fontWeight:700, color:'#ffd700', margin:'0 0 20px' }}>{title}</h3>
      {shown.length === 0 ? (
        <p style={{ color:'rgba(255,255,255,.3)', textAlign:'center', padding:'24px 0' }}>No sponsor data yet for this season.</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {shown.map((entry, i) => {
            const rankColor = i < 3 ? RANK_COLORS[i] : 'rgba(255,255,255,.3)';
            return (
              <div key={entry.sponsorId} onClick={() => onViewSponsor?.(entry.sponsorId)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                background: i < 3 ? `${RANK_COLORS[i]}0a` : 'rgba(255,255,255,.03)',
                border: `1px solid ${i < 3 ? `${RANK_COLORS[i]}33` : 'rgba(255,255,255,.07)'}`,
                borderRadius:10, cursor: onViewSponsor ? 'pointer' : 'default', transition:'all .2s'
              }}>
                <span style={{ fontSize:18, fontWeight:900, color:rankColor, width:28, textAlign:'center', flexShrink:0 }}>#{entry.rank}</span>
                <div style={{ width:36, height:36, borderRadius:8, background:rgba(255,255,255,.08), display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:rankColor, overflow:'hidden', flexShrink:0 }}>
                  {entry.sponsorLogo ? <img src={entry.sponsorLogo} alt={entry.sponsorName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : entry.sponsorName[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{entry.sponsorName}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{entry.tier} · {entry.artistsBacked} artists</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:rankColor }}>${entry.totalInvested.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.3)' }}>invested</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function rgba(r: number, g: number, b: number, a: number) { return `rgba(${r},${g},${b},${a})`; }

export default SponsorROIAnalytics;
