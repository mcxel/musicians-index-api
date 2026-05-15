"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import WinnerCeremonyOverlay from "@/components/winners/WinnerCeremonyOverlay";
import Link from "next/link";

const WINNER_DATA: Record<string, {
  name: string; contest: string; prize: string; genre: string; badge: string; slug: string;
  location: string; date: string; color: string;
}> = {
  "ray-journey": {
    name: "Ray Journey", contest: "Grand Battle Week 16", prize: "$500", genre: "Hip-Hop",
    badge: "🏆", slug: "ray-journey", location: "Atlanta, GA", date: "May 5, 2026", color: "#FFD700",
  },
  "lena-sky": {
    name: "Lena Sky", contest: "Vocal Battle Ep.9", prize: "$250", genre: "R&B",
    badge: "🌟", slug: "lena-sky", location: "Los Angeles, CA", date: "May 4, 2026", color: "#FF2DAA",
  },
  "nova-cipher": {
    name: "Nova Cipher", contest: "Monday Night Cypher Ep.12", prize: "$150", genre: "Trap",
    badge: "⚡", slug: "nova-cipher", location: "Houston, TX", date: "May 3, 2026", color: "#AA2DFF",
  },
  "zuri-bloom": {
    name: "Zuri Bloom", contest: "Global Artist Spotlight", prize: "$100", genre: "Afrobeats",
    badge: "🌍", slug: "zuri-bloom", location: "Atlanta, GA", date: "May 2, 2026", color: "#00FF88",
  },
  "dj-storm": {
    name: "DJ Storm", contest: "Beat Battle Vol.5", prize: "$100", genre: "Electronic",
    badge: "🎛️", slug: "dj-storm", location: "Miami, FL", date: "May 1, 2026", color: "#00FFFF",
  },
};

export default function WinnerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [showCeremony, setShowCeremony] = useState(false);
  const winner = WINNER_DATA[id];

  if (!winner) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <div className="text-white/50">Winner not found</div>
          <Link href="/winners" className="text-xs text-cyan-400 mt-4 block">← Back to Winners</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {showCeremony && (
        <WinnerCeremonyOverlay
          winner={{
            winnerName: winner.name,
            contestName: winner.contest,
            prize: winner.prize,
            genre: winner.genre,
            badge: winner.badge,
            slug: winner.slug,
          }}
          onClose={() => setShowCeremony(false)}
          autoClose={true}
        />
      )}

      <main className="min-h-screen" style={{ background: "#050510", color: "#fff" }}>
        {/* Hero */}
        <section
          className="px-6 pt-20 pb-12 text-center relative overflow-hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${winner.color}18 0%, transparent 70%)`,
            }}
          />
          <div className="relative z-10">
            <div className="text-xs font-mono tracking-[0.3em] mb-3" style={{ color: winner.color }}>
              CONTEST WINNER
            </div>
            <div className="text-6xl mb-4">{winner.badge}</div>
            <h1
              className="font-black mb-2"
              style={{
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                background: `linear-gradient(135deg, ${winner.color} 0%, #fff 60%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {winner.name}
            </h1>
            <p className="text-sm text-white/50 mb-1">{winner.contest}</p>
            <p className="text-xs text-white/30">{winner.location} · {winner.date}</p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <span
                className="text-lg font-black px-4 py-2 rounded-full"
                style={{ background: `${winner.color}18`, color: winner.color, border: `1px solid ${winner.color}40` }}
              >
                {winner.prize}
              </span>
              <span
                className="text-xs px-3 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {winner.genre}
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
          {/* Ceremony Button */}
          <section className="text-center">
            <button
              onClick={() => setShowCeremony(true)}
              className="px-8 py-4 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${winner.color} 0%, #FF2DAA 100%)`,
                color: "#000",
                boxShadow: `0 0 30px ${winner.color}40`,
              }}
            >
              🎬 REPLAY WINNER CEREMONY
            </button>
            <p className="text-xs text-white/30 mt-3">Full animated ceremony · Camera moment · Live crowd effect</p>
          </section>

          {/* Stats */}
          <section
            className="grid grid-cols-3 gap-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}
          >
            {[
              { label: "Prize", value: winner.prize, color: "#00FF88" },
              { label: "Genre", value: winner.genre, color: winner.color },
              { label: "City", value: winner.location.split(",")[0], color: "#00FFFF" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/30 mt-1">{s.label}</div>
              </div>
            ))}
          </section>

          {/* CTAs */}
          <section className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/artists/${winner.slug}`}
              className="px-5 py-3 rounded-full text-sm font-bold"
              style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF" }}
            >
              View Artist Profile →
            </Link>
            <Link
              href="/winners"
              className="px-5 py-3 rounded-full text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              ← All Winners
            </Link>
            <Link
              href="/contests"
              className="px-5 py-3 rounded-full text-sm font-bold"
              style={{ background: `${winner.color}18`, border: `1px solid ${winner.color}40`, color: winner.color }}
            >
              Enter Next Contest
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
