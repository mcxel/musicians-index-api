'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import styles from './Home12.module.css';
import { getLatestEditorialArticles } from '@/lib/editorial/NewsArticleModel';
import { fetchTrendingArtists, type TrendingArtist } from '@/lib/api/homepage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';

const SEED_SPONSORS = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',     tagline: 'Platinum Partner' },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',      tagline: 'Gold Partner'    },
  { id: 'velocity',  name: 'VELOCITY AUDIO',       tagline: 'Gold Partner'    },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',     tagline: 'Silver Partner'  },
  { id: 'crown',     name: 'CROWN & CO.',          tagline: ''                },
  { id: 'frequency', name: 'FREQUENCY LABS',       tagline: ''                },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE', tagline: ''                },
  { id: 'sonic',     name: 'SONIC AXIS',           tagline: ''                },
];

// 45 categories — all performer types + audience-side verticals
const CATEGORIES = [
  'Hip Hop',       'R&B',           'Pop',           'EDM',           'Gospel',
  'Rap',           'Soul',          'Funk',          'Jazz',          'Blues',
  'Rock',          'Metal',         'Latin',         'Reggae',        'Afrobeats',
  'Dancehall',     'Country',       'Folk',          'Indie',         'Alternative',
  'Classical',     'Opera',         'Spoken Word',   'Poetry Slam',   'Stand-Up Comedy',
  'Improv Comedy', 'Sketch Comedy', 'Dance Crews',   'Ballet',        'Hip Hop Dance',
  'Popping/Locking','Breakdance',   'DJs',           'Turntablists',  'Beat Producers',
  'Instrumentalists','Bands',       'Groups',        'A Cappella',    'Choirs',
  'Magicians',     'Actors',        'Spoken Artists','Venues',        'Promoters',
];

// Color theme per category index — cycles through TMI palette
const CAT_THEMES = [
  { accent: '#FF2DAA', glow: '#FF2DAA44', badge: '#AA2DFF' },
  { accent: '#00FFFF', glow: '#00FFFF44', badge: '#FF2DAA' },
  { accent: '#FFD700', glow: '#FFD70044', badge: '#00FFFF' },
  { accent: '#AA2DFF', glow: '#AA2DFF44', badge: '#FFD700' },
  { accent: '#00FF88', glow: '#00FF8844', badge: '#FF2DAA' },
];

function getTheme(catIndex: number) {
  return CAT_THEMES[catIndex % CAT_THEMES.length];
}

type BillboardCard = {
  id: string;
  name: string;
  profileImageUrl: string;
  city: string;
  countryName: string;
  flag: string;
  category: string;
  rank: number;
  fanCount: number;
  likes: number;
  isLive: boolean;
  tier: string;
  audienceCount: number;
  timeLive: string;
};

const FALLBACK_NAMES = [
  'Nova Cipher', 'Verse.XL', 'FlowState.J', 'Ari Volt', 'Punchline.K',
  'BarGod.T', 'Vocab.X', 'Ray Journey', 'DJ Apex', 'Lyric.M',
  'SoulFire', 'Echo.Prime',
];

const CITIES = [
  { city: 'Atlanta, GA', country: 'United States', flag: '🇺🇸' },
  { city: 'London, UK',  country: 'United Kingdom', flag: '🇬🇧' },
  { city: 'Tokyo, JP',   country: 'Japan',          flag: '🇯🇵' },
  { city: 'Los Angeles', country: 'United States',  flag: '🇺🇸' },
  { city: 'Toronto, CA', country: 'Canada',         flag: '🇨🇦' },
  { city: 'Lagos, NG',   country: 'Nigeria',        flag: '🇳🇬' },
  { city: 'Paris, FR',   country: 'France',         flag: '🇫🇷' },
  { city: 'Miami, FL',   country: 'United States',  flag: '🇺🇸' },
];

