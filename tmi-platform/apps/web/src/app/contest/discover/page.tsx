"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = [
  { id: "all", label: "All", icon: "🏆" },
  { id: "singers", label: "Singers", icon: "🎤" },
  { id: "rappers", label: "Rappers", icon: "🎵" },
  { id: "comedians", label: "Comedians", icon: "😄" },
  { id: "dancers", label: "Dancers", icon: "💃" },
  { id: "djs", label: "DJs", icon: "🎧" },
  { id: "bands", label: "Bands", icon: "🎸" },
  { id: "beatmakers", label: "Beatmakers", icon: "🥁" },
  { id: "magicians", label: "Magicians", icon: "🪄" },
  { id: "influencers", label: "Influencers", icon: "📱" },
  { id: "freestyle", label: "Freestyle", icon: "🔥" },
];

const SEED_CONTESTANTS = [
  { id: "c1", stageName: "Crown Wavetek", category: "rappers", city: "Atlanta, GA", sponsors: 14, qualified: false, bio: "Southern trap meets melodic hooks." },
  { id: "c2", stageName: "Nova_K", category: "singers", city: "Los Angeles, CA", sponsors: 20, qualified: true, bio: "R&B with a futuristic edge." },
  { id: "c3", stageName: "DJ Phantom", category: "djs", city: "Chicago, IL", sponsors: 8, qualified: false, bio: "House and techno fusion sets." },
  { id: "c4", stageName: "The Laugh Factory", category: "comedians", city: "New York, NY", sponsors: 11, qualified: false, bio: "Stand-up and crowd work specialist." },
  { id: "c5", stageName: "Footwork Flo", category: "dancers", city: "Detroit, MI", sponsors: 20, qualified: true, bio: "Juke and footwork innovator." },
  { id: "c6", stageName: "BeatsByMarcus", category: "beatmakers", city: "Houston, TX", sponsors: 17, qualified: false, bio: "Trap 808 architecture meets jazz samples." },
  { id: "c7", stageName: "The Illusion", category: "magicians", city: "Las Vegas, NV", sponsors: 20, qualified: true, bio: "Grand illusion with a tech twist." },
  { id: "c8", stageName: "Verse Libre", category: "rappers", city: "New Orleans, LA", sponsors: 6, qualified: false, bio: "Conscious rap meets spoken word." },
  { id: "c9", stageName: "SkyBand", category: "bands", city: "Austin, TX", sponsors: 13, qualified: false, bio: "Indie rock meets neo-soul." },
  { id: "c10", stageName: "CreatorXO", category: "influencers", city: "Miami, FL", sponsors: 20, qualified: true, bio: "Platform-native creator. 2.1M followers." },
  { id: "c11", stageName: "Cipher King", category: "freestyle", city: "Philadelphia, PA", sponsors: 9, qualified: false, bio: "Unscripted bars, every time." },
  { id: "c12", stageName: "Aria Soleil", category: "singers", city: "Nashville, TN", sponsors: 20, qualified: true, bio: "Country meets contemporary soul." },
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams?.get("category") ?? "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [search, setSearch] = useState("");

  const filtered = SEED_CONTESTANTS
    .filter(c => activeCat === "all" || c.category === activeCat)
    .filter(c => !search || c.stageName.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()));

  const cat = CATEGORIES.find(c => c.id === activeCat);

  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/contest" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textDecoration: "none", display: "block", marginBottom: 28 }}>← CONTEST HOME</Link>
        <div style={{ fontSize: 9, color: "#ff6b1a", fontWeight: 800, letterSpacing: "0.3em", marginBottom: 8 }}>GRAND PLATFORM CONTEST</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Discover Contestants</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Browse all performers competing this season. Find someone to sponsor.</p>

        {/* Search + category filter */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city…" style={{ padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 220 }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, border: `1px solid ${activeCat === c.id ? "#ff6b1a" : "rgba(255,255,255,0.1)"}`, background: activeCat === c.id ? "rgba(255,107,26,0.12)" : "transparent", color: activeCat === c.id ? "#ff6b1a" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(c => {
            const progress = Math.min(100, (c.sponsors / 20) * 100);
            return (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${c.qualified ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: "18px 18px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 3 }}>{c.stageName}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{c.city}</div>
                  </div>
                  {c.qualified && <div style={{ padding: "3px 8px", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, fontSize: 8, fontWeight: 900, color: "#00FF88" }}>QUALIFIED</div>}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 14px", lineHeight: 1.5 }}>{c.bio}</p>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.1em" }}>SPONSOR PROGRESS</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#ff6b1a" }}>{c.sponsors}/20</div>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: c.qualified ? "#00FF88" : "#ff6b1a", borderRadius: 2 }} />
                  </div>
                </div>
                <Link href={`/contest/sponsors?contestant=${c.id}`} style={{ display: "block", textAlign: "center", padding: "9px", border: "1px solid rgba(255,107,26,0.4)", borderRadius: 8, color: "#ff6b1a", fontWeight: 800, fontSize: 10, textDecoration: "none", letterSpacing: "0.1em" }}>SPONSOR {c.stageName.split(" ")[0].toUpperCase()}</Link>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
              No contestants found for &ldquo;{search}&rdquo; in {cat?.label ?? activeCat}.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ContestDiscoverPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#070a0f" }} />}>
      <DiscoverContent />
    </Suspense>
  );
}
