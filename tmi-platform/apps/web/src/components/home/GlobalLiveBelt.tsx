"use client";

import { getGlobalNowLiveFeed } from "@/lib/global/GlobalFeedEngine";
import { getLiveCountries, getTotalActiveUsers } from "@/lib/global/GlobalActivityEngine";
import Link from "next/link";

export default function GlobalLiveBelt() {
  const feed = getGlobalNowLiveFeed();
  const liveCountries = getLiveCountries();
  const totalActive = getTotalActiveUsers();

  if (feed.length === 0) return null;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FF88", fontWeight: 800 }}>
          🌍 GLOBAL NOW LIVE — {liveCountries.length} COUNTRIES ACTIVE
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
          {totalActive.toLocaleString()} worldwide
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
        {feed.map(item => (
          <Link
            key={item.id}
            href={item.route}
            style={{ textDecoration: "none", color: "#fff", flexShrink: 0 }}
          >
            <div style={{
              borderRadius: 10,
              border: `1px solid ${item.accentColor ?? "#00FF88"}40`,
              background: `${item.accentColor ?? "#00FF88"}0d`,
              padding: "10px 14px",
              minWidth: 160,
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{item.flag}</div>
              <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 2 }}>{item.title}</div>
              {item.subtitle && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{item.subtitle}</div>}
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", display: "inline-block" }} />
                <span style={{ fontSize: 9, color: "#00FF88", fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
          </Link>
        ))}
        <Link
          href="/global"
          style={{ textDecoration: "none", color: "#fff", flexShrink: 0 }}
        >
          <div style={{
            borderRadius: 10,
            border: "1px solid rgba(0,255,255,0.25)",
            background: "rgba(0,255,255,0.06)",
            padding: "10px 14px",
            minWidth: 140,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 90,
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🌐</div>
            <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 700 }}>All Countries →</div>
          </div>
        </Link>
      </div>
    </section>
  );
}
