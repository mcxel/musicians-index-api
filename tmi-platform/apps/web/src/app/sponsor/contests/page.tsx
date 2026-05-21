"use client";
import Link from "next/link";
import { SponsorContestPanel } from "@/components/sponsor/SponsorContestPanel";

export default function SponsorContestsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/sponsor" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Sponsor Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>SPONSORED CONTESTS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Contest Sponsorships</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>Back artists, track contest entries, and measure your sponsorship ROI.</p>
        <SponsorContestPanel
          sponsorId="demo-sponsor"
          sponsorName="Prime Wave Media"
          sponsoredEntries={[]}
          totalInvested={14500}
          totalReach={82000}
          onBrowseArtists={() => { window.location.href = "/artists"; }}
        />
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/contests" style={{ padding: "11px 22px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Browse All Contests →</Link>
          <Link href="/hub/sponsor" style={{ padding: "11px 22px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Back to Hub</Link>
        </div>
      </div>
    </main>
  );
}