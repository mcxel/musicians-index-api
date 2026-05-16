"use client";

import { getWorldTrendingFeed } from "@/lib/global/GlobalFeedEngine";
import { getDiscoverNewMusicFeed } from "@/lib/global/GlobalFeedEngine";
import Link from "next/link";

export default function WorldTrendingBelt() {
  const trending = getWorldTrendingFeed().slice(0, 6);
  const discover = getDiscoverNewMusicFeed().slice(0, 4);

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0" }}>
      {/* World Trending */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>
          📈 WORLD TRENDING
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {trending.map((item, i) => (
            <Link key={item.id} href={item.route} style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{
                borderRadius: 8,
                border: "1px solid rgba(255,45,170,0.2)",
                background: "rgba(255,45,170,0.06)",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", width: 14 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 16 }}>{item.flag}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Discover New Music Cultures */}
      {discover.length > 0 && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>
            🎵 DISCOVER NEW MUSIC CULTURES
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {discover.map(item => (
              <Link key={item.id} href={item.route} style={{ textDecoration: "none", color: "#fff", flexShrink: 0 }}>
                <div style={{
                  borderRadius: 10,
                  border: `1px solid ${item.accentColor ?? "#AA2DFF"}30`,
                  background: `${item.accentColor ?? "#AA2DFF"}0d`,
                  padding: "10px 14px",
                  minWidth: 180,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{item.flag}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: item.accentColor ?? "#AA2DFF" }}>{item.title}</span>
                  </div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
                    {item.subtitle?.slice(0, 80) ?? ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
