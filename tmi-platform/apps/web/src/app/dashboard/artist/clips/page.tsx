"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const CLIP_TYPES = [
  { label: "Live Performance Clips", count: 0, href: "/media/clips?type=live",      color: "#FF2DAA" },
  { label: "Behind the Scenes",      count: 0, href: "/media/clips?type=backstage", color: "#AA2DFF" },
  { label: "Studio Sessions",        count: 0, href: "/media/clips?type=studio",    color: "#00FFFF" },
  { label: "Music Videos",           count: 0, href: "/media/clips?type=video",     color: "#FFD700" },
];

export default function ArtistClipsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (!d.authenticated) router.replace("/auth"); else setReady(true); })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#05060c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#FF2DAA", fontSize: 12, letterSpacing: 4 }}>LOADING...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/dashboard/artist" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Artist Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>MY CLIPS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Media Library</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px" }}>Manage your video clips, live performance recordings, and media.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 32 }}>
          {CLIP_TYPES.map((c) => (
            <Link key={c.label} href={c.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}22`, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: c.color, marginBottom: 6 }}>{c.count}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 10, color: c.color, marginTop: 8 }}>View All →</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/camera" style={{ padding: "12px 24px", borderRadius: 8, background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
            🎥 Record New Clip
          </Link>
          <Link href="/media/upload" style={{ padding: "12px 24px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Upload Media
          </Link>
        </div>
      </div>
    </main>
  );
}
