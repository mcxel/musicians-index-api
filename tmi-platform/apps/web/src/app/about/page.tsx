import React from "react";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";

export default function AboutPage() {
  return (
    <div style={{ background: "#050510", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <GlobalTmiHeader />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", marginBottom: 16 }}>
          About The Musicians Index (TMI)
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
          The Musicians Index (TMI) is the next-generation 3D live broadcast ecosystem connecting independent music performers, beat producers, and global fans.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#FF2DAA", marginTop: 28, marginBottom: 10 }}>
          Our Vision
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
          TMI breaks down the wall between performers and audiences by combining photorealistic 3D venues, interactive 3D avatars, real-time audio/video streaming, and direct fan monetization into one seamless platform OS.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00FFFF", marginTop: 28, marginBottom: 10 }}>
          Key Features
        </h2>
        <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, paddingLeft: 20 }}>
          <li><strong>3D Live Venues:</strong> Photorealistic performance stages with PBR materials and Global Illumination.</li>
          <li><strong>Star-Travel Ecosystem:</strong> Instant hyperspace room navigation and audience seat reservation.</li>
          <li><strong>Group Avatar Canisters:</strong> Seated social group calls directly beneath broadcast streams.</li>
          <li><strong>Direct Economy:</strong> Integrated Diamond tier tipping, beat licensing, and venue ticketing.</li>
        </ul>
      </main>
    </div>
  );
}
