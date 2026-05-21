/**
 * SponsorComponents.tsx — SPLIT INTO INDIVIDUAL FILES BEFORE COMMITTING
 * Contains: SponsorBadge, SponsorSplashCard, SponsorActivationButton,
 *           StageSponsorOverlay, PresentedBySlate, SponsorArtistCard,
 *           SponsorSpotlightCard, SponsorPackageSelector
 *
 * Repo paths (split each export into its own file):
 *   apps/web/src/components/sponsor/SponsorBadge.tsx
 *   apps/web/src/components/sponsor/SponsorSplashCard.tsx
 *   apps/web/src/components/sponsor/SponsorActivationButton.tsx
 *   apps/web/src/components/sponsor/StageSponsorOverlay.tsx
 *   apps/web/src/components/sponsor/PresentedBySlate.tsx
 *   apps/web/src/components/sponsor/SponsorArtistCard.tsx
 *   apps/web/src/components/sponsor/SponsorSpotlightCard.tsx
 *   apps/web/src/components/sponsor/SponsorPackageSelector.tsx
 */

'use client';
import { useState } from 'react';
import { Star, ExternalLink, Zap, Award, ChevronRight } from 'lucide-react';

// ─── SponsorBadge ─────────────────────────────────────────────────────────────
interface SponsorBadgeProps {
  name: string;
  logo?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'title';
  type: 'local' | 'major';
  size?: 'sm' | 'md' | 'lg';
}

const TIER_COLORS = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', title: '#00e5ff' };

export function SponsorBadge({ name, logo, tier, type, size = 'md' }: SponsorBadgeProps) {
  const color = TIER_COLORS[tier];
  const sz = { sm: 20, md: 28, lg: 36 }[size];
  const fs = { sm: 10, md: 12, lg: 14 }[size];
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap: 6, padding: size === 'sm' ? '3px 8px' : '5px 12px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 20 }}>
      <div style={{ width: sz, height: sz, borderRadius: '50%', background: `${color}22`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink: 0 }}>
        {logo ? <img src={logo} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize: sz * 0.5, fontWeight: 700, color }}>{name[0]}</span>}
      </div>
      <span style={{ fontSize: fs, fontWeight: 600, color, whiteSpace:'nowrap' }}>{name}</span>
      <span style={{ fontSize: fs - 2, color: `${color}88`, textTransform:'uppercase', letterSpacing:'0.06em' }}>{tier}</span>
    </div>
  );
}

// ─── SponsorSplashCard ───────────────────────────────────────────────────────
interface SponsorSplashCardProps {
  sponsorId: string;
  name: string;
  logo?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'title';
  tagline?: string;
  artistsSponsored?: number;
  industry?: string;
  onLearnMore?: () => void;
}

