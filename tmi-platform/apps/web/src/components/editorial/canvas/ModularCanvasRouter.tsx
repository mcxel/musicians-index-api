'use client';

import LiveViewportTile from './LiveViewportTile';
import MerchBentoTile, { type MerchItem } from './MerchBentoTile';
import SponsorNativeTile from './SponsorNativeTile';
import TicketCountdownTile from './TicketCountdownTile';
import MediaStripTile, { type MediaItem } from './MediaStripTile';

// ─── Payload type ─────────────────────────────────────────────────────────────

export interface CanvasPayload {
  // Performer identity
  displayName: string;
  slug: string;
  headline: string;
  genre: string;
  rank: number;
  isLive: boolean;
  isVerified: boolean;
  heroImage?: string;
  accentColor: string;

  // Article body — the raw editorial text paragraphs
  body: string[];

  // Tile data — optional; defaults shown when absent
  merch?: MerchItem[];
  media?: MediaItem[];
  sponsorBrand?: string;
  sponsorTagline?: string;
  eventName?: string;
  eventVenue?: string;
  eventDate?: string;
  ticketSeats?: number;
  ticketPrice?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_MERCH: MerchItem[] = [
  { id: 'm1', name: 'Signature Tee',        type: 'shirt',  price: '$34',      emoji: '👕' },
  { id: 'm2', name: 'Crown Hoodie',         type: 'hoodie', price: '$72',      emoji: '🧥' },
  { id: 'm3', name: 'Genesis NFT',          type: 'nft',    price: '0.08 ETH', emoji: '💎' },
  { id: 'm4', name: 'Type Beat Pack',       type: 'beat',   price: '$18',      emoji: '🎧' },
];

const DEFAULT_MEDIA: MediaItem[] = [
  { id: 'c1', title: 'Crown Defense Round 3',        type: 'clip',  duration: '4:12',  views: 18400 },
  { id: 'c2', title: 'Live Session — Friday Cypher', type: 'clip',  duration: '22:07', views: 9200  },
  { id: 'c3', title: 'Type Beat: Midnight',           type: 'audio', duration: '2:48',  views: 3100  },
  { id: 'c4', title: 'Battle Highlight Reel',         type: 'clip',  duration: '8:33',  views: 14700 },
];

// ─── Text paragraph component ─────────────────────────────────────────────────

function BodyParagraph({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
      <p style={{
        fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)',
        margin: '0 0 4px',
        borderLeft: `2px solid ${accentColor}20`,
        paddingLeft: 18,
      }}>
        {text}
      </p>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

/**
 * Injection positions (paragraph index after which a tile appears):
 *   BEFORE body  → LiveViewportTile  (always first)
 *   After p[1]   → MerchBentoTile
 *   After p[3]   → SponsorNativeTile
 *   After p[5]   → TicketCountdownTile
 *   AFTER body   → MediaStripTile   (always last)
 */
export default function ModularCanvasRouter({
  displayName, slug, headline, genre, rank, isLive, heroImage, accentColor,
  body, merch, media, sponsorBrand, sponsorTagline, eventName, eventVenue, eventDate, ticketSeats, ticketPrice,
}: CanvasPayload) {
  const CYAN = '#00FFFF';
  const accent = accentColor;

  const resolvedMerch  = merch  ?? DEFAULT_MERCH;
  const resolvedMedia  = media  ?? DEFAULT_MEDIA;

  const paragraphs = body.length > 0 ? body : ['More from this performer coming soon.'];

  const elements: React.ReactNode[] = [];

  // ── ALWAYS FIRST: Stage hero ──
  elements.push(
    <div key="hero" style={{ marginBottom: 24 }}>
      <LiveViewportTile
        displayName={displayName}
        headline={headline}
        genre={genre}
        rank={rank}
        isLive={isLive}
        heroImage={heroImage}
        accentColor={accent}
      />
    </div>
  );

  // ── Article body + tile injections ──
  paragraphs.forEach((para, i) => {
    elements.push(
      <div key={`p-${i}`} style={{ marginBottom: 16 }}>
        <BodyParagraph text={para} accentColor={accent} />
      </div>
    );

    // After paragraph index 1 → Merch
    if (i === 1) {
      elements.push(
        <div key="merch" style={{ marginBottom: 24, marginTop: 8 }}>
          <MerchBentoTile merch={resolvedMerch} accentColor={accent} performerSlug={slug} />
        </div>
      );
    }

    // After paragraph index 3 → Sponsor
    if (i === 3 && (sponsorBrand ?? 'SoundWave')) {
      elements.push(
        <div key="sponsor" style={{ marginBottom: 24, marginTop: 8 }}>
          <SponsorNativeTile
            brand={sponsorBrand ?? 'SoundWave'}
            tagline={sponsorTagline ?? 'The platform built for artists who compete at the highest level.'}
            accentColor={CYAN}
          />
        </div>
      );
    }

    // After paragraph index 5 → Ticket countdown
    if (i === 5) {
      elements.push(
        <div key="ticket" style={{ marginBottom: 24, marginTop: 8 }}>
          <TicketCountdownTile
            eventName={eventName ?? `${displayName} — Live Performance`}
            venue={eventVenue ?? 'TMI Main Stage'}
            dateLabel={eventDate ?? 'Upcoming'}
            seatsRemaining={ticketSeats ?? 18}
            ticketPrice={ticketPrice ?? '$12'}
            accentColor={accent}
          />
        </div>
      );
    }
  });

  // ── ALWAYS LAST: Media strip ──
  elements.push(
    <div key="media" style={{ marginTop: 16 }}>
      <MediaStripTile media={resolvedMedia} accentColor={accent} performerSlug={slug} />
    </div>
  );

  return <div style={{ paddingBottom: 60 }}>{elements}</div>;
}
