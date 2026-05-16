"use client";
import Link from "next/link";
import { useState } from "react";

const SEO_SURFACES = [
  { label: "Artist Pages",        coverage: 87,  total: 240,  critical: 3,  path: "/artists/[slug]" },
  { label: "Venue Pages",         coverage: 72,  total: 48,   critical: 2,  path: "/venues/[id]" },
  { label: "Event Pages",         coverage: 91,  total: 120,  critical: 1,  path: "/events/[eventId]" },
  { label: "Genre Hubs",          coverage: 100, total: 18,   critical: 0,  path: "/genres/[genre]" },
  { label: "City Hubs",           coverage: 95,  total: 62,   critical: 0,  path: "/cities/[city]" },
  { label: "Battle Cards",        coverage: 68,  total: 35,   critical: 4,  path: "/battles/[id]" },
  { label: "Performer Press Kits", coverage: 55, total: 90,   critical: 8,  path: "/performers/[slug]" },
  { label: "Magazine Articles",   coverage: 100, total: 22,   critical: 0,  path: "/magazine/[slug]" },
  { label: "Winner Profiles",     coverage: 83,  total: 12,   critical: 0,  path: "/winners/[id]" },
  { label: "Trending State Pages", coverage: 100, total: 8,   critical: 0,  path: "/trending/[state]" },
];

const STRUCTURED_DATA_TYPES = [
  { type: "MusicGroup",         status: "active",  count: 240 },
  { type: "Event",              status: "active",  count: 120 },
  { type: "MusicVenue",         status: "active",  count: 48  },
  { type: "MusicAlbum",         status: "partial", count: 32  },
  { type: "BreadcrumbList",     status: "active",  count: 1100 },
  { type: "WebSite",            status: "active",  count: 1   },
  { type: "Organization",       status: "active",  count: 1   },
  { type: "Person (Performer)", status: "partial", count: 90  },
  { type: "Article",            status: "active",  count: 22  },
  { type: "SportsEvent (Battle)", status: "missing", count: 0 },
];

const statusColor = (s: string) =>
  s === "active" ? "#00FF88" : s === "partial" ? "#FFD700" : "#FF2DAA";

const coverageColor = (n: number) =>
  n >= 90 ? "#00FF88" : n >= 70 ? "#FFD700" : "#FF2DAA";

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<"coverage" | "structured" | "signals">("coverage");

  const totalCritical = SEO_SURFACES.reduce((a, s) => a + s.critical, 0);
  const avgCoverage = Math.round(SEO_SURFACES.reduce((a, s) => a + s.coverage, 0) / SEO_SURFACES.length);
  const activeTypes = STRUCTURED_DATA_TYPES.filter(t => t.status === "active").length;
  const missingTypes = STRUCTURED_DATA_TYPES.filter(t => t.status === "missing").length;

  const TAB = (tab: typeof activeTab, label: string) => ({
    onClick: () => setActiveTab(tab),
    style: {
      padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase" as const, letterSpacing: 1.5, cursor: "pointer",
      border: `1px solid ${activeTab === tab ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
      background: activeTab === tab ? "#00FFFF22" : "transparent",
      color: activeTab === tab ? "#00FFFF" : "rgba(255,255,255,0.5)",
    },
    children: label,
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <Link href="/admin" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>← Admin</Link>
          <Link href="/admin/command" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>Command</Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px", letterSpacing: 2 }}>SEO DASHBOARD</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
          Metadata coverage, structured data registry, and indexing signal health.
        </p>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Avg Coverage", value: `${avgCoverage}%`, color: coverageColor(avgCoverage) },
            { label: "Critical Gaps", value: totalCritical, color: totalCritical > 0 ? "#FF2DAA" : "#00FF88" },
            { label: "Schema Types Active", value: activeTypes, color: "#00FFFF" },
            { label: "Schema Types Missing", value: missingTypes, color: missingTypes > 0 ? "#FF2DAA" : "#00FF88" },
          ].map(stat => (
            <div key={stat.label} style={{ border: `1px solid ${stat.color}33`, borderRadius: 10, padding: "12px 14px", background: `${stat.color}08` }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{stat.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button {...TAB("coverage", "Coverage")} />
          <button {...TAB("structured", "Structured Data")} />
          <button {...TAB("signals", "Signals")} />
        </div>

        {/* Coverage Tab */}
        {activeTab === "coverage" && (
          <div style={{ display: "grid", gap: 8 }}>
            {SEO_SURFACES.map(s => {
              const covered = Math.round(s.total * s.coverage / 100);
              return (
                <div key={s.label} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.path}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      {s.critical > 0 && (
                        <span style={{ fontSize: 11, color: "#FF2DAA", background: "#FF2DAA22", borderRadius: 6, padding: "2px 8px" }}>
                          {s.critical} critical
                        </span>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 700, color: coverageColor(s.coverage) }}>
                        {s.coverage}%
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${s.coverage}%`, background: coverageColor(s.coverage), borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                      {covered} / {s.total} pages
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Structured Data Tab */}
        {activeTab === "structured" && (
          <div style={{ display: "grid", gap: 8 }}>
            {STRUCTURED_DATA_TYPES.map(t => (
              <div key={t.type} style={{ border: `1px solid ${statusColor(t.status)}22`, borderRadius: 10, padding: "12px 16px", background: `${statusColor(t.status)}06`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.type}</div>
                  <div style={{ fontSize: 11, color: statusColor(t.status), marginTop: 2 }}>{t.status}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: statusColor(t.status) }}>
                  {t.count > 0 ? t.count.toLocaleString() : "—"}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Structured data is injected via <code style={{ color: "#00FFFF" }}>StructuredData</code> component using JSON.stringify — XSS-safe.
              Battle schema (SportsEvent) requires wiring to <code style={{ color: "#FFD700" }}>ArtistKnowledgePanelEngine</code>.
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === "signals" && (
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Canonical URLs", status: "active",  note: "All dynamic routes output canonical via generateMetadata()" },
              { label: "Open Graph Images", status: "partial", note: "Artist + event pages have OG. Battle / press-kit pages missing" },
              { label: "Twitter Card Tags",  status: "partial", note: "Present on magazine articles. Missing on venue pages" },
              { label: "robots.txt",         status: "active",  note: "Generated via /public/robots.txt — crawlable" },
              { label: "sitemap.xml",        status: "missing", note: "No sitemap generator wired. Add app/sitemap.ts" },
              { label: "hreflang Tags",      status: "missing", note: "Multi-language support detected (TranslationEngine) but no hreflang output" },
              { label: "Core Web Vitals",   status: "partial",  note: "LCP images use next/image. Some lobbies use raw <img>" },
              { label: "HTTPS Enforcement",  status: "active",  note: "Enforced at infra level" },
            ].map(sig => (
              <div key={sig.label} style={{ border: `1px solid ${statusColor(sig.status)}22`, borderRadius: 10, padding: "14px 16px", background: `${statusColor(sig.status)}06` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(sig.status), textTransform: "uppercase", letterSpacing: 1 }}>{sig.status}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{sig.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{sig.note}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
