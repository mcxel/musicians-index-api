import React from "react";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";

export default function DmcaPage() {
  return (
    <div style={{ background: "#050510", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <GlobalTmiHeader />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#FF2DAA", marginBottom: 16 }}>
          DMCA Copyright & Takedown Policy
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
          The Musicians Index (TMI) respects the intellectual property rights of artists, producers, and copyright holders. In accordance with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512, TMI will respond expeditiously to notices of alleged copyright infringement.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00FFFF", marginTop: 28, marginBottom: 10 }}>
          Submitting a Copyright Takedown Notice
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
          If you believe your copyrighted music, artwork, or content has been uploaded or performed without authorization on TMI, please submit a written notice containing the following details to our designated Copyright Agent:
        </p>
        <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, paddingLeft: 20 }}>
          <li>Physical or electronic signature of the copyright holder or authorized agent.</li>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Identification of the material to be removed (with URLs or room identifiers).</li>
          <li>Contact information including email address, mailing address, and phone number.</li>
          <li>A statement of good faith belief that the use is unauthorized.</li>
          <li>A statement under penalty of perjury that the information provided is accurate.</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00FFFF", marginTop: 28, marginBottom: 10 }}>
          Designated Copyright Agent
        </h2>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 16, fontSize: 12, lineHeight: 1.7 }}>
          <strong>TMI DMCA Compliance Officer</strong><br />
          BerntoutGlobal Media Inc.<br />
          Email: <a href="mailto:dmca@themusiciansindex.com" style={{ color: "#FFD700" }}>dmca@themusiciansindex.com</a><br />
          Direct Line: +1 (800) 555-TMI-MUSIC
        </div>
      </main>
    </div>
  );
}
