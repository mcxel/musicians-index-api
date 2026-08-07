"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Pack = {
  sku: string;
  name: string;
  priceCents: number;
  priceLabel: string;
  points: number;
  blurb: string;
};

type SpendOffer = {
  id: string;
  category: string;
  label: string;
  pointsCost: number;
  role: string;
  href: string;
  engine: string;
  note?: string;
};

type Props = {
  /** FAN | PERFORMER — filters spend catalog */
  role?: "FAN" | "PERFORMER";
  accent?: string;
  showSpendCatalog?: boolean;
  compact?: boolean;
};

export default function BuyPointsSection({
  role = "FAN",
  accent = "#FFD700",
  showSpendCatalog = true,
  compact = false,
}: Props) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [balance, setBalance] = useState(0);
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [offers, setOffers] = useState<SpendOffer[]>([]);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [packRes, spendRes] = await Promise.all([
          fetch("/api/points/checkout", { credentials: "include", cache: "no-store" }),
          fetch(`/api/points/spend?role=${role}`, { credentials: "include", cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (packRes.ok) {
          const data = (await packRes.json()) as {
            packs?: Pack[];
            balance?: number;
            stripeConfigured?: boolean;
          };
          setPacks(data.packs ?? []);
          setBalance(data.balance ?? 0);
          setStripeConfigured(data.stripeConfigured !== false);
        }
        if (spendRes.ok) {
          const data = (await spendRes.json()) as { offers?: SpendOffer[] };
          setOffers(data.offers ?? []);
        }
      } catch {
        if (!cancelled) setError("Unable to load points store");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  async function buyPack(sku: string) {
    setBusySku(sku);
    setError(null);
    try {
      const res = await fetch("/api/points/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packSku: sku }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (res.status === 503 || data.code === "STRIPE_NOT_CONFIGURED") {
        setError("Payments not configured (503). Stripe keys required to buy points.");
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed");
    } finally {
      setBusySku(null);
    }
  }

  async function spendOffer(offerId: string) {
    setError(null);
    setFlash(null);
    try {
      const res = await fetch("/api/points/spend", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "offer", offerId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        balance?: number;
        href?: string;
        buyPointsHref?: string;
        yophoSkinId?: string | null;
      };
      if (res.status === 402) {
        setError(`${data.error ?? "Not enough points"}. Buy a pack below.`);
        return;
      }
      if (res.status === 404) {
        setError("Catalog item missing — honest empty (no fake unlock).");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Spend failed");
        return;
      }
      if (typeof data.balance === "number") setBalance(data.balance);
      if (data.yophoSkinId && typeof window !== "undefined") {
        try {
          const { unlockSkinById } = await import("@/lib/yopho/YoPhoSkinRegistry");
          unlockSkinById(data.yophoSkinId);
        } catch {
          /* canvas UI may not be mounted — ledger unlock still durable */
        }
      }
      setFlash("Points spent — unlock applied where the catalog supports it.");
    } catch {
      setError("Spend failed");
    }
  }

  const spendByCategory = offers.reduce<Record<string, SpendOffer[]>>((acc, o) => {
    (acc[o.category] ??= []).push(o);
    return acc;
  }, {});

  return (
    <section
      style={{
        background: `${accent}0d`,
        border: `1px solid ${accent}40`,
        borderRadius: 14,
        padding: compact ? "20px 16px" : "28px 22px",
        marginBottom: 36,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: accent, fontWeight: 800, marginBottom: 8 }}>
            BUY POINTS
          </div>
          <h2 style={{ fontSize: compact ? 22 : 28, fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>
            Fuel participation & cosmetics
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
            Spend on event entry, playlist skins, venue upgrades, boosters (exposure only), and{" "}
            {role === "FAN" ? "Fan cosmetics / scenes" : "performer non-avatar cosmetics"}. Never buys judged
            outcomes or chart rank.
          </p>
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${accent}55`,
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
            BALANCE
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: accent }}>{balance.toLocaleString()} pts</div>
        </div>
      </div>

      {!stripeConfigured && (
        <div
          style={{
            marginBottom: 14,
            padding: "12px 14px",
            borderRadius: 8,
            background: "rgba(255,45,170,0.1)",
            border: "1px solid rgba(255,45,170,0.35)",
            color: "#FF2DAA",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Payments not configured — Stripe keys required (503 on checkout).
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 12, color: "#FF2DAA", fontSize: 12, fontWeight: 700 }}>{error}</div>
      )}
      {flash && (
        <div style={{ marginBottom: 12, color: "#00FF88", fontSize: 12, fontWeight: 700 }}>{flash}</div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: showSpendCatalog ? 28 : 0,
        }}
      >
        {packs.length === 0 && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No point packs loaded.</div>
        )}
        {packs.map((pack, i) => (
          <motion.div
            key={pack.sku}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: "rgba(5,5,16,0.85)",
              border: `1px solid ${accent}33`,
              borderRadius: 12,
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: "0.08em" }}>
              {pack.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{pack.points}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4, flex: 1 }}>
              {pack.blurb}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: accent }}>{pack.priceLabel}</div>
            <button
              type="button"
              disabled={busySku === pack.sku}
              onClick={() => void buyPack(pack.sku)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background: accent,
                color: "#050510",
                fontWeight: 900,
                fontSize: 12,
                cursor: busySku === pack.sku ? "wait" : "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {busySku === pack.sku ? "…" : "BUY"}
            </button>
          </motion.div>
        ))}
      </div>

      {showSpendCatalog && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.45)", fontWeight: 800, marginBottom: 12 }}>
            SPEND POINTS · EXISTING CATALOGS
          </div>
          {Object.keys(spendByCategory).length === 0 && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              No spend catalog items for this role yet.
            </div>
          )}
          {Object.entries(spendByCategory).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: accent, marginBottom: 8, letterSpacing: "0.12em" }}>
                {category.replace(/_/g, " ").toUpperCase()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {items.slice(0, 8).map((offer) => (
                  <div
                    key={offer.id}
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{offer.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                      {offer.engine}
                      {offer.note ? ` · ${offer.note}` : ""}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: accent }}>{offer.pointsCost} pts</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          href={offer.href}
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.55)",
                            textDecoration: "none",
                            fontWeight: 700,
                            padding: "6px 8px",
                          }}
                        >
                          OPEN
                        </Link>
                        <button
                          type="button"
                          onClick={() => void spendOffer(offer.id)}
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: `1px solid ${accent}66`,
                            background: `${accent}22`,
                            color: accent,
                            cursor: "pointer",
                          }}
                        >
                          SPEND
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
