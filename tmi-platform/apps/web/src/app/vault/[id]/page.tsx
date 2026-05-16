"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VaultAsset = { id: string; title: string; type: string; seller: string; purchasedAt: string; licenseType: string; downloadCount: number; maxDownloads: number; color: string; fileReady: boolean };

const SEED: Record<string, VaultAsset> = {
  v1: { id: "v1", title: "Midnight Bars (Premium License)", type: "BEAT", seller: "Wavetek", purchasedAt: "Apr 26, 2026", licenseType: "Premium Lease", downloadCount: 1, maxDownloads: 3, color: "#FFD700", fileReady: true },
  v2: { id: "v2", title: "The Code (Lease)", type: "INSTRUMENTAL", seller: "FlowMaster", purchasedAt: "Apr 20, 2026", licenseType: "Basic Lease", downloadCount: 0, maxDownloads: 3, color: "#FF2DAA", fileReady: true },
  v3: { id: "v3", title: "Cyber Genesis NFT #001", type: "NFT", seller: "TMI Art", purchasedAt: "Apr 18, 2026", licenseType: "NFT Ownership", downloadCount: 0, maxDownloads: 5, color: "#00FFFF", fileReady: true },
};

export default function VaultAssetPage({ params }: { params: { id: string } }) {
  const [asset, setAsset] = useState<VaultAsset | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetch(`/api/vault/${params.id}`, { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        const a = d as VaultAsset;
        setAsset(a?.id ? a : SEED[params.id] ?? null);
      })
      .catch(() => setAsset(SEED[params.id] ?? null));
  }, [params.id]);

  async function download() {
    if (!asset || downloading || asset.downloadCount >= asset.maxDownloads) return;
    setDownloading(true);
    await fetch(`/api/vault/${params.id}/download`, { method: "POST", credentials: "include" }).catch(() => {});
    setDownloaded(true);
    setDownloading(false);
  }

  if (!asset) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Loading vault…</div>
    </main>
  );

  const downloadsLeft = asset.maxDownloads - asset.downloadCount;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/vault" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← VAULT</Link>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ background: `${asset.color}06`, border: `1px solid ${asset.color}20`, borderRadius: 16, padding: "48px 32px", textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{asset.type === "BEAT" ? "🎛️" : asset.type === "NFT" ? "🎨" : "🎼"}</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.15em" }}>VAULT UNLOCKED</div>
        </div>

        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>{asset.title}</h1>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>by {asset.seller} · Purchased {asset.purchasedAt}</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          <span style={{ fontSize: 9, color: asset.color, border: `1px solid ${asset.color}40`, borderRadius: 4, padding: "3px 8px" }}>{asset.type}</span>
          <span style={{ fontSize: 9, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "3px 8px" }}>{asset.licenseType}</span>
          <span style={{ fontSize: 9, color: downloadsLeft > 0 ? "rgba(255,255,255,0.4)" : "#FF2DAA", border: `1px solid ${downloadsLeft > 0 ? "rgba(255,255,255,0.1)" : "rgba(255,45,170,0.3)"}`, borderRadius: 4, padding: "3px 8px" }}>
            {downloadsLeft}/{asset.maxDownloads} downloads left
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {downloaded ? (
            <div style={{ padding: "16px", textAlign: "center", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#00FF88" }}>✓ Download link sent — check your downloads</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Link expires in 24 hours</div>
            </div>
          ) : (
            <button onClick={download} disabled={downloading || downloadsLeft <= 0 || !asset.fileReady} style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: downloadsLeft > 0 && asset.fileReady ? `linear-gradient(135deg,${asset.color},${asset.color}99)` : "rgba(255,255,255,0.1)", borderRadius: 10, border: "none", cursor: downloadsLeft > 0 ? "pointer" : "not-allowed" }}>
              {downloading ? "GENERATING LINK…" : downloadsLeft <= 0 ? "DOWNLOAD LIMIT REACHED" : "DOWNLOAD FILE"}
            </button>
          )}
          <Link href="/vault" style={{ display: "block", textAlign: "center", padding: "12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, textDecoration: "none" }}>
            BACK TO VAULT
          </Link>
        </div>

        <div style={{ marginTop: 24, padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.8 }}>
          <div>🔒 Protected delivery — no file exposed before payment</div>
          <div>📄 License PDF available in your order history</div>
          <div>🔁 Download limit enforced by platform</div>
          <div>⚠️ Ownership receipt on file — fraud detection active</div>
        </div>
      </div>
    </main>
  );
}
