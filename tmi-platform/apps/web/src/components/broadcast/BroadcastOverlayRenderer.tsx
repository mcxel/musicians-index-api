'use client';

/**
 * BroadcastOverlayRenderer
 *
 * Mount this ONCE in the Venue Runtime root (or Broadcast Control Deck preview).
 * It subscribes to tmi:broadcast_overlay events, queues them, and renders
 * the correct visual variant per overlay type.
 *
 * Supports: album_drop, single_drop, merch_drop, sponsor_reveal, winner_reveal,
 *           countdown, announcement, event_promo
 *
 * Queue behavior:
 *   - 'normal' overlays queue behind the active one
 *   - 'high' priority overlays (winner_reveal) preempt the queue
 *
 * Usage — place inside your venue root layout:
 *   <div style={{ position: 'relative', ...venueStyles }}>
 *     <BroadcastOverlayRenderer />
 *     {children}
 *   </div>
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeToOverlays,
  subscribeToOverlayDismissed,
  signalOverlayDismissed,
  DEFAULT_HOLD_MS,
  type BroadcastOverlayEvent,
  type BroadcastOverlayPayload,
  type AlbumDropPayload,
  type MerchDropPayload,
  type SponsorRevealPayload,
  type WinnerRevealPayload,
  type AnnouncementPayload,
  type EventPromoPayload,
  type CountdownPayload,
  type OverlayDestination,
} from '@/lib/broadcast/BroadcastOverlayRuntime';

// ── Queue management ───────────────────────────────────────────────────────────

function useOverlayQueue(destination: OverlayDestination) {
  const [active, setActive] = useState<BroadcastOverlayEvent | null>(null);
  const queueRef = useRef<BroadcastOverlayEvent[]>([]);

  const advance = useCallback(() => {
    const next = queueRef.current.shift();
    setActive(next ?? null);
  }, []);

  useEffect(() => {
    const unsub = subscribeToOverlays((event) => {
      if (event.priority === 'high') {
        // Preempt: push active back to front of queue, show this immediately
        setActive(prev => {
          if (prev) queueRef.current.unshift(prev);
          return event;
        });
      } else if (!active) {
        setActive(event);
      } else {
        queueRef.current.push(event);
      }
    }, destination);
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  useEffect(() => {
    const unsub = subscribeToOverlayDismissed(() => advance());
    return unsub;
  }, [advance]);

  return { active, advance };
}

// ── Overlay variant renderers ──────────────────────────────────────────────────

function AlbumDropOverlay({ payload, onDismiss }: { payload: AlbumDropPayload; onDismiss: () => void }) {
  const accent = payload.accentColor ?? '#ffd700';
  const hold   = payload.holdMs ?? DEFAULT_HOLD_MS[payload.type];

  useEffect(() => {
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [hold, onDismiss]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Bloom */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Album art */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotateY: 90, rotateZ: 8 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0, transition: { type: 'spring', stiffness: 180, damping: 16, delay: 0.15 } }}
        exit={{ opacity: 0, scale: 1.06, y: -24, transition: { duration: 0.45 } }}
        style={{ position: 'relative', perspective: 800 }}
      >
        <div style={{ position: 'absolute', inset: -12, borderRadius: 18, background: `radial-gradient(circle, ${accent}38 0%, transparent 70%)`, filter: 'blur(18px)', zIndex: -1 }} />
        <img src={payload.albumArtUrl} alt={payload.title} width={220} height={220} style={{ display: 'block', width: 220, height: 220, borderRadius: 14, objectFit: 'cover', boxShadow: `0 0 0 2px ${accent}44, 0 0 40px 8px ${accent}30, 0 28px 56px rgba(0,0,0,0.8)` }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: -4, transition: { type: 'spring', stiffness: 400, damping: 14, delay: 0.55 } }}
          style={{ position: 'absolute', top: -16, right: -16, background: accent, color: '#050510', fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', padding: '5px 9px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: `0 0 14px ${accent}99` }}
        >
          {payload.type === 'single_drop' ? 'NEW SINGLE' : 'OUT NOW'}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.7 } }}
        exit={{ opacity: 0, y: 12 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.03em', textTransform: 'uppercase', textShadow: `0 0 18px ${accent}55` }}>{payload.title}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 5, opacity: 0.9 }}>{payload.artistName}</div>
      </motion.div>
    </div>
  );
}

