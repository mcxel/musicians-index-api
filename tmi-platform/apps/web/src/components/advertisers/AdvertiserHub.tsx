"use client";

import Link from "next/link";
import HubAssetPortraitLayer from "@/components/avatar/HubAssetPortraitLayer";

type AdvertiserHubProps = {
  slug: string;
  name?: string;
};

const HUB_LINKS = [
  { label: "Campaigns",  suffix: "/campaigns",  color: "#fcd34d" },
  { label: "Placements", suffix: "/placements",  color: "#00FFFF" },
  { label: "Analytics",  suffix: "/analytics",   color: "#c4b5fd" },
  { label: "Billing",    suffix: "/billing",     color: "#22c55e" },
];

export default function AdvertiserHub({ slug, name }: AdvertiserHubProps) {
  const displayName = name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(251,191,36,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/advertisers" style={{ color: "#fcd34d", fontSize: 10, textDecoration: "none", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← ADVERTISERS</Link>
        <strong style={{ color: "#fcd34d", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>{displayName}</strong>
        <span style={{ color: "#64748b", fontSize: 9, letterSpacing: "0.1em" }}>ADVERTISER HUB</span>
      </header>

      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: 14 }}>
          <HubAssetPortraitLayer
            name={displayName}
            accent="#fcd34d"
            variant="circle"
            state="featured"
            assetId={`asset-advertiser-${slug}`}
            avatarId={`avatar-advertiser-${slug}`}
          />
        </div>
        {/* Quick nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 20 }}>
          {HUB_LINKS.map((link) => (
            <Link
              key={link.suffix}
              href={`/advertisers/${slug}${link.suffix}`}
              style={{
                border: `1px solid ${link.color}44`,
                borderRadius: 12,
                background: `${link.color}0a`,
                padding: "16px 18px",
                textDecoration: "none",
                display: "block",
                transition: "all 0.15s",
              }}
            >
              <p style={{ margin: 0, color: link.color, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>{link.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 9, color: "#64748b" }}>/advertisers/{slug}{link.suffix}</p>
            </Link>
          ))}
        </div>

        {/* Stats overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          {[
            { label: "Active Campaigns", value: "3",       color: "#fcd34d" },
            { label: "Impressions Today", value: "48.2K",  color: "#00FFFF" },
            { label: "CTR",              value: "4.2%",    color: "#c4b5fd" },
            { label: "Ad Spend Today",   value: "$840",    color: "#f97316" },
            { label: "Billboard Slots",  value: "2",       color: "#22c55e" },
            { label: "ROI This Month",   value: "3.4×",    color: "#e879f9" },
          ].map((m) => (
            <div key={m.label} style={{ border: `1px solid ${m.color}2a`, borderRadius: 10, background: "rgba(255,255,255,0.02)", padding: "10px 12px" }}>
              <p style={{ margin: 0, fontSize: 8, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 900, color: "#f1f5f9" }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
