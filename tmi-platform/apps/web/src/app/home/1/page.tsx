'use client';

import Link from 'next/link';
import { Exo_2, Orbitron, Anton } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';
import styles from './Home1.module.css';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-orbitron' });
const exo2 = Exo_2({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], variable: '--font-exo' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' });

type LeftPanelCard = {
  label: string;
  detail: string;
  stat: string;
  accent: string;
};

type RightPanelRow = {
  rank: string;
  name: string;
  genre: string;
  value: string;
  tone: string;
  live?: boolean;
};

type RightPanelCardProgress = {
  title: string;
  detail: string;
  progress: number;
  accent: string;
};

type RightPanelCardResult = {
  title: string;
  detail: string;
  result: string;
};

type RightPanelSection = {
  label: string;
  title: string;
  subtitle: string;
  rows?: RightPanelRow[];
  cards?: Array<RightPanelCardProgress | RightPanelCardResult>;
  action: string;
};

type LeftPanelSection = {
  label: string;
  title: string;
  subtitle: string;
  cards: LeftPanelCard[];
  action: string;
};

const NAV_ITEMS = [
  { label: '1', href: '/home/1' },
  { label: '1-2', href: '/home/1-2' },
  { label: '2', href: '/home/2' },
  { label: '3', href: '/home/3' },
  { label: '4', href: '/home/4' },
  { label: '5', href: '/home/5' },
];

const LEFT_PANEL_SECTIONS = [
  {
    label: 'PROMO',
    title: 'FREE PROMOTION',
    subtitle: 'Artists — claim your free spotlight slot',
    cards: [
      { label: 'Lagos Burst', detail: 'Afrobeat · 6h left', stat: '▲ 2,140', accent: 'var(--pink)' },
      { label: 'Nova Laugh', detail: 'Comedy · 14h left', stat: '▲ 980', accent: 'var(--cyan)' },
      { label: 'BEBA Flow', detail: 'Trap · 8h left', stat: '▲ 540', accent: 'var(--gold)' },
    ],
    action: 'Claim Free Slot',
  },
  {
    label: 'VENUE',
    title: 'VENUE BOOKING',
    subtitle: 'Open dates — book your performance',
    cards: [
      { label: 'SAT · Main Arena', detail: '18,500 capacity', stat: 'BOOK', accent: 'var(--amber)' },
      { label: 'SUN · Theater', detail: '2,730 capacity', stat: 'BOOK', accent: 'var(--green)' },
      { label: 'MON · Club Stage', detail: '420 capacity', stat: 'BOOK', accent: 'var(--cyan)' },
    ],
    action: 'Browse All Dates',
  },
  {
    label: 'ADS',
    title: 'AD SPACES',
    subtitle: 'Premium placements — 9,200+ daily views',
    cards: [
      { label: 'Homepage Banner', detail: '$120/day', stat: 'HOT', accent: 'var(--red)' },
      { label: 'Arena Sidebar', detail: '$80/day', stat: 'OPEN', accent: 'var(--cyan)' },
      { label: 'Lobby Wall', detail: '$60/day', stat: 'OPEN', accent: 'var(--gold)' },
    ],
    action: 'Buy Ad Slot',
  },
];

const RIGHT_PANEL_SECTIONS: RightPanelSection[] = [
  {
    label: 'RANKS',
    title: 'LIVE RANKINGS',
    subtitle: 'Top performers pushing the crown',
    rows: [
      { rank: '1', name: 'Astra Nova', genre: 'R&B', value: '+34%', tone: 'var(--pink)', live: true },
      { rank: '2', name: 'Prism Vex', genre: 'EDM', value: '+22%', tone: 'var(--gold)' },
      { rank: '3', name: 'Zion Freq', genre: 'Gospel', value: '+15%', tone: 'var(--green)' },
      { rank: '4', name: 'Flex King', genre: 'Dance', value: '+9%', tone: 'var(--cyan)' },
      { rank: '5', name: 'Song Challenge', genre: 'Hip-Hop', value: '▼2%', tone: 'var(--amber)' },
      { rank: '6', name: 'Main Lobby', genre: 'Various', value: '—', tone: 'rgba(255,255,255,.45)' },
      { rank: '7', name: 'Battle Floor', genre: 'LIVE', value: '+6%', tone: 'var(--red)', live: true },
      { rank: '8', name: 'Lagos Burst', genre: 'Afrobeat', value: '+3%', tone: 'var(--gold)' },
      { rank: '9', name: 'Nova Laugh', genre: 'Comedy', value: '+1%', tone: 'var(--cyan)' },
      { rank: '10', name: 'Dance Crew', genre: 'Dance', value: '—', tone: 'var(--pink)' },
    ],
    action: 'Full Leaderboard',
  },
  {
    label: 'ADS',
    title: 'ADVERTISER',
    subtitle: 'Active campaigns running now',
    cards: [
      { title: 'Beats By TMX', detail: 'Season 1 Official Partner', progress: 72, accent: 'var(--cyan)' },
      { title: 'BerntoutStudio AI', detail: 'Make beats with AI · Free trial', progress: 45, accent: 'var(--gold)' },
    ],
    action: 'Advertise Here',
  },
  {
    label: 'PROMO',
    title: 'PROMOTERS',
    subtitle: 'Top promoters driving traffic now',
    cards: [
      { title: 'Promo_Jay', detail: '12 events', result: '$2.4K' },
      { title: 'EventKing', detail: '8 events', result: '$1.8K' },
      { title: 'NightOwl', detail: '6 events', result: '$980' },
    ],
    action: 'Become a Promoter',
  },
];

const UNDERLAY_PANELS = [
  {
    background: '#FFD700',
    headerBg: '#FF1493',
    headerText: "THE MUSICIAN'S INDEX · VOL.1 · WEEK 25 · $4.99",
    title: 'WHO TOOK THE CROWN?',
    badgeLabel: 'COVER PERFORMER',
    badgeItem: 'BIG ACE',
    footer: 'STREAM & WIN RADIO · BATTLE TONIGHT 8PM',
  },
  {
    background: '#FF1493',
    headerBg: '#000',
    headerText: 'TMI · HIP-HOP EDITION · BATTLE NIGHT',
    title: 'BATTLE NIGHT CHAMPION',
    badgeLabel: 'WAVETEK',
    badgeItem: '47 WINS · HIP-HOP',
    footer: 'JOIN THE BATTLE · ENTER YOUR SONG',
  },
  {
    background: '#00BFFF',
    headerBg: '#000',
    headerText: 'TMI CYPHER EDITION · OPEN MIC LIVE',
    title: "WHO'S GOT THE BARS?",
    badgeLabel: 'NOVA CIPHER',
    badgeItem: 'CYPHER ARENA · 841 WATCHING',
    footer: 'OPEN MIC ALL DAY · ROTATE THROUGH',
  },
  {
    background: '#000',
    headerBg: '#FFD700',
    headerText: 'TMI CHALLENGE ARENA · SONG VS SONG',
    title: 'CHALLENGE THE CROWN',
    badgeLabel: 'BEAT THE BEAT',
    badgeItem: 'ARENA SEATS 18,500 · JOIN NOW FREE',
    footer: 'WINNER STAYS · RUNS ALL DAY · NONSTOP',
  },
];

const ORBIT_NODES = [
  { label: '#1', name: 'ASTRA NOVA', genre: 'R&B', color: 'var(--pink)', style: { top: 16, left: 142, width: 76, transform: 'translateX(-50%)' } },
  { label: '#2', name: 'PRISM VEX', genre: 'EDM', color: 'var(--gold)', style: { top: 52, right: 24, width: 76, transform: 'translateX(50%)' } },
  { label: '#3', name: 'ZION FREQ', genre: 'Gospel', color: 'var(--green)', style: { top: 128, right: 10, width: 76, transform: 'translateX(50%)' } },
  { label: '#4', name: 'FLEX KING', genre: 'Dance', color: 'var(--cyan)', style: { bottom: 66, right: 18, width: 76, transform: 'translateX(50%)' } },
  { label: '#5', name: 'SONG CHALL.', genre: 'Hip-Hop', color: 'var(--purple)', style: { bottom: 18, left: 176, width: 76, transform: 'translateX(-50%)' } },
  { label: '#6', name: 'MAIN LOBBY', genre: 'Various', color: 'var(--amber)', style: { bottom: 18, left: 130, width: 76, transform: 'translateX(-50%)' } },
  { label: '#7', name: 'BATTLE FLOOR', genre: 'LIVE', color: 'var(--red)', style: { bottom: 66, left: 10, width: 76, transform: 'translateX(-50%)' } },
  { label: '#8', name: 'LAGOS BURST', genre: 'Afrobeat', color: 'var(--gold)', style: { top: 128, left: 10, width: 76, transform: 'translateX(-50%)' } },
  { label: '#9', name: 'NOVA LAUGH', genre: 'Comedy', color: 'var(--cyan)', style: { top: 52, left: 24, width: 76, transform: 'translateX(-50%)' } },
  { label: '#10', name: 'DANCE CREW', genre: 'Dance', color: 'var(--pink)', style: { top: 16, left: 116, width: 76, transform: 'translateX(-50%)' } },
];

export default function Home1Page() {
  const [votes, setVotes] = useState(4948);
  const [watching, setWatching] = useState(9282);
  const [tips, setTips] = useState(4200);
  const [leftTab, setLeftTab] = useState(0);
  const [rightTab, setRightTab] = useState(0);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [underlayDirection, setUnderlayDirection] = useState<'left' | 'right'>('left');

  useEffect(() => {
    const timer = setInterval(() => {
      setVotes((value) => value + Math.floor(Math.random() * 8) + 2);
      setWatching((value) => Math.max(8500, value + Math.floor((Math.random() - 0.35) * 40)));
      setTips((value) => value + Math.floor(Math.random() * 18));
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const tipText = useMemo(() => (tips >= 1000 ? `$${(tips / 1000).toFixed(1)}K` : `$${tips}`), [tips]);
  const leftSection = LEFT_PANEL_SECTIONS[leftTab];
  const rightSection = RIGHT_PANEL_SECTIONS[rightTab];

  return (
    <main className={`${styles.root} ${orbitron.variable} ${exo2.variable} ${anton.variable}`}>
      <div className={styles.betaBar}>
        <div>✦ TMI BETA SEASON</div>
        <div>Founding Beta Member · Purchases & unlocks persist permanently</div>
        <div>DETAILS →</div>
      </div>

      <div className={styles.topBar}>
        <div className={styles.brand}>TMI</div>
        <div className={styles.navButtons}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={styles.tmiBtn}
              style={{
                background: item.label === '1' ? 'var(--pink)' : 'rgba(255,255,255,.08)',
                color: item.label === '1' ? '#fff' : 'rgba(255,255,255,.5)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.authControls}>
          <Link href="/login" className={styles.tmiBtn} style={{ color: 'rgba(255,255,255,.9)' }}>Log In</Link>
          <Link href="/signup" className={`${styles.tmiBtn} ${styles.tmiBtnPink}`}>Sign Up</Link>
        </div>
      </div>

      <section className={styles.magHeader}>
        <div className={styles.magHeaderRow}>
          <div className={styles.liveBadge}><span className={styles.liveDot} />VOTING LIVE</div>
          <div className={styles.votesBadge}>{votes.toLocaleString()} VOTES</div>
          <div className={styles.updateBadge}>CROWN UPDATING</div>
        </div>
        <div className={styles.magHeadline}>THE MUSICIAN&apos;S INDEX</div>
        <div className={styles.magTypewriter}><span>MAGAZINE</span></div>
        <div className={styles.magCaption}>LAYERCANVAS DESIGN MODE · HOME 1 ONLY</div>
        <div className={styles.magActions}>
          {['JOIN FREE', 'LOGIN', 'CHALLENGE SONG', 'CYPHER ARENA', 'MAGAZINE', 'SPONSOR', 'ADVERTISE'].map((label) => (
            <button key={label} className={styles.actionButton}>{label}</button>
          ))}
        </div>
      </section>

      <section className={styles.orbitalSection}>
        <div className={styles.underlayControl}>
          <button className={styles.underlayArrow} onClick={() => setUnderlayDirection('right')} aria-label="Scroll underlay right">◀</button>
          <div className={styles.underlayLabel}>UNDERLAY</div>
          <button className={styles.underlayArrow} onClick={() => setUnderlayDirection('left')} aria-label="Scroll underlay left">▶</button>
        </div>

        <div className={styles.underlayViewport}>
          <div className={`${styles.underlayTrack} ${underlayDirection === 'left' ? styles.goLeft : styles.goRight}`}>
            {[...UNDERLAY_PANELS, ...UNDERLAY_PANELS].map((panel, index) => (
              <div key={`${panel.title}-${index}`} className={styles.magPanel} style={{ background: panel.background }}>
                <div className={styles.magPanelHeader} style={{ background: panel.headerBg }}>{panel.headerText}</div>
                <div className={styles.magPanelBody}>
                  <div className={styles.magPanelTitle}>{panel.title}</div>
                  <div className={styles.magPanelBadge}>{panel.badgeLabel}</div>
                  <div className={styles.magPanelSub}>{panel.badgeItem}</div>
                </div>
                <div className={styles.magPanelFooter}>{panel.footer}</div>
              </div>
            ))}
          </div>

          <div className={styles.underlayVignette} />
          <div className={styles.underlayGlow} />

          <div className={styles.mainOrbitLayout}>
            <div className={styles.panelGroup}>
              <div className={styles.panelWrapper} style={{ width: leftOpen ? 170 : 0 }}>
                <div className={styles.panelShell}>
                  <div className={styles.panelTabs}>
                    {LEFT_PANEL_SECTIONS.map((section, index) => (
                      <button
                        key={section.label}
                        className={styles.panelTab}
                        onClick={() => setLeftTab(index)}
                        style={{
                          background: leftTab === index ? (index === 0 ? 'rgba(255,45,170,.25)' : index === 1 ? 'rgba(255,140,0,.2)' : 'rgba(0,229,255,.15)') : 'rgba(255,255,255,.06)',
                          color: leftTab === index ? (index === 0 ? 'var(--pink)' : index === 1 ? 'var(--amber)' : 'var(--cyan)') : 'rgba(255,255,255,.45)',
                        }}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.panelContent}>
                    <div className={styles.panelTitle}>{leftSection.title}</div>
                    <div className={styles.panelSubtitle}>{leftSection.subtitle}</div>
                    {leftSection.cards.map((card) => (
                      <div key={card.label} className={styles.panelCard}>
                        <div>
                          <div className={styles.panelCardLabel}>{card.label}</div>
                          <div className={styles.panelCardDetail}>{card.detail}</div>
                        </div>
                        <div className={styles.panelCardAction} style={{ color: card.accent }}>{card.stat}</div>
                      </div>
                    ))}
                    <button className={styles.panelAction}>{leftSection.action}</button>
                  </div>
                </div>
              </div>
              <button className={`${styles.toggleTab} ${styles.toggleTabLeft}`} onClick={() => setLeftOpen((value) => !value)}>
                {leftOpen ? '◂ PANEL' : '▸ PANEL'}
              </button>
            </div>

            <div className={styles.orbitShell}>
              <div className={styles.orbitHeader}>
                <div className={styles.orbitHeadline}>WEEKLY CROWN ORBIT</div>
                <div className={styles.orbitSubhead}>TOP RANKED · LIVE NOW · REAL TIME</div>
              </div>
              <svg viewBox="0 0 360 360" className={styles.orbitSvg} aria-hidden="true">
                <circle cx="180" cy="180" r="170" className={styles.orbitRingStroke} />
                <circle cx="180" cy="180" r="148" className={styles.orbitDotRing} />
                <circle cx="180" cy="180" r="98" className={styles.orbitDotRingSecondary} />
                <circle cx="180" cy="180" r="66" className={styles.orbitCoreRing} />
                <circle cx="180" cy="180" r="62" className={styles.orbitCoreStroke} />
              </svg>
              <div className={styles.orbitRingLayer}>
                {ORBIT_NODES.map((node) => (
                  <div key={node.label} className={styles.orbitNode} style={node.style}>
                    <div className={styles.orbitNodeCard} style={{ borderColor: node.color }}>
                      <div className={styles.orbitNodeRank}>{node.label}</div>
                      <div className={styles.orbitNodeName}>{node.name}</div>
                      <div className={styles.orbitNodeGenre}>{node.genre}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.centerHub}>
                <div className={styles.centerHubLabel}>HOME 1/6</div>
                <div className={styles.centerHubName}>ASTRA<br />NOVA</div>
                <div className={styles.centerHubMeta}>R&B · LIVE NOW</div>
                <span className={styles.liveDot}></span>
              </div>
            </div>

            <div className={styles.panelGroupReverse}>
              <button className={`${styles.toggleTab} ${styles.toggleTabRight}`} onClick={() => setRightOpen((value) => !value)}>
                {rightOpen ? '▸ PANEL' : '◂ PANEL'}
              </button>
              <div className={styles.panelWrapper} style={{ width: rightOpen ? 170 : 0 }}>
                <div className={styles.panelShell} style={{ borderColor: 'rgba(255, 215, 0, 0.35)' }}>
                  <div className={styles.panelTabs}>
                    {RIGHT_PANEL_SECTIONS.map((section, index) => (
                      <button
                        key={section.label}
                        className={styles.panelTab}
                        onClick={() => setRightTab(index)}
                        style={{
                          background: rightTab === index ? (index === 0 ? 'rgba(255,215,0,.25)' : index === 1 ? 'rgba(255,140,0,.2)' : 'rgba(255,45,170,.2)') : 'rgba(255,255,255,.06)',
                          color: rightTab === index ? (index === 0 ? 'var(--gold)' : index === 1 ? 'var(--amber)' : 'var(--pink)') : 'rgba(255,255,255,.45)',
                        }}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.panelContent}>
                    <div className={styles.panelTitle}>{rightSection.title}</div>
                    <div className={styles.panelSubtitle}>{rightSection.subtitle}</div>
                    {rightSection.rows ? (
                      rightSection.rows.map((row) => (
                        <div key={row.rank} className={styles.rankRow}>
                          <span className={styles.rankIndex} style={{ color: row.tone }}>{row.rank}</span>
                          <div className={styles.rankInfo}>
                            <div className={styles.rankName}>{row.name}{row.live ? <span className={styles.liveDotSmall}></span> : null}</div>
                            <div className={styles.rankGenre}>{row.genre}</div>
                          </div>
                          <span className={styles.rankValue} style={{ color: row.value.startsWith('▼') ? 'var(--red)' : 'var(--green)' }}>{row.value}</span>
                        </div>
                      ))
                    ) : (
                      rightSection.cards?.map((card) => (
                        <div key={card.title} className={styles.cardRow}>
                          <div>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={styles.cardDetail}>{card.detail}</div>
                          </div>
                          {'progress' in card ? (
                            <div className={styles.cardProgress}>
                              <div className={styles.cardProgressBar} style={{ width: `${card.progress}%`, background: card.accent }} />
                              <div className={styles.cardProgressLabel}>{card.progress}%</div>
                            </div>
                          ) : (
                            <div className={styles.cardResult}>{card.result}</div>
                          )}
                        </div>
                      ))
                    )}
                    <button className={styles.panelAction}>{rightSection.action}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mainNavButtons}>
            <button className={styles.navChip}>◀ BACK</button>
            <button className={styles.navChip}>NEXT ▶</button>
          </div>
        </div>
      </section>

      <section className={styles.bottomCta}>
        <div className={styles.bottomRow}>
          <button className={styles.ctaPrimary}>JOIN TMI</button>
          <button className={styles.ctaSecondary}>READ MAGAZINE</button>
        </div>
        <div className={styles.bottomRow}>
          <button className={styles.ctaAccent}>VOTE LIVE</button>
          <button className={styles.ctaAccent}>JOIN BATTLE</button>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statsBox}><div className={styles.statsLabel}>LIVE</div><div className={styles.statsValue}>11</div></div>
          <div className={styles.statsBox}><div className={styles.statsLabel}>WATCHING</div><div className={styles.statsValue}>{watching.toLocaleString()}</div></div>
          <div className={styles.statsBox}><div className={styles.statsLabel}>TIPS</div><div className={styles.statsValue}>{tipText}</div></div>
          <div className={styles.statsBox}><div className={styles.statsLabel}>VOTES</div><div className={styles.statsValue}>{votes.toLocaleString()}</div></div>
        </div>
      </section>

      <div className={styles.bottomNav}>
        <div className={styles.footerButtons}>
          <button className={styles.navBtn}>SIGN IN</button>
          <button className={styles.navBtn}>+ SUBMIT</button>
        </div>
        <div className={styles.liveSummary}><span className={styles.liveDot}></span>11 VENUES LIVE</div>
        <div className={styles.footerButtons}>
          <button className={styles.navBtnOutline}>OPEN GUIDE</button>
          <button className={styles.navBtnOutlineDanger}>BETA FEEDBACK</button>
        </div>
      </div>
    </main>
  );
}
