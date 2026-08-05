'use client';

/**
 * /store/media-players — Media Player Chassis store
 * Data from: GET /api/media-players (catalog + ownership + points)
 * Points buy: POST /api/media-players { action: "purchase_points", chassisId }
 * Stripe buy:  POST /api/stripe/checkout { product: "MEDIA_PLAYER_CHASSIS", chassisId }
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MediaPlayerChassisPreview from '@/components/media/MediaPlayerChassisPreview';
import type { MediaPlayerChassis } from '@/lib/artifacts/PlaylistArtifactEngine';

interface StoreState {
  catalog: MediaPlayerChassis[];
  owned: string[];
  equipped: string | null;
  pointsBalance: number;
  authenticated: boolean;
}

type BuyMode = 'points' | 'stripe';

const RARITY_ORDER: Record<string, number> = {
  free: 0, tier: 1, common: 2, rare: 3, legendary: 4,
};

const RARITY_COLOR: Record<string, string> = {
  free: '#9dffc8', tier: '#AA2DFF', common: '#00FFFF', rare: '#FF2DAA', legendary: '#FFD700',
};

const UNLOCK_LABEL: Record<string, string> = {
  free: 'FREE', tier: 'TIER REWARD', points: 'POINTS', premium: 'PURCHASE',
};

function fmtPoints(n: number): string {
  return n.toLocaleString('en-US') + ' pts';
}

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function MediaPlayerStorePage() {
  const [state, setState] = useState<StoreState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/media-players');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      // Sort: free first, then tier, then by label
      const catalog = (data.catalog as MediaPlayerChassis[]).sort(
        (a, b) =>
          (RARITY_ORDER[a.rarity] ?? 5) - (RARITY_ORDER[b.rarity] ?? 5) ||
          a.label.localeCompare(b.label),
      );
      setState({
        catalog,
        owned: data.ownedChassisIds ?? [],
        equipped: data.equippedChassisId ?? null,
        pointsBalance: data.pointsBalance ?? 0,
        authenticated: data.authenticated ?? false,
      });
    } catch (e: any) {
      setError(e.message ?? 'Could not load media players');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function equipChassis(chassisId: string) {
    if (!state?.authenticated) return;
    setBusyId(chassisId);
    try {
      const res = await fetch('/api/media-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'equip', chassisId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Equip failed');
      setState((prev) => prev ? { ...prev, equipped: chassisId } : prev);
      setFlash({ id: chassisId, ok: true, msg: 'Equipped!' });
    } catch (e: any) {
      setFlash({ id: chassisId, ok: false, msg: e.message });
    } finally {
      setBusyId(null);
      setTimeout(() => setFlash(null), 2500);
    }
  }

  async function buyWithPoints(chassisId: string) {
    if (!state?.authenticated) {
      window.location.href = '/login?redirect=/store/media-players';
      return;
    }
    setBusyId(chassisId);
    try {
      const res = await fetch('/api/media-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase_points', chassisId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Purchase failed');
      setState((prev) =>
        prev
          ? {
              ...prev,
              owned: Array.from(new Set([...prev.owned, chassisId])),
              pointsBalance: json.pointsBalance ?? prev.pointsBalance,
              equipped: json.equippedChassisId ?? prev.equipped,
            }
          : prev,
      );
      setFlash({ id: chassisId, ok: true, msg: 'Unlocked!' });
    } catch (e: any) {
      setFlash({ id: chassisId, ok: false, msg: e.message });
    } finally {
      setBusyId(null);
      setTimeout(() => setFlash(null), 2500);
    }
  }

  async function buyWithStripe(chassisId: string) {
    if (!state?.authenticated) {
      window.location.href = '/login?redirect=/store/media-players';
      return;
    }
    setBusyId(chassisId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'MEDIA_PLAYER_CHASSIS', chassisId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Checkout failed');
      if (json.url) window.location.href = json.url;
    } catch (e: any) {
      setFlash({ id: chassisId, ok: false, msg: e.message });
      setBusyId(null);
      setTimeout(() => setFlash(null), 2500);
    }
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: '0.15em' }}>Loading media players…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: '100vh', background: '#050510', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ color: '#FF2DAA', fontSize: 14 }}>Unable to load media players. {error}</div>
        <button onClick={load} style={{ padding: '10px 20px', background: '#00FFFF22', border: '1px solid #00FFFF55', borderRadius: 8, color: '#00FFFF', cursor: 'pointer', fontSize: 13 }}>Retry</button>
      </main>
    );
  }

  const { catalog, owned, equipped, pointsBalance, authenticated } = state!;

  // Group by unlock method for display
  const freeItems = catalog.filter((c) => c.unlockMethod === 'free');
  const tierItems = catalog.filter((c) => c.unlockMethod === 'tier');
  const storeItems = catalog.filter((c) => c.unlockMethod === 'points' || c.unlockMethod === 'premium');

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(0,255,255,0.08), transparent 50%), #050510', color: '#fff', paddingBottom: 80 }}>

      {/* ── Header ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 28px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/store" style={{ fontSize: 9, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, textDecoration: 'none', marginBottom: 10, display: 'inline-block' }}>
            ← TMI STORE
          </Link>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '8px 0 12px', lineHeight: 1.1 }}>
            🎛️ Media Players
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.7 }}>
            Collectible playback chassis. Equip one to customize how your music looks when you play it anywhere on TMI.
          </p>

          {/* Points balance */}
          {authenticated ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 30, fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: '#FFD700' }}>⭐</span>
              <span style={{ color: '#FFD700' }}>{fmtPoints(pointsBalance)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>available</span>
            </div>
          ) : (
            <Link href="/login?redirect=/store/media-players" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 30, fontSize: 12, fontWeight: 700, color: '#00FFFF', textDecoration: 'none' }}>
              Sign in to purchase →
            </Link>
          )}
        </motion.div>
      </section>

      {/* ── FREE Section ── */}
      {freeItems.length > 0 && (
        <Section label="Yours Free" icon="🎁" accent="#9dffc8">
          {freeItems.map((chassis, i) => (
            <ChassisCard
              key={chassis.id}
              chassis={chassis}
              owned={!authenticated || owned.includes(chassis.id)}
              equipped={equipped === chassis.id}
              busy={busyId === chassis.id}
              flash={flash?.id === chassis.id ? flash : null}
              index={i}
              onEquip={authenticated ? () => equipChassis(chassis.id) : undefined}
              onBuyPoints={null}
              onBuyStripe={null}
            />
          ))}
        </Section>
      )}

      {/* ── Tier Reward Section ── */}
      {tierItems.length > 0 && (
        <Section label="Tier Rewards" icon="👑" accent="#AA2DFF">
          {tierItems.map((chassis, i) => {
            const isOwned = owned.includes(chassis.id);
            return (
              <ChassisCard
                key={chassis.id}
                chassis={chassis}
                owned={isOwned}
                equipped={equipped === chassis.id}
                busy={busyId === chassis.id}
                flash={flash?.id === chassis.id ? flash : null}
                index={i}
                onEquip={isOwned && authenticated ? () => equipChassis(chassis.id) : undefined}
                onBuyPoints={null}
                onBuyStripe={null}
                tierLabel={chassis.tierRequired ? `Requires ${chassis.tierRequired}` : undefined}
              />
            );
          })}
        </Section>
      )}

      {/* ── Store Section ── */}
      {storeItems.length > 0 && (
        <Section label="Media Player Store" icon="🛒" accent="#00FFFF">
          {storeItems.map((chassis, i) => {
            const isOwned = owned.includes(chassis.id);
            const canBuyPoints = chassis.unlockMethod === 'points' && chassis.pricePoints != null;
            const canBuyStripe = chassis.priceUsdCents != null && chassis.priceUsdCents > 0;
            return (
              <ChassisCard
                key={chassis.id}
                chassis={chassis}
                owned={isOwned}
                equipped={equipped === chassis.id}
                busy={busyId === chassis.id}
                flash={flash?.id === chassis.id ? flash : null}
                index={i}
                onEquip={isOwned && authenticated ? () => equipChassis(chassis.id) : undefined}
                onBuyPoints={!isOwned && canBuyPoints ? () => buyWithPoints(chassis.id) : null}
                onBuyStripe={!isOwned && canBuyStripe ? () => buyWithStripe(chassis.id) : null}
              />
            );
          })}
        </Section>
      )}

      {/* ── Footer ── */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
          Points are earned by participating on TMI — listening, attending live rooms, voting, and more.<br />
          Tier rewards unlock automatically when you reach that membership tier.
        </div>
      </section>
    </main>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ label, icon, accent, children }: { label: string; icon: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accent, fontWeight: 800 }}>
          {label.toUpperCase()}
        </div>
        <div style={{ flex: 1, height: 1, background: `${accent}22` }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {children}
      </div>
    </section>
  );
}