export function SponsorSplashCard({ name, logo, tier, tagline, artistsSponsored = 0, industry, onLearnMore }: SponsorSplashCardProps) {
  const color = TIER_COLORS[tier];
  return (
    <div className="splash-card" style={{ '--c': color } as any}>
      <div className="splash-banner" />
      <div className="splash-body">
        <div className="splash-logo">{logo ? <img src={logo} alt={name} /> : <span>{name[0]}</span>}</div>
        <div className="splash-tier">{tier.toUpperCase()} SPONSOR</div>
        <h3 className="splash-name">{name}</h3>
        {tagline && <p className="splash-tagline">{tagline}</p>}
        <div className="splash-stats">
          {industry && <span className="splash-chip">{industry}</span>}
          <span className="splash-chip">{artistsSponsored} artists backed</span>
        </div>
        {onLearnMore && (
          <button className="splash-cta" onClick={onLearnMore}>
            Learn More <ExternalLink size={13} />
          </button>
        )}
      </div>
      <style jsx>{`
        .splash-card { background: #0d1117; border: 1px solid var(--c, #ffd700)44; border-radius: 14px; overflow: hidden; position: relative; }
        .splash-banner { height: 60px; background: linear-gradient(135deg, #0d1117, var(--c, #ffd700)22); border-bottom: 1px solid var(--c, #ffd700)22; }
        .splash-body { padding: 16px 20px 20px; }
        .splash-logo { width: 56px; height: 56px; border-radius: 12px; background: var(--c, #ffd700)22; border: 2px solid var(--c, #ffd700)66; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--c, #ffd700); margin: -36px 0 12px; overflow: hidden; }
        .splash-logo img { width: 100%; height: 100%; object-fit: cover; }
        .splash-tier { font-size: 9px; font-weight: 700; letter-spacing: .12em; color: var(--c, #ffd700); margin-bottom: 4px; }
        .splash-name { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 6px; }
        .splash-tagline { font-size: 13px; color: rgba(255,255,255,.5); margin: 0 0 12px; }
        .splash-stats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .splash-chip { font-size: 11px; padding: 3px 10px; background: rgba(255,255,255,.06); border-radius: 20px; color: rgba(255,255,255,.6); }
        .splash-cta { display: flex; align-items: center; gap: 6px; padding: 9px 16px; background: var(--c, #ffd700)18; border: 1px solid var(--c, #ffd700)44; border-radius: 8px; color: var(--c, #ffd700); font-size: 13px; cursor: pointer; }
      `}</style>
    </div>
  );
}

// ─── SponsorActivationButton ─────────────────────────────────────────────────
interface SponsorActivationButtonProps {
  sponsorId: string;
  artistId: string;
  isActive?: boolean;
  packageLabel?: string;
  onActivate?: () => void;
}

export function SponsorActivationButton({ isActive = false, packageLabel = 'Sponsor', onActivate }: SponsorActivationButtonProps) {
  const [loading, setLoading] = useState(false);
  const handle = async () => { setLoading(true); await onActivate?.(); setLoading(false); };
  return (
    <button onClick={handle} disabled={loading || isActive} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
      background: isActive ? 'rgba(0,229,255,.1)' : 'linear-gradient(135deg,#ff6b1a,#ff8c42)',
      border: isActive ? '1px solid rgba(0,229,255,.4)' : 'none', borderRadius: 8,
      color: isActive ? '#00e5ff' : '#fff', fontSize: 14, fontWeight: 700, cursor: isActive ? 'default' : 'pointer', transition: 'all .2s'
    }}>
      {isActive ? <><Star size={15} /> Active Sponsor</> : <><Zap size={15} /> {loading ? 'Activating…' : `Become ${packageLabel}`}</>}
    </button>
  );
}

// ─── StageSponsorOverlay ─────────────────────────────────────────────────────
interface StageSponsorOverlayProps {
  sponsors: Array<{ name: string; logo?: string; tier: string }>;
  position?: 'lower-third' | 'top-banner' | 'corner';
  visible?: boolean;
}