function WinnerRevealOverlay({ payload, onDismiss }: { payload: WinnerRevealPayload; onDismiss: () => void }) {
  const gold = payload.trophyColor ?? '#ffd700';
  const hold = payload.holdMs ?? DEFAULT_HOLD_MS['winner_reveal'];

  useEffect(() => {
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [hold, onDismiss]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <motion.div
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 14, delay: 0.1 } }}
        style={{ fontSize: 72, filter: `drop-shadow(0 0 20px ${gold}88)` }}
      >🏆</motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.45 } }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: gold, textTransform: 'uppercase', marginBottom: 6 }}>{payload.eventName}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', textShadow: `0 0 24px ${gold}66` }}>{payload.winnerName}</div>
        <div style={{ fontSize: 13, color: gold, fontWeight: 700, letterSpacing: '0.1em', marginTop: 6 }}>WINNER</div>
      </motion.div>
    </div>
  );
}

function AnnouncementOverlay({ payload, onDismiss }: { payload: AnnouncementPayload; onDismiss: () => void }) {
  const accent = payload.accentColor ?? '#00ffff';
  const hold   = payload.holdMs ?? DEFAULT_HOLD_MS['announcement'];

  useEffect(() => {
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [hold, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } }}
      style={{ textAlign: 'center', maxWidth: 340, padding: '0 16px' }}
    >
      {payload.iconEmoji && <div style={{ fontSize: 48, marginBottom: 12, filter: `drop-shadow(0 0 12px ${accent}66)` }}>{payload.iconEmoji}</div>}
      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', textShadow: `0 0 20px ${accent}55` }}>{payload.headline}</div>
      {payload.body && <div style={{ fontSize: 13, color: '#ccc', marginTop: 8, lineHeight: 1.5 }}>{payload.body}</div>}
    </motion.div>
  );
}

function SponsorRevealOverlay({ payload, onDismiss }: { payload: SponsorRevealPayload; onDismiss: () => void }) {
  const accent = payload.accentColor ?? '#ffd700';
  const hold   = payload.holdMs ?? DEFAULT_HOLD_MS['sponsor_reveal'];

  useEffect(() => {
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [hold, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 16, delay: 0.1 } }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase' }}>Presented by</div>
      <img src={payload.logoUrl} alt={payload.sponsorName} style={{ maxWidth: 160, maxHeight: 80, objectFit: 'contain', filter: `drop-shadow(0 0 12px ${accent}44)` }} />
      {payload.tagline && <div style={{ fontSize: 14, color: '#ccc', textAlign: 'center', maxWidth: 260 }}>{payload.tagline}</div>}
      {payload.ctaLabel && payload.ctaUrl && (
        <a href={payload.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase', border: `1px solid ${accent}55`, borderRadius: 6, padding: '6px 12px', textDecoration: 'none' }}>{payload.ctaLabel}</a>
      )}
    </motion.div>
  );
}

function MerchDropOverlay({ payload, onDismiss }: { payload: MerchDropPayload; onDismiss: () => void }) {
  const accent = payload.accentColor ?? '#ff00ff';
  const hold   = payload.holdMs ?? DEFAULT_HOLD_MS['merch_drop'];

  useEffect(() => {
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [hold, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotateZ: -6 }} animate={{ opacity: 1, scale: 1, rotateZ: 0, transition: { type: 'spring', stiffness: 200, damping: 14, delay: 0.1 } }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
    >
      <img src={payload.imageUrl} alt={payload.itemName} style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 12, boxShadow: `0 0 30px ${accent}44, 0 20px 40px rgba(0,0,0,0.7)` }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: accent, textTransform: 'uppercase', marginBottom: 4 }}>New Drop</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{payload.itemName}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: accent, marginTop: 4 }}>{payload.price}</div>
      </div>
      {payload.ctaLabel && payload.ctaUrl && (
        <a href={payload.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#050510', background: accent, textTransform: 'uppercase', borderRadius: 6, padding: '8px 16px', textDecoration: 'none' }}>{payload.ctaLabel}</a>
      )}
    </motion.div>
  );
}

