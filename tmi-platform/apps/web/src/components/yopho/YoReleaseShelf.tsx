"use client";
/**
 * YoReleaseShelf — displays an artist's locked, for-sale YoArtifact releases.
 *
 * Fetches from GET /api/yo/releases/[ownerSlug] and renders a grid of
 * purchasable release cards. Each card shows title, price, edition info,
 * and a BUY button that POSTs to /api/yo/purchase and redirects to Stripe.
 *
 * Rule 20: honest empty state when there are no releases for sale.
 * Rule 14: BUY button always triggers a real action (Stripe checkout session).
 * Rule 23: no money claimed until Stripe confirms the payment.
 */

import { useEffect, useState, useCallback } from "react";

interface YoReleaseShelfItem {
  cardId: string;
  title: string;
  artistDisplay: string;
  coverArtUrl: string | null;
  priceCents: number;
  currency: string;
  editionLimit: number | null;
  soldCount: number;
  includesRawExport: boolean;
  productKind: string;
}

interface YoReleaseShelfProps {
  /** Artist slug — passed to /api/yo/releases/[ownerSlug] */
  ownerSlug: string;
}

type ShelfState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "loaded"; releases: YoReleaseShelfItem[] };

export default function YoReleaseShelf({ ownerSlug }: YoReleaseShelfProps) {
  const [shelf, setShelf] = useState<ShelfState>({ status: "loading" });
  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  // ── Fetch releases ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ownerSlug) {
      setShelf({ status: "empty" });
      return;
    }
    let cancelled = false;
    setShelf({ status: "loading" });
    fetch(`/api/yo/releases/${encodeURIComponent(ownerSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const releases: YoReleaseShelfItem[] = data.releases ?? [];
        setShelf(releases.length ? { status: "loaded", releases } : { status: "empty" });
      })
      .catch(() => {
        if (!cancelled) setShelf({ status: "error", message: "Unable to load releases." });
      });
    return () => { cancelled = true; };
  }, [ownerSlug]);

  // ── Buy handler ───────────────────────────────────────────────────────────
  const handleBuy = useCallback(async (cardId: string) => {
    setBuying(cardId);
    setBuyError(null);
    try {
      const res = await fetch("/api/yo/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBuyError(data.error ?? "Purchase failed. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url; // Stripe checkout redirect
      }
    } catch {
      setBuyError("Network error. Please try again.");
    } finally {
      setBuying(null);
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (shelf.status === "loading") {
    return (
      <div style={styles.container}>
        <p style={styles.muted}>Loading releases…</p>
      </div>
    );
  }

  if (shelf.status === "error") {
    return (
      <div style={styles.container}>
        <p style={styles.muted}>{shelf.message}</p>
      </div>
    );
  }

  if (shelf.status === "empty") {
    return (
      <div style={styles.container}>
        <p style={styles.muted}>No releases available for purchase yet.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Available Releases</h3>
      {buyError && <p style={styles.error}>{buyError}</p>}
      <div style={styles.grid}>
        {shelf.releases.map((release) => (
          <ReleaseCard
            key={release.cardId}
            release={release}
            isBuying={buying === release.cardId}
            onBuy={handleBuy}
          />
        ))}
      </div>
    </div>
  );
}

// ── Release card sub-component ─────────────────────────────────────────────

interface ReleaseCardProps {
  release: YoReleaseShelfItem;
  isBuying: boolean;
  onBuy: (cardId: string) => void;
}

function ReleaseCard({ release, isBuying, onBuy }: ReleaseCardProps) {
  const price = `$${(release.priceCents / 100).toFixed(2)}`;
  const editionLabel =
    release.editionLimit !== null
      ? `Edition ${release.soldCount + 1} / ${release.editionLimit}`
      : "Open Edition";

  return (
    <div style={styles.card}>
      {/* Placeholder cover — client resolves real artwork from card layers */}
      <div style={styles.artPlaceholder}>
        <span style={styles.artIcon}>🎵</span>
      </div>

      <div style={styles.cardBody}>
        <p style={styles.releaseTitle}>{release.title}</p>
        <p style={styles.artistName}>{release.artistDisplay}</p>

        <div style={styles.meta}>
          <span style={styles.editionBadge}>{editionLabel}</span>
          {release.includesRawExport && (
            <span style={styles.exportBadge}>+ download</span>
          )}
        </div>

        <button
          style={{
            ...styles.buyBtn,
            opacity: isBuying ? 0.6 : 1,
            cursor: isBuying ? "not-allowed" : "pointer",
          }}
          disabled={isBuying}
          onClick={() => onBuy(release.cardId)}
        >
          {isBuying ? "Opening checkout…" : `BUY ${price}`}
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "16px 0",
  },
  heading: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#00FFFF",
    marginBottom: 16,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  muted: {
    color: "#888",
    fontSize: "0.9rem",
    padding: "8px 0",
  },
  error: {
    color: "#FF2DAA",
    fontSize: "0.85rem",
    marginBottom: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(0,255,255,0.15)",
    borderRadius: 10,
    overflow: "hidden",
  },
  artPlaceholder: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  artIcon: {
    fontSize: "2.5rem",
    opacity: 0.4,
  },
  cardBody: {
    padding: "10px 12px 14px",
  },
  releaseTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 2px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  artistName: {
    fontSize: "0.78rem",
    color: "#aaa",
    margin: "0 0 8px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  meta: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  editionBadge: {
    fontSize: "0.68rem",
    color: "#FFD700",
    background: "rgba(255,215,0,0.1)",
    border: "1px solid rgba(255,215,0,0.3)",
    borderRadius: 4,
    padding: "2px 6px",
  },
  exportBadge: {
    fontSize: "0.68rem",
    color: "#00FFFF",
    background: "rgba(0,255,255,0.07)",
    border: "1px solid rgba(0,255,255,0.2)",
    borderRadius: 4,
    padding: "2px 6px",
  },
  buyBtn: {
    width: "100%",
    padding: "8px 0",
    background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.82rem",
    border: "none",
    borderRadius: 6,
    letterSpacing: "0.05em",
  },
};