export function StageSponsorOverlay({ sponsors, position = 'lower-third', visible = true }: StageSponsorOverlayProps) {
  if (!visible || !sponsors.length) return null;
  const posStyle: Record<string, any> = {
    'lower-third': { position:'absolute', bottom: 20, left: 20, right: 20 },
    'top-banner': { position:'absolute', top: 0, left: 0, right: 0 },
    'corner': { position:'absolute', bottom: 16, right: 16 },
  };
  return (
    <div style={{ ...posStyle[position], display:'flex', alignItems:'center', gap: 8, background:'rgba(10,13,20,.85)', backdropFilter:'blur(8px)', borderRadius: position === 'corner' ? 10 : 0, padding:'10px 16px', zIndex: 50, pointerEvents:'none' }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing:'.1em', color:'rgba(255,255,255,.4)', whiteSpace:'nowrap' }}>PRESENTED BY</span>
      {sponsors.slice(0,3).map((s,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap: 6, padding:'4px 10px', background:'rgba(255,255,255,.06)', borderRadius: 20 }}>
          {s.logo ? <img src={s.logo} alt={s.name} style={{ width:20, height:20, borderRadius:'50%', objectFit:'cover' }} /> : null}
          <span style={{ fontSize: 13, fontWeight: 600, color:'#fff' }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PresentedBySlate ─────────────────────────────────────────────────────────
interface PresentedBySlateProps {
  sponsorName: string;
  sponsorLogo?: string;
  performerName?: string;
  tier?: string;
}

export function PresentedBySlate({ sponsorName, sponsorLogo, performerName, tier = 'title' }: PresentedBySlateProps) {
  const color = TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#ffd700';
  return (
    <div style={{ textAlign:'center', padding:'20px 32px', background:`linear-gradient(135deg,#0a0d14,${color}11)`, border:`1px solid ${color}33`, borderRadius: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing:'.12em', color:`${color}88`, margin:'0 0 12px', textTransform:'uppercase' }}>
        {performerName ? `${performerName}'s performance is` : 'This performance is'} presented by
      </p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 12 }}>
        {sponsorLogo && <img src={sponsorLogo} alt={sponsorName} style={{ height: 40, objectFit:'contain' }} />}
        <span style={{ fontSize: 28, fontWeight: 900, color, letterSpacing:'-0.02em' }}>{sponsorName}</span>
      </div>
    </div>
  );
}

// ─── SponsorArtistCard ────────────────────────────────────────────────────────
interface SponsorArtistCardProps {
  artistName: string;
  artistAvatar?: string;
  category: string;
  localSponsors: number;
  majorSponsors: number;
  entryStatus: string;
  onSponsor?: () => void;
}

export function SponsorArtistCard({ artistName, artistAvatar, category, localSponsors, majorSponsors, entryStatus, onSponsor }: SponsorArtistCardProps) {
  const total = localSponsors + majorSponsors;
  const pct = Math.min((total / 20) * 100, 100);
  return (
    <div className="artist-card">
      <div className="a-avatar">{artistAvatar ? <img src={artistAvatar} alt={artistName} /> : <span>{artistName[0]}</span>}</div>
      <div className="a-info">
        <span className="a-name">{artistName}</span>
        <span className="a-cat">{category}</span>
        <div className="a-prog">
          <div className="prog-bar"><div className="prog-fill" style={{ width:`${pct}%` }} /></div>
          <span className="prog-txt">{total}/20 sponsors</span>
        </div>
      </div>
      <button className="a-btn" onClick={onSponsor}>Sponsor <ChevronRight size={13} /></button>
      <style jsx>{`
        .artist-card { display:flex; align-items:center; gap:12px; padding:14px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; color:#fff; }
        .a-avatar { width:44px; height:44px; border-radius:10px; background:rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; overflow:hidden; flex-shrink:0; }
        .a-avatar img { width:100%; height:100%; object-fit:cover; }
        .a-info { flex:1; }
        .a-name { display:block; font-size:14px; font-weight:600; margin-bottom:2px; }
        .a-cat { display:block; font-size:11px; color:rgba(255,255,255,.4); margin-bottom:8px; }
        .a-prog { display:flex; align-items:center; gap:8px; }
        .prog-bar { flex:1; height:4px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
        .prog-fill { height:100%; background:linear-gradient(90deg,#ff6b1a,#ffd700); border-radius:2px; transition:width .5s; }
        .prog-txt { font-size:10px; color:rgba(255,255,255,.4); white-space:nowrap; }
        .a-btn { display:flex; align-items:center; gap:4px; padding:8px 14px; background:rgba(255,107,26,.1); border:1px solid rgba(255,107,26,.3); border-radius:8px; color:#ff6b1a; font-size:12px; cursor:pointer; white-space:nowrap; }
      `}</style>
    </div>
  );
}

// ─── SponsorSpotlightCard ─────────────────────────────────────────────────────
interface SponsorSpotlightCardProps {
  sponsorName: string;
  sponsorLogo?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'title';
  tagline?: string;
  artistsSponsored: number;
  isFeatured?: boolean;
}

export function SponsorSpotlightCard({ sponsorName, sponsorLogo, tier, tagline, artistsSponsored, isFeatured }: SponsorSpotlightCardProps) {
  const color = TIER_COLORS[tier];
  return (
    <div style={{ background:`linear-gradient(135deg,#0d1117,${color}0a)`, border:`1px solid ${color}33`, borderRadius:14, padding:24, position:'relative', overflow:'hidden', color:'#fff' }}>
      {isFeatured && <div style={{ position:'absolute', top:0, right:20, background:color, color:'#000', fontSize:9, fontWeight:800, letterSpacing:'.1em', padding:'4px 10px', borderRadius:'0 0 6px 6px' }}>FEATURED</div>}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:`${color}22`, border:`2px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color, overflow:'hidden' }}>
          {sponsorLogo ? <img src={sponsorLogo} alt={sponsorName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : sponsorName[0]}
        </div>
        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', color:`${color}88`, marginBottom:3 }}>{tier.toUpperCase()} SPONSOR</div>
          <div style={{ fontSize:18, fontWeight:700 }}>{sponsorName}</div>
        </div>
      </div>
      {tagline && <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', margin:'0 0 14px' }}>{tagline}</p>}
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:`${color}` }}>
        <Award size={14} />
        {artistsSponsored} artists backed this season
      </div>
    </div>
  );
}

// ─── SponsorPackageSelector ───────────────────────────────────────────────────
const PACKAGES = [
  { id:'local-bronze', label:'Local Bronze', type:'local', price:50, tier:'bronze', desc:'Name on profile' },
  { id:'local-silver', label:'Local Silver', type:'local', price:100, tier:'silver', desc:'Name + logo on profile' },
  { id:'local-gold', label:'Local Gold', type:'local', price:250, tier:'gold', desc:'Logo + stage mention' },
  { id:'major-bronze', label:'Major Bronze', type:'major', price:1000, tier:'bronze', desc:'Logo + profile placement' },
  { id:'major-silver', label:'Major Silver', type:'major', price:5000, tier:'silver', desc:'Logo + stage overlay + analytics' },
  { id:'major-gold', label:'Major Gold', type:'major', price:10000, tier:'gold', desc:'All surfaces + priority mention' },
  { id:'title', label:'Title Sponsor', type:'major', price:25000, tier:'title', desc:'Full naming rights + exclusives' },
];

interface SponsorPackageSelectorProps {
  selectedId?: string;
  filterType?: 'local' | 'major' | 'all';
  onSelect?: (pkg: typeof PACKAGES[0]) => void;
}

export function SponsorPackageSelector({ selectedId, filterType = 'all', onSelect }: SponsorPackageSelectorProps) {
  const pkgs = filterType === 'all' ? PACKAGES : PACKAGES.filter(p => p.type === filterType);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
      {pkgs.map(pkg => {
        const color = TIER_COLORS[pkg.tier as keyof typeof TIER_COLORS];
        const sel = selectedId === pkg.id;
        return (
          <button key={pkg.id} onClick={() => onSelect?.(pkg)} style={{
            display:'flex', flexDirection:'column', gap:4, padding:'14px 16px',
            background: sel ? `${color}18` : 'rgba(255,255,255,.03)',
            border: `1px solid ${sel ? color : 'rgba(255,255,255,.08)'}`,
            borderRadius:10, cursor:'pointer', textAlign:'left', transition:'all .2s',
            boxShadow: sel ? `0 0 0 2px ${color}44` : 'none', color:'#fff'
          }}>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', color:`${color}88` }}>{pkg.type.toUpperCase()}</span>
            <span style={{ fontSize:13, fontWeight:600 }}>{pkg.label}</span>
            <span style={{ fontSize:20, fontWeight:900, color }}>${pkg.price.toLocaleString()}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{pkg.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