function EventPromoOverlay({ payload, onDismiss }: { payload: EventPromoPayload; onDismiss: () => void }) {
  const accent = payload.accentColor ?? '#aa2dff';
  const hold   = payload.holdMs ?? DEFAULT_HOLD_MS['event_promo'];

  useEffect(() => {
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [hold, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 16 } }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}
    >
      {payload.imageUrl && <img src={payload.imageUrl} alt={payload.eventName} style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 10, boxShadow: `0 0 20px ${accent}44` }} />}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', marginBottom: 4 }}>{payload.eventType}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{payload.eventName}</div>
        {payload.startsAt && <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{payload.startsAt}</div>}
      </div>
      {payload.ctaLabel && payload.ctaUrl && (
        <a href={payload.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, color: accent, border: `1px solid ${accent}66`, borderRadius: 6, padding: '6px 14px', textDecoration: 'none', letterSpacing: '0.08em' }}>{payload.ctaLabel}</a>
      )}
    </motion.div>
  );
}

// ── Variant router ─────────────────────────────────────────────────────────────

function OverlayVariant({ payload, onDismiss }: { payload: BroadcastOverlayPayload; onDismiss: () => void }) {
  switch (payload.type) {
    case 'album_drop':
    case 'single_drop':
      return <AlbumDropOverlay payload={payload as AlbumDropPayload} onDismiss={onDismiss} />;
    case 'winner_reveal':
      return <WinnerRevealOverlay payload={payload as WinnerRevealPayload} onDismiss={onDismiss} />;
    case 'announcement':
      return <AnnouncementOverlay payload={payload as AnnouncementPayload} onDismiss={onDismiss} />;
    case 'sponsor_reveal':
      return <SponsorRevealOverlay payload={payload as SponsorRevealPayload} onDismiss={onDismiss} />;
    case 'merch_drop':
      return <MerchDropOverlay payload={payload as MerchDropPayload} onDismiss={onDismiss} />;
    case 'event_promo':
      return <EventPromoOverlay payload={payload as EventPromoPayload} onDismiss={onDismiss} />;
    case 'countdown':
      // Countdown is venue-level — handled by TMICurtainSystem's existing countdown.
      return null;
    default:
      return null;
  }
}

// ── Root renderer ─────────────────────────────────────────────────────────────

export interface BroadcastOverlayRendererProps {
  /**
   * Which surface this renderer is mounted on.
   * Only overlays dispatched to this destination will appear here.
   * Default: 'audience_venue'
   */
  destination?: OverlayDestination;
}

export default function BroadcastOverlayRenderer({
  destination = 'audience_venue',
}: BroadcastOverlayRendererProps) {
  const { active, advance } = useOverlayQueue(destination);

  const handleDismiss = useCallback(() => {
    if (active) signalOverlayDismissed(active.id);
    advance();
  }, [active, advance]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.35 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #0d0020 0%, #050510 65%, #000008 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Neon bottom strip */}
          <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #00ffff88 35%, #ff00ff66 65%, transparent)', boxShadow: '0 0 10px 2px rgba(0,255,255,0.3)' }} />

          {/* Dismiss tap area (entire overlay is tappable to skip) */}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={handleDismiss}
            style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 1 }}
          />

          {/* Overlay content (above dismiss layer) */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <OverlayVariant payload={active.payload} onDismiss={handleDismiss} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