const TIERS = ['RUBY', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const buildFallback = (category: string): BillboardCard[] =>
  Array.from({ length: 12 }).map((_, i) => {
    const loc = CITIES[i % CITIES.length];
    return {
      id: `${category.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      name: FALLBACK_NAMES[i % FALLBACK_NAMES.length],
      profileImageUrl: `https://i.pravatar.cc/400?u=${encodeURIComponent(category)}-${i}`,
      city: loc.city,
      countryName: loc.country,
      flag: loc.flag,
      category,
      rank: i + 1,
      fanCount: 4000 + i * 1800,
      likes: 6000 + i * 2300,
      isLive: i % 3 !== 0,
      tier: TIERS[i % TIERS.length],
      audienceCount: 800 + i * 640,
      timeLive: `${5 + i * 7}m`,
    };
  });

function mapTrending(category: string, rows: TrendingArtist[] | null): BillboardCard[] {
  if (!rows || rows.length === 0) return buildFallback(category);
  return rows.slice(0, 12).map((r, i) => {
    const loc = CITIES[i % CITIES.length];
    return {
      id: r.id || `${category}-${i}`,
      name: r.stageName || FALLBACK_NAMES[i % FALLBACK_NAMES.length],
      profileImageUrl: r.image || `https://i.pravatar.cc/400?u=${encodeURIComponent(r.slug ?? `${i}`)}`,
      city: loc.city,
      countryName: loc.country,
      flag: loc.flag,
      category: r.genres?.[0] || category,
      rank: i + 1,
      fanCount: Math.max(2000, r.followers || 0),
      likes: Math.max(1500, r.views || 0),
      isLive: i % 3 !== 0,
      tier: TIERS[i % TIERS.length],
      audienceCount: Math.max(600, Math.floor((r.views || 0) / 4)),
      timeLive: `${5 + i * 7}m`,
    };
  });
}

function BillboardPortraitCard({
  item,
  theme,
}: {
  item: BillboardCard;
  theme: { accent: string; glow: string; badge: string };
}) {
  const tierColors: Record<string, string> = {
    Diamond: '#00FFFF', Platinum: '#E5E4E2', Gold: '#FFD700',
    Silver: '#C0C0C0', RUBY: '#E0115F', // Ruby color for RUBY tier
  };
  const tierColor = tierColors[item.tier] || '#fff';

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${theme.accent}33`,
        background: 'rgba(5,5,16,0.85)',
        boxShadow: `0 0 20px ${theme.glow}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${theme.glow}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${theme.glow}`;
      }}
    >
      {/* Portrait image — 4:5 aspect ratio */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
        <img
          src={item.profileImageUrl}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />

        {/* Rank badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: `${theme.accent}DD`,
          color: '#000',
          fontWeight: 900,
          fontSize: 11,
          padding: '3px 7px',
          borderRadius: 4,
          fontFamily: 'var(--font-orbitron, monospace)',
          letterSpacing: '0.05em',
        }}>
          #{item.rank}
        </div>

        {/* Tier badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.75)',
          color: tierColor,
          fontWeight: 800,
          fontSize: 9,
          padding: '3px 7px',
          borderRadius: 4,
          border: `1px solid ${tierColor}55`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {item.tier === 'RUBY' ? 'Ruby' : item.tier}
        </div>

        {/* Live indicator */}
        {item.isLive && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.8)',
            color: '#00FF88',
            fontWeight: 800,
            fontSize: 9,
            padding: '3px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            letterSpacing: '0.05em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            LIVE
          </div>
        )}

        {/* Audience count overlay */}
        {item.isLive && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: 4,
          }}>
            👁 {item.audienceCount.toLocaleString()}
          </div>
        )}

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '40%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Card footer */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-orbitron, monospace)',
            fontWeight: 900,
            fontSize: 11,
            color: theme.accent,
            letterSpacing: '0.04em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '65%',
          }}>
            {item.name}
          </span>
          <span style={{ fontSize: 14 }}>{item.flag}</span>
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>
          {item.city}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.accent}22`, paddingTop: 5, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
            ❤ <strong style={{ color: '#fff' }}>{(item.fanCount / 1000).toFixed(1)}k</strong>
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
            👍 <strong style={{ color: '#fff' }}>{(item.likes / 1000).toFixed(1)}k</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home12Page() {
  const [catIndex, setCatIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState<BillboardCard[]>(() => buildFallback(CATEGORIES[0]));
  const [transitioning, setTransitioning] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<UniversalRoom | null>(null);

  const advanceCat = useCallback((dir: 1 | -1) => {
    setTransitioning(true);
    setTimeout(() => {
      setCatIndex(prev => (prev + dir + CATEGORIES.length) % CATEGORIES.length);
      setTransitioning(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => advanceCat(1), 8000);
    return () => clearInterval(timer);
  }, [isPaused, advanceCat]);

  const currentCategory = CATEGORIES[catIndex];
  const theme = getTheme(catIndex);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rows = await fetchTrendingArtists(12);
      if (!alive) return;
      setItems(mapTrending(currentCategory, rows));
    })();
    return () => { alive = false; };
  }, [currentCategory]);

  const latestNews = getLatestEditorialArticles(5);
  const tickerStr = latestNews.map(a => `[${a.category.toUpperCase()}] ${a.headline}`).join('  ⚡  ');

  // 3D Page Turn Engine Initialization
  useEffect(() => {
    let autoTurnInterval: NodeJS.Timeout;
    
    function initEngine() {
      const THREE = (window as any).THREE;
      if (!THREE) return;

      const wrapEl = document.getElementById('tmi-3d-wrap');
      const c3d = document.getElementById('tmi-3d-canvas');
      if (!wrapEl || !c3d || c3d.children.length > 0) return;

      function setLoad(p: number, m?: string){
        const f = document.getElementById('tmi-3d-lf');
        const s = document.getElementById('tmi-3d-ls');
        if(f) f.style.width = p + '%';
        if(s && m) s.textContent = m;
      }

      const W = wrapEl.clientWidth || 680, H = 580;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050508);
      const camera = new THREE.PerspectiveCamera(40, W/H, 0.01, 50);
      camera.position.set(0, 0.42, 4.3);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      c3d.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.36));
      const kl = new THREE.DirectionalLight(0xfff2e0, 1.55);
      kl.position.set(3, 9, 8); kl.castShadow = true; scene.add(kl);
      const fl = new THREE.DirectionalLight(0x8899cc, 0.38);
      fl.position.set(-4, 3, 5); scene.add(fl);

      const SPREADS = [
        {left:{type:'ic'},right:{type:'cover'}},
        {left:{type:'sec',title:'TOP TEN',accent:'#00FFFF',bg:'#04101e',sub:'GLOBAL DIRECTORY',
          body:'The Index provides the most comprehensive ranking of live performers. Track the Top 10 in every genre. See who is live now.'},
         right:{type:'sec',title:'LIVE VENUES',accent:'#FFD700',bg:'#031218',sub:'BOOK DIRECTLY',
          body:'Browse open slots. Secure a venue. Artists and promoters can instantly lock dates on the TMI Network.'}},
        {left:{type:'sec',title:'AD SPACES',accent:'#FF2DAA',bg:'#0a0b1a',sub:'PREMIUM PROMO',
          body:'Boost your profile. Buy ad slots on the Live Wall or Sidebar. Reach 18,000+ viewers daily.'},
         right:{type:'back'}}
      ];

      function mkTex(d: any){
        const C = 1024, H_tex = 1400, cv = document.createElement('canvas');
        cv.width = C; cv.height = H_tex; const g = cv.getContext('2d')!;
        function wt(txt: string, x: number, y: number, mw: number, lh: number){
          g.textBaseline = 'top';
          const ws = txt.split(' ');
          let ln = '';
          for(let i=0; i<ws.length; i++){
            const t = ln + ws[i] + ' ';
            if(g.measureText(t).width > mw && ln){ g.fillText(ln.trim(), x, y); y += lh; ln = ws[i] + ' '; }
            else ln = t;
          }
          if(ln.trim()) g.fillText(ln.trim(), x, y);
        }

        if(d.type==='cover'){
          const bg = g.createLinearGradient(0,0,C,H_tex); bg.addColorStop(0,'#07041c'); bg.addColorStop(1,'#0a0520');
          g.fillStyle = bg; g.fillRect(0,0,C,H_tex);
          g.strokeStyle = 'rgba(0,255,255,0.05)'; g.lineWidth = 1;
          for(let x=0; x<C; x+=68){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H_tex); g.stroke(); }
          for(let y=0; y<H_tex; y+=68){ g.beginPath(); g.moveTo(0,y); g.lineTo(C,y); g.stroke(); }
          g.fillStyle = '#FF6B00'; g.fillRect(0,0,C,12);
          g.save(); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
          g.shadowColor = '#FF6B00'; g.shadowBlur = 60; g.fillStyle = '#FF6B00'; g.font = 'bold 178px Arial';
          g.fillText('TMI', C/2, 268); g.shadowBlur = 0; g.restore();
          g.fillStyle = 'rgba(255,255,255,0.88)'; g.font = '300 27px Arial'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
          g.fillText("THE MUSICIAN'S INDEX", C/2, 322);
          g.strokeStyle = 'rgba(255,107,0,0.32)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(100,348); g.lineTo(C-100,348); g.stroke();
          g.fillStyle = 'rgba(0,255,255,0.72)'; g.font = '300 18px Arial';
          g.fillText('ISSUE 001  ·  VOL. 2  ·  THE DIRECTORY', C/2, 380);
          const bars = 44, bw = 8, sp = 4, tx = (C-bars*(bw+sp))/2;
          for(let i=0; i<bars; i++){
            const bh = 48+Math.sin(i*0.55+1)*88+Math.sin(i*0.22)*38;
            g.fillStyle = 'rgba(0,255,255,'+(0.45+0.55*(i/bars)).toFixed(2)+')';
            g.fillRect(tx+i*(bw+sp), 680-bh/2, bw, bh);
          }
          const hl = g.createRadialGradient(C/2,680,20,C/2,680,300);
          hl.addColorStop(0,'rgba(0,255,255,0.13)'); hl.addColorStop(1,'transparent');
          g.fillStyle = hl; g.beginPath(); g.arc(C/2,680,300,0,Math.PI*2); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.18)'; g.font = '300 14px Arial';
          g.fillText('TOP TEN  ·  LIVE VENUES  ·  AD SPACES', C/2, 1100);
          g.fillStyle = 'rgba(0,255,255,0.58)'; g.font = '400 17px Arial';
          g.fillText('BERNTOUTGLOBAL XXL', C/2, 1358);
          g.fillStyle = 'rgba(255,255,255,0.11)';
          for(let i=0; i<26; i++){ const bh = 14+(i%3)*7; g.fillRect(786+i*5, 1334-bh, 3, bh); }
          g.fillStyle = '#FF6B00'; g.fillRect(0, H_tex-12, C, 12);
        } else if(d.type==='ic'){
          const bg2 = g.createLinearGradient(0,0,C,H_tex); bg2.addColorStop(0,'#0d0d26'); bg2.addColorStop(1,'#060618');
          g.fillStyle = bg2; g.fillRect(0,0,C,H_tex);
          g.fillStyle = 'rgba(0,255,255,0.07)';
          for(let x=70; x<C; x+=80) for(let y=70; y<H_tex; y+=80){ g.beginPath(); g.arc(x,y,1.5,0,Math.PI*2); g.fill(); }
          g.fillStyle = 'rgba(0,255,255,0.08)'; g.fillRect(C-72, 0, 72, H_tex);
          g.fillStyle = 'rgba(0,255,255,0.22)'; g.font = '300 15px Arial'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
          g.fillText("THE MUSICIAN'S INDEX", C/2, H_tex-62);
        } else if(d.type==='sec'){
          g.fillStyle = d.bg||'#040810'; g.fillRect(0,0,C,H_tex);
          g.strokeStyle = (d.accent||'#FF6B00')+'12'; g.lineWidth = 1;
          for(let x=0; x<C; x+=80){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H_tex); g.stroke(); }
          g.fillStyle = d.accent; g.fillRect(0,0,8,H_tex); g.fillRect(0,0,C,7);
          g.fillStyle = d.accent+'cc'; g.font = 'bold 13px Arial'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
          g.fillText('· '+d.title, 58, 70);
          g.save(); g.shadowColor = d.accent; g.shadowBlur = 32; g.fillStyle = d.accent; g.font = 'bold 84px Arial';
          g.fillText(d.title, 54, 222); g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.fillText(d.title, 54, 222); g.restore();
          g.fillStyle = 'rgba(255,255,255,0.42)'; g.font = '300 20px Arial'; g.fillText(d.sub||'', 54, 260);
          g.strokeStyle = d.accent+'3a'; g.lineWidth = 1; g.beginPath(); g.moveTo(54,287); g.lineTo(C-54,287); g.stroke();
          g.fillStyle = 'rgba(255,255,255,0.65)'; g.font = '300 21px Arial';
          wt(d.body||'', 54, 320, C-120, 39);
          const rc = g.createRadialGradient(C-180, H_tex-325, 0, C-180, H_tex-325, 305);
          rc.addColorStop(0, d.accent+'18'); rc.addColorStop(1,'transparent');
          g.fillStyle = rc; g.beginPath(); g.arc(C-180, H_tex-325, 305, 0, Math.PI*2); g.fill();
          g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,0.14)'; g.font = '300 14px Arial';
          g.fillText('TMI', C-44, H_tex-46);
        } else {
          const bg3 = g.createLinearGradient(0,0,C,H_tex); bg3.addColorStop(0,'#050508'); bg3.addColorStop(1,'#080518');
          g.fillStyle = bg3; g.fillRect(0,0,C,H_tex);
          g.strokeStyle = 'rgba(0,255,255,0.04)'; g.lineWidth = 1;
          for(let x=0; x<C; x+=72){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H_tex); g.stroke(); }
          for(let y=0; y<H_tex; y+=72){ g.beginPath(); g.moveTo(0,y); g.lineTo(C,y); g.stroke(); }
          g.fillStyle = '#FF6B00'; g.fillRect(0, H_tex-12, C, 12); g.fillRect(0,0,C,12);
          g.textAlign = 'center'; g.textBaseline = 'alphabetic';
          g.save(); g.shadowColor = '#FF6B00'; g.shadowBlur = 30; g.fillStyle = '#FF6B00'; g.font = 'bold 54px Arial';
          g.fillText('BERNTOUTGLOBAL', C/2, H_tex/2-22); g.shadowBlur = 0; g.restore();
          g.fillStyle = 'rgba(255,255,255,0.42)'; g.font = '300 18px Arial';
          g.fillText('XXL · ENTERTAINMENT · TECHNOLOGY', C/2, H_tex/2+25);
          g.fillStyle = 'rgba(0,255,255,0.3)'; g.font = '300 13px Arial';
          g.fillText('Stream & Win · WillDoIt · HotScreens · Thunder World', C/2, H_tex/2+82);
          g.fillText("Rent-A-Charge · Danika's Law · BerntoutStudio AI", C/2, H_tex/2+112);
          g.fillStyle = 'rgba(255,255,255,0.08)';
          for(let i=0; i<30; i++){ const bh = 16+(i*7%14); g.fillRect(C/2-76+i*5, H_tex-118-bh, 3, bh); }
        }
        return new THREE.CanvasTexture(cv);
      }

      setLoad(15,'BAKING TEXTURES');
      const TEX: Record<string, any> = {};
      const defs: any[] = []; SPREADS.forEach(s => { defs.push(s.left, s.right); });
      defs.forEach(d => { const k = JSON.stringify(d); if(!TEX[k]) TEX[k] = mkTex(d); });
      function gT(d: any) { return TEX[JSON.stringify(d)]; }
      setLoad(78,'BUILDING GEOMETRY');

      const PW = 1.0, PH = 1.35, GAP = 0.018, SD = 0.11, SEG = 72, TOTAL = SPREADS.length;
      const book = new THREE.Group();
      book.rotation.x = -0.13; book.position.y = -0.08; scene.add(book);

      const flr = new THREE.Mesh(new THREE.PlaneGeometry(10,8), new THREE.MeshStandardMaterial({color:0x050510, roughness:0.98}));
      flr.rotation.x = -Math.PI/2; flr.position.y = -PH/2-0.01; flr.receiveShadow = true; book.add(flr);

      function flatGeo() { return new THREE.PlaneGeometry(PW,PH,1,1); }
      function curlGeo() {
        const g = new THREE.PlaneGeometry(PW,PH,SEG,1);
        const pos = g.attributes.position;
        for(let i=0; i<pos.count; i++) pos.setX(i, pos.getX(i)+0.5);
        pos.needsUpdate = true; return g;
      }

      const leftMat = new THREE.MeshStandardMaterial({roughness:0.84, metalness:0});
      const rightMat = new THREE.MeshStandardMaterial({roughness:0.84, metalness:0});
      const leftMesh = new THREE.Mesh(flatGeo(), leftMat);
      const rightMesh = new THREE.Mesh(flatGeo(), rightMat);
      leftMesh.position.x = -PW/2-GAP/2; rightMesh.position.x = PW/2+GAP/2;
      [leftMesh, rightMesh].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
      book.add(leftMesh); book.add(rightMesh);

      const VS = "uniform float uP; uniform float uDir; varying vec2 vUv; varying float vZ; void main(){ vUv=uv; vec3 p=position; float ox=position.x; float theta=uP*3.14159265; float lag=ox*sin(theta)*0.72; float a=clamp(theta-lag,0.0,3.14159265); float sx=uDir>0.0?1.0:-1.0; p.x=sx*ox*cos(a); p.z=ox*sin(a)*0.52; vZ=p.z; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }";
      const FS = "uniform sampler2D uFront; uniform sampler2D uBack; uniform float uDir; varying vec2 vUv; varying float vZ; void main(){ bool front; if(uDir>0.0){front=gl_FrontFacing;} else{front=!gl_FrontFacing;} vec4 c; if(front){c=texture2D(uFront,vUv);} else{c=texture2D(uBack,vec2(1.0-vUv.x,vUv.y));} float ao=smoothstep(0.0,0.09,vUv.x); c.rgb*=0.58+0.42*ao; c.rgb*=max(0.18,1.0-vZ*1.38); c.rgb+=vec3(vZ*0.08); gl_FragColor=c; }";

      const turnMat = new THREE.ShaderMaterial({
        vertexShader:VS, fragmentShader:FS,
        uniforms:{uP:{value:0},uDir:{value:1},uFront:{value:null},uBack:{value:null}},
        side:THREE.DoubleSide
      });
      const turnMesh = new THREE.Mesh(curlGeo(), turnMat);
      turnMesh.position.x = GAP/2; turnMesh.position.z = 0.003;
      turnMesh.renderOrder = 1; turnMesh.visible = false; turnMesh.castShadow = true; book.add(turnMesh);

      const sMat = new THREE.MeshStandardMaterial({color:0xd2d2d2, roughness:0.92});
      const stackR = new THREE.Mesh(new THREE.BoxGeometry(PW,PH,SD), sMat);
      const stackL = new THREE.Mesh(new THREE.BoxGeometry(PW,PH,SD), sMat);
      stackR.position.set(PW/2+GAP/2, 0, -SD/2); stackL.position.set(-PW/2-GAP/2, 0, -SD/2);
      book.add(stackR); book.add(stackL);

      const spineMsh = new THREE.Mesh(new THREE.BoxGeometry(GAP*2.5,PH,SD), new THREE.MeshStandardMaterial({color:0x1a1a2e, roughness:0.88}));
      spineMsh.position.z = -SD/2; book.add(spineMsh);
      const spineShad = new THREE.Mesh(new THREE.PlaneGeometry(0.22,PH), new THREE.MeshBasicMaterial({color:0, transparent:true, opacity:0.3, depthWrite:false}));
      spineShad.position.z = 0.001; book.add(spineShad);

      let idx = 0, animActive = false, animP = 0, animVel = 0, pendingDir = 1;

      function updateStacks(){
        const rR = Math.max(0.04, (TOTAL-1-idx)/TOTAL);
        const lR = Math.max(0.04, idx/TOTAL);
        stackR.scale.z = rR; stackR.position.z = -SD/2*rR;
        stackL.scale.z = lR; stackL.position.z = -SD/2*lR;
      }

      function applySpread(i: number){
        const s = SPREADS[i];
        leftMat.map = gT(s.left); leftMat.needsUpdate = true;
        rightMat.map = gT(s.right); rightMat.needsUpdate = true;
      }

      function startTurn(dir: number){
        if(animActive) return;
        let next = idx + dir;
        if(next < 0) next = TOTAL - 1; 
        if(next >= TOTAL) next = 0; 
        animActive = true; animP = 0; animVel = 0; pendingDir = dir;
        const cur = SPREADS[idx], nxt = SPREADS[next];
        if(dir > 0){
          turnMat.uniforms.uDir.value = 1;
          turnMat.uniforms.uFront.value = gT(cur.right);
          turnMat.uniforms.uBack.value = gT(nxt.left);
          turnMesh.position.x = GAP/2;
          rightMesh.visible = false;
          rightMat.map = gT(nxt.right); rightMat.needsUpdate = true;
        }else{
          turnMat.uniforms.uDir.value = -1;
          turnMat.uniforms.uFront.value = gT(cur.left);
          turnMat.uniforms.uBack.value = gT(nxt.right);
          turnMesh.position.x = -GAP/2;
          leftMesh.visible = false;
          leftMat.map = gT(nxt.left); leftMat.needsUpdate = true;
        }
        turnMesh.visible = true;
      }

      function finishTurn(){
        idx += pendingDir;
        if(idx < 0) idx = TOTAL - 1;
        if(idx >= TOTAL) idx = 0;
        applySpread(idx); updateStacks();
        turnMesh.visible = false;
        leftMesh.visible = true; rightMesh.visible = true;
        animActive = false; animP = 0;
        updateUI();
      }

      function tickAnim(){
        if(!animActive) return;
        animVel = animVel*0.78 + (1-animP)*0.108;
        animP += animVel;
        if(animP >= 0.998){ animP = 1; turnMat.uniforms.uP.value = 1; finishTurn(); return; }
        turnMat.uniforms.uP.value = animP;
      }

      function updateUI(){
        const pi = document.getElementById('tmi-3d-pi');
        if(pi) pi.textContent = 'SPREAD '+(idx+1)+' / '+TOTAL;
        const dotsEl = document.getElementById('tmi-3d-dots');
        if(dotsEl){
          dotsEl.querySelectorAll('.tmi-3d-dot').forEach((d,i) => {
            d.classList.toggle('active', i === idx);
          });
        }
      }

      const dotsEl = document.getElementById('tmi-3d-dots');
      if(dotsEl) {
        dotsEl.innerHTML = '';
        SPREADS.forEach((_, i) => {
          const d = document.createElement('div');
          d.className = 'tmi-3d-dot' + (i === 0 ? ' active' : '');
          d.onclick = () => { if(!animActive && i !== idx) startTurn(i > idx ? 1 : -1); };
          dotsEl.appendChild(d);
        });
      }

      const bn = document.getElementById('tmi-3d-bn');
      if(bn) bn.onclick = () => startTurn(1);
      const bp = document.getElementById('tmi-3d-bp');
      if(bp) bp.onclick = () => startTurn(-1);

      let mx=0, my=0;
      document.addEventListener('mousemove', (e) => {
        const r = wrapEl.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });

      setLoad(95, 'READY');
      applySpread(0); updateStacks(); updateUI();

      setTimeout(() => {
        const load = document.getElementById('tmi-3d-load');
        if(load) {
          load.style.opacity = '0';
          setTimeout(() => { load.style.display = 'none'; }, 550);
        }
      }, 220);

      // Auto turn every 45 seconds for Home 1-2
      autoTurnInterval = setInterval(() => {
        if (!animActive) startTurn(1);
      }, 45000);

      const clock = new THREE.Clock();
      function renderLoop(){
        requestAnimationFrame(renderLoop);
        const t = clock.getElapsedTime();
        camera.position.x += (mx*0.13 - camera.position.x)*0.022;
        camera.position.y += (-my*0.065 + 0.42 - camera.position.y)*0.022;
        camera.lookAt(0,0,0);
        book.rotation.z = Math.sin(t*0.38)*0.004;
        book.position.y = -0.08 + Math.sin(t*0.5)*0.004;
        tickAnim();
        renderer.render(scene, camera);
      }
      renderLoop();
    }

    // Load ThreeJS
    if (!(window as any).THREE) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = initEngine;
      document.head.appendChild(script);
    } else {
      initEngine();
    }

    return () => {
      if (autoTurnInterval) clearInterval(autoTurnInterval);
    };
  }, []);

  return (
    <main className={styles.root} style={{ background: '#050510', minHeight: '100vh' }}>
      {pendingRoom && <LobbyEntryFlow room={pendingRoom} onClose={() => setPendingRoom(null)} />}
      {/* Background */}
      <div className={styles.underlay} style={{
        backgroundImage: 'url("/tmi-source/_converted_webp_all/Tmi Homepage 1-2.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: 0.5,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 40%, ${theme.glow}, transparent 60%)`, transition: 'background 1s' }} />
      </div>

      {/* Top nav */}
      <div className={styles.topBar}>
        <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 900, color: theme.accent, transition: 'color 0.5s', textShadow: `0 0 12px ${theme.glow}` }}>
          TMI BILLBOARD WORLD
        </div>
        <div className={styles.navButtons}>
          {['1', '1-2', '2', '3', '4', '5'].map(n => (
            <Link key={n} href={`/home/${n}`} className={styles.tmiBtn} style={n === '1-2' ? { color: theme.accent, borderColor: theme.accent, background: `${theme.accent}15` } : {}}>
              {n}
            </Link>
          ))}
        </div>
      </div>

      {/* News ticker */}
      <div className={styles.tickerWrap}>
        <div className={styles.tickerInner}>
          {tickerStr}  ⚡  TMI BILLBOARD WORLD — {CATEGORIES.length} CATEGORIES  ⚡  GLOBAL RANKINGS LIVE
        </div>
      </div>

      <SponsorRail sponsors={SEED_SPONSORS} zone="home-1-2-top" />

      {/* BILLBOARD LIVE WALL — canonical home/1-2 channel identity */}
      <div style={{ position: 'relative', zIndex: 10, padding: '12px 0 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 11, fontWeight: 900, color: theme.accent, letterSpacing: '0.3em', textTransform: 'uppercase', textShadow: `0 0 14px ${theme.glow}` }}>
            ● GLOBAL BILLBOARD — LIVE RANKINGS
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', marginTop: 3 }}>
            TOP PERFORMERS · LIVE NOW · RISING ARTISTS
          </div>
        </div>
        <BillboardLiveWall mode="home" maxTiles={18} showActions />
      </div>

      {/* Main content */}
      <div
        style={{ position: 'relative', zIndex: 10, paddingTop: 90 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Category selector */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 10, flexWrap: 'wrap', padding: '0 24px' }}>
          <button
            onClick={() => advanceCat(-1)}
            style={{ background: 'transparent', border: `1px solid ${theme.accent}55`, borderRadius: 6, color: theme.accent, padding: '8px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontWeight: 700, letterSpacing: '0.1em' }}
          >
            ‹ PREV
          </button>
          <h2 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 'clamp(14px, 3vw, 22px)',
            fontWeight: 900,
            color: theme.accent,
            textShadow: `0 0 20px ${theme.glow}`,
            letterSpacing: '0.1em',
            margin: 0,
            textTransform: 'uppercase',
            transition: 'color 0.4s, text-shadow 0.4s',
          }}>
            [{currentCategory}]
          </h2>
          <button
            onClick={() => advanceCat(1)}
            style={{ background: 'transparent', border: `1px solid ${theme.accent}55`, borderRadius: 6, color: theme.accent, padding: '8px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-orbitron)', fontWeight: 700, letterSpacing: '0.1em' }}
          >
            NEXT ›
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap', padding: '0 24px 20px', maxWidth: 1100, margin: '0 auto' }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => { setCatIndex(i); setTransitioning(false); }, 150);
              }}
              style={{
                background: i === catIndex ? `${theme.accent}22` : 'transparent',
                border: `1px solid ${i === catIndex ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20,
                color: i === catIndex ? theme.accent : 'rgba(255,255,255,0.45)',
                fontSize: 9,
                fontWeight: i === catIndex ? 800 : 500,
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portrait card grid */}
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px 60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(22px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        }}>
          {items.map(item => item.isLive ? (
            <button
              key={item.id}
              onClick={() => setPendingRoom({
                id: `${item.id}-live`,
                title: item.name,
                viewers: item.audienceCount,
                status: 'live',
                access: (item.tier === 'Diamond' || item.tier === 'Platinum' || item.tier === 'Gold') ? 'vip' : 'free',
                accentColor: theme.accent,
                roomRoute: `/live/rooms/${encodeURIComponent(item.id)}-live?from=billboard`,
                venueIndex: 0,
                shape: 'hex',
              })}
              style={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block' }}
              aria-label={`Join live room for ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </button>
          ) : (
            <Link
              key={item.id}
              href={`/performers/${encodeURIComponent(item.id)}`}
              style={{ textDecoration: 'none' }}
              aria-label={`Open performer ${item.name}`}
            >
              <BillboardPortraitCard item={item} theme={theme} />
            </Link>
          ))}
        </div>
      </div>
      <EventReel zone="home-1-2" />
    </main>
  );
}