// ─── Individual chassis card ─────────────────────────────────────────────────

interface CardProps {
  chassis: MediaPlayerChassis;
  owned: boolean;
  equipped: boolean;
  busy: boolean;
  flash: { ok: boolean; msg: string } | null;
  index: number;
  onEquip?: () => void;
  onBuyPoints: (() => void) | null;
  onBuyStripe: (() => void) | null;
  tierLabel?: string;
}

function ChassisCard({ chassis, owned, equipped, busy, flash, index, onEquip, onBuyPoints, onBuyStripe, tierLabel }: CardProps) {
  const accent = chassis.accent;
  const rarityColor = RARITY_COLOR[chassis.rarity] ?? '#fff';

  const footer = (
    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Rarity badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', color: rarityColor, background: `${rarityColor}18`, padding: '2px 6px', borderRadius: 10 }}>
          {UNLOCK_LABEL[chassis.unlockMethod] ?? (chassis.unlockMethod ?? 'STORE').toUpperCase()}
        </span>
        {chassis.pricePoints != null && !owned && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#FFD700' }}>
            {fmtPoints(chassis.pricePoints)}
          </span>
        )}
        {chassis.priceUsdCents != null && chassis.priceUsdCents > 0 && !owned && (
          <span style={{ fontSize: 10, fontWeight: 700, color: accent }}>
            {fmtUsd(chassis.priceUsdCents)}
          </span>
        )}
      </div>

      {/* Tier label */}
      {tierLabel && !owned && (
        <div style={{ fontSize: 9, color: '#AA2DFF', fontWeight: 700 }}>{tierLabel}</div>
      )}

      {/* Flash message */}
      {flash && (
        <div style={{ fontSize: 10, color: flash.ok ? '#9dffc8' : '#FF2DAA', fontWeight: 700 }}>
          {flash.msg}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
        {owned && !equipped && onEquip && (
          <button
            onClick={(e) => { e.stopPropagation(); onEquip(); }}
            disabled={busy}
            style={{ flex: 1, padding: '6px 0', background: `${accent}22`, border: `1px solid ${accent}55`, borderRadius: 6, color: accent, fontSize: 10, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.06em' }}
          >
            {busy ? '…' : 'EQUIP'}
          </button>
        )}
        {equipped && (
          <div style={{ flex: 1, padding: '6px 0', background: `${accent}15`, border: `1px solid ${accent}`, borderRadius: 6, color: accent, fontSize: 10, fontWeight: 800, textAlign: 'center', letterSpacing: '0.06em' }}>
            ✓ EQUIPPED
          </div>
        )}
        {!owned && onBuyPoints && (
          <button
            onClick={(e) => { e.stopPropagation(); onBuyPoints(); }}
            disabled={busy}
            style={{ flex: 1, padding: '6px 0', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 6, color: '#FFD700', fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' }}
          >
            {busy ? '…' : '⭐ POINTS'}
          </button>
        )}
        {!owned && onBuyStripe && (
          <button
            onClick={(e) => { e.stopPropagation(); onBuyStripe(); }}
            disabled={busy}
            style={{ flex: 1, padding: '6px 0', background: `${accent}18`, border: `1px solid ${accent}55`, borderRadius: 6, color: accent, fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' }}
          >
            {busy ? '…' : '💳 BUY'}
          </button>
        )}
        {!owned && !onBuyPoints && !onBuyStripe && !tierLabel && (
          <div style={{ flex: 1, padding: '6px 0', fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            Log in to purchase
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <MediaPlayerChassisPreview
        chassis={chassis}
        owned={owned}
        equipped={equipped}
        previewOnly={!owned}
        footer={footer}
      />
    </motion.div>
  );
}
