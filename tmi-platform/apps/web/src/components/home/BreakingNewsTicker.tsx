"use client";

import Link from "next/link";

const NEWS_ITEMS = [
  "Battle finals schedule released",
  "New venue sponsors onboarded",
  "Global cypher qualifiers now live",
  "Top 10 rankings refreshed this hour",
];

export default function BreakingNewsTicker() {
  return (
    <section style={{ borderTop: "1px solid rgba(255,45,170,0.35)", borderBottom: "1px solid rgba(255,45,170,0.35)", background: "rgba(255,45,170,0.09)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff2daa", whiteSpace: "nowrap" }}>
          Breaking News
        </strong>
        <div style={{ overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
          <div style={{ display: "inline-flex", gap: 22 }}>
            {NEWS_ITEMS.map((item, i) => (
              <span key={item} style={{ fontSize: 11, color: "rgba(255,255,255,0.92)" }}>
                {item}
                {i < NEWS_ITEMS.length - 1 ? "  |" : ""}
              </span>
            ))}
          </div>
        </div>
        <Link href="/articles/news" style={{ color: "#ffffff", fontSize: 10, textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Open
        </Link>
      </div>
    </section>
  );
}