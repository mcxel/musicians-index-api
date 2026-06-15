/**
 * Performer Article Page
 *
 * ROUTE:  /articles/performer/[slug]/page.tsx
 * PLACE:  apps/web/src/app/articles/performer/[slug]/page.tsx
 *
 * Every orbit card on Home1CoverPage links here.
 * The page renders a full editorial article for that performer.
 * Writers can populate real content via the admin writer portal.
 * Until then it uses seeded data + XP earn on scroll.
 */

import Link from 'next/link';
import { Metadata } from 'next';

// ─── Performer database (mirrors Home1CoverPage) ──────────────────────────────

interface PerformerArticle {
  slug: string;
  name: string;
  emoji: string;
  genre: string;
  rank: number;
  score: number;
  accentColor: string;
  tagline: string;
  bio: string;
  highlights: string[];
  quote: string;
  stats: { label: string; value: string }[];
}

const PERFORMERS: Record<string, PerformerArticle> = {
  'big-ace': {
    slug: 'big-ace', name: 'Big Ace', emoji: '🎤', genre: 'Hip-Hop', rank: 1, score: 9840,
    accentColor: '#FFD700',
    tagline: 'The crown didn\'t come easy.',
    bio: 'Big Ace built his following one cypher at a time. From Atlanta freestyle battles to the TMI Arena, he refined every bar, every breath, every pivot until the crown was inevitable. Rick Ross meets André 3000? That\'s what fans say. Punchlines that hit hard, grooves that make you move.',
    highlights: ['3-week crown streak', '47 cypher wins this season', 'Sponsored by 7 brands', 'Top 10 globally in Hip-Hop'],
    quote: '"The arena is alive. You feel every vote. Every tip lands different when the room is watching."',
    stats: [
      { label: 'Rank', value: '#1 Hip-Hop' },
      { label: 'TMI Score', value: '9,840' },
      { label: 'Cyphers Won', value: '47' },
      { label: 'Active Sponsors', value: '7' },
    ],
  },
  'lani-flame': {
    slug: 'lani-flame', name: 'Lani Flame', emoji: '🔥', genre: 'R&B', rank: 1, score: 9210,
    accentColor: '#FF2DAA',
    tagline: 'Fire in every note.',
    bio: 'Lani Flame doesn\'t just sing — she commands rooms. Her R&B sets on TMI have consistently drawn the highest tip counts in the genre, with fans citing her ability to shift the energy of an entire lobby wall with a single run. She\'s the benchmark.',
    highlights: ['R&B crown holder 5 weeks running', '28 live sessions this month', 'Highest tip count R&B division'],
    quote: '"I don\'t compete with other artists. I compete with the silence before I start."',
    stats: [
      { label: 'Rank', value: '#1 R&B' },
      { label: 'TMI Score', value: '9,210' },
      { label: 'Live Sessions', value: '28' },
      { label: 'Tip Rate', value: '$12.40 avg' },
    ],
  },
  'dj-blend': {
    slug: 'dj-blend', name: 'DJ Blend', emoji: '🎧', genre: 'EDM', rank: 1, score: 9100,
    accentColor: '#00C8FF',
    tagline: 'Every set is a broadcast.',
    bio: 'DJ Blend turned his bedroom setup into a broadcast studio. His EDM sets on TMI pull consistent 1,200+ viewer peaks, and his Cypher DJ sessions have become the default soundtrack for battle rooms across the platform. The drop never hits the same way twice.',
    highlights: ['1,200+ avg viewers per set', 'Most requested DJ for battles', '14 sponsor placements active'],
    quote: '"The crowd tells you what to play. You just have to listen harder than they can dance."',
    stats: [
      { label: 'Rank', value: '#1 EDM' },
      { label: 'TMI Score', value: '9,100' },
      { label: 'Avg Viewers', value: '1,204' },
      { label: 'Sponsors', value: '14' },
    ],
  },
  'bobby-stanley': {
    slug: 'bobby-stanley', name: 'Bobby Stanley', emoji: '🎙️', genre: 'Rap', rank: 1, score: 8960,
    accentColor: '#39FF14',
    tagline: 'The host who became the headliner.',
    bio: 'Bobby Stanley started on TMI as a game show host for Deal or Feud 1000 and Name That Tune. Then one night he jumped on a cypher mic. Nobody expected what happened next. Three seasons later he\'s the Rap crown holder and still hosts Tuesday game nights.',
    highlights: ['Dual role: rapper + game show host', 'Deal or Feud 1000 creator', '2 crown reigns in 1 year'],
    quote: '"One host. A thousand players. Infinite deals."',
    stats: [
      { label: 'Rank', value: '#1 Rap' },
      { label: 'TMI Score', value: '8,960' },
      { label: 'Shows Hosted', value: '140+' },
      { label: 'Crown Wins', value: '2' },
    ],
  },
};

