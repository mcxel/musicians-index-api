"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VaultItem = { id: string; title: string; type: string; seller: string; purchasedAt: string; status: string; color: string };

const SEED_VAULT: VaultItem[] = [
  { id: "v1", title: "Midnight Bars (Premium License)", type: "BEAT", seller: "Wavetek", purchasedAt: "Apr 26, 2026", status: "UNLOCKED", color: "#FFD700" },
  { id: "v2", title: "The Code (Lease)", type: "INSTRUMENTAL", seller: "FlowMaster", purchasedAt: "Apr 20, 2026", status: "UNLOCKED", color: "#FF2DAA" },
  { id: "v3", title: "Cyber Genesis NFT #001", type: "NFT", seller: "TMI Art", purchasedAt: "Apr 18, 2026", status: "UNLOCKED", color: "#00FFFF" },
];

export default function VaultPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vault", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        const list = Array.isArray(d) ? (d as VaultItem[]) :
                     Array.isArray((d as { items?: VaultItem[] })?.items) ? (d as { items: VaultItem[] }).items : [];
        setItems(list.length > 0 ? list : SEED_VAULT);
      })
      .catch(() => setItems(SEED_VAULT))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800, marginBottom: 12 }}>MY VAULT</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Asset Vault</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Every asset you've purchased lives here — beats, instrumentals, NFTs, and collectibles.
          Locked vault. Protected delivery. License on file.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/beats/marketplace" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none" }}>BUY BEATS</Link>
          <Link href="/orders" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, textDecoration: "none" }}>ORDER HISTORY</Link>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 80, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Vault Empty</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Purchase a beat, instrumental, or NFT to unlock vault access.</div>
            <Link href="/beats/marketplace" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 20px" }}>BROWSE MARKETPLACE</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(item => (
              <Link key={item.id} href={`/vault/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}14`, borderRadius: 12, padding: "18px 22px" }}>
                  <div style={{ width: 40, height: 40, background: `${item.color}12`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {item.type === "BEAT" ? "🎛️" : item.type === "NFT" ? "🎨" : "🎼"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>by {item.seller} · {item.purchasedAt}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: item.color, border: `1px solid ${item.color}40`, borderRadius: 4, padding: "3px 8px" }}>{item.type}</span>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "3px 8px" }}>{item.status}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