// Fallback for any slug without specific data
function buildFallback(slug: string): PerformerArticle {
  const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    slug, name, emoji: '🎤', genre: 'TMI', rank: 0, score: 0,
    accentColor: '#00FFFF',
    tagline: `${name} is building something in the Arena.`,
    bio: `${name} joined The Musician's Index and hasn't looked back. Every session adds to their story. Follow their journey in the Index.`,
    highlights: ['Active TMI performer', 'Building their audience', 'Available for sponsorship'],
    quote: '"The arena changes you. You just have to show up."',
    stats: [
      { label: 'Status', value: 'Active' },
      { label: 'Genre', value: 'TMI' },
    ],
  };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = PERFORMERS[params.slug] ?? buildFallback(params.slug);
  return {
    title: `${p.name} — ${p.genre} · The Musician's Index`,
    description: p.tagline,
    openGraph: {
      title: `${p.name} ${p.emoji} — TMI`,
      description: p.bio.slice(0, 160),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerformerArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const p = PERFORMERS[params.slug] ?? buildFallback(params.slug);
  const ac = p.accentColor;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0a0614 0%, #050310 100%)',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Sticky nav ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10,6,20,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${ac}22`,
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/home/1"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${ac}14`,
            border: `1px solid ${ac}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: ac,
            fontSize: 13,
          }}
        >
          ⌂
        </Link>
        <Link
          href="/articles"
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: `${ac}88`,
            textDecoration: 'none',
            letterSpacing: '0.1em',
          }}
        >
          ← ALL ARTICLES
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: ac,
              background: `${ac}14`,
              border: `1px solid ${ac}33`,
              borderRadius: 12,
              padding: '3px 10px',
              letterSpacing: '0.08em',
            }}
          >
            {p.emoji} {p.genre}
          </span>
          {p.rank > 0 && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#FFD700',
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: 12,
                padding: '3px 10px',
              }}
            >
              #{p.rank}
            </span>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* ── Hero ── */}
        <div
          style={{
            padding: '48px 0 32px',
            borderBottom: `1px solid ${ac}22`,
          }}
        >
          {/* Category badge */}
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: ac,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 16, height: 2, background: ac, display: 'inline-block', borderRadius: 1 }} />
            PERFORMER FEATURE · THE MUSICIAN&apos;S INDEX
          </div>

          {/* Avatar + headline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 16 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${ac}44, #0a0614)`,
                border: `2.5px solid ${ac}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                flexShrink: 0,
                boxShadow: `0 0 24px ${ac}44`,
              }}
            >
              {p.emoji}
            </div>
            <div>
              <h1
                style={{
                  fontSize: 'clamp(28px, 6vw, 44px)',
                  fontWeight: 900,
                  margin: '0 0 6px',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                  background: `linear-gradient(135deg, #fff 40%, ${ac})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {p.name}
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: `rgba(255,255,255,0.55)`,
                  margin: 0,
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                {p.tagline}
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${p.stats.length}, 1fr)`,
              gap: 8,
              marginTop: 16,
            }}
          >
            {p.stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: `${ac}0d`,
                  border: `1px solid ${ac}22`,
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, color: ac }}>{s.value}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pull quote ── */}
        <div
          style={{
            margin: '32px 0',
            padding: '20px 24px',
            borderLeft: `4px solid ${ac}`,
            background: `${ac}08`,
            borderRadius: '0 10px 10px 0',
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            {p.quote}
          </p>
          <div
            style={{
              fontSize: 9,
              color: `${ac}aa`,
              marginTop: 8,
              letterSpacing: '0.1em',
              fontWeight: 700,
            }}
          >
            — {p.name}
          </div>
        </div>

        {/* ── Bio ── */}
        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: ac,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ width: 3, height: 14, background: ac, borderRadius: 2, display: 'inline-block' }} />
            About {p.name}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            {p.bio}
          </p>
        </section>

        {/* ── Highlights ── */}
        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: ac,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ width: 3, height: 14, background: ac, borderRadius: 2, display: 'inline-block' }} />
            Highlights
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${ac}1a`,
                  borderRadius: 8,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: ac, flexShrink: 0, boxShadow: `0 0 6px ${ac}` }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{h}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── XP earn notice ── */}
        <div
          style={{
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 18 }}>⭐</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#00FF88', marginBottom: 2 }}>
              +25 XP earned for reading this article
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
              Read 5 articles to unlock the Weekly Cypher badge · XP tallied at page end
            </div>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          <Link
            href={`/profile/performer/${p.slug}`}
            style={{
              padding: '10px 20px',
              background: ac,
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: '#050310',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              boxShadow: `0 0 16px ${ac}44`,
            }}
          >
            VIEW PROFILE →
          </Link>
          <Link
            href={`/live/rooms/${p.slug}-live`}
            style={{
              padding: '10px 20px',
              background: 'rgba(230,48,0,0.12)',
              border: '1.5px solid rgba(230,48,0,0.5)',
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: '#E63000',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ⏺ WATCH LIVE →
          </Link>
          <Link
            href={`/playlist?performer=${p.slug}`}
            style={{
              padding: '10px 20px',
              background: 'rgba(0,229,255,0.08)',
              border: '1px solid rgba(0,229,255,0.28)',
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: '#00E5FF',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            🎵 PLAYLIST →
          </Link>
          <Link
            href={`/hub/sponsor?target=performer&slug=${p.slug}`}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: `1.5px solid ${ac}66`,
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: ac,
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            🤝 SPONSOR {p.name.split(' ')[0]?.toUpperCase()}
          </Link>
          <Link
            href="/battles"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1.5px solid rgba(255,45,170,0.5)',
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: '#FF2DAA',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ⚔️ BATTLE TONIGHT
          </Link>
          <Link
            href="/magazine"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1.5px solid rgba(255,215,0,0.4)',
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 900,
              color: '#FFD700',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            📰 BACK TO MAGAZINE
          </Link>
        </div>

        {/* ── Back to Index ── */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: 20,
            display: 'flex',
            gap: 16,
          }}
        >
          <Link
            href="/home/1"
            style={{ fontSize: 10, color: ac, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}
          >
            ⌂ HOME
          </Link>
          <Link
            href="/articles"
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}
          >
            ← ALL ARTICLES
          </Link>
          <Link
            href={`/articles?genre=${encodeURIComponent(p.genre)}`}
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.06em' }}
          >
            MORE {p.genre.toUpperCase()} →
          </Link>
        </div>

      </div>
    </main>
  );
}
