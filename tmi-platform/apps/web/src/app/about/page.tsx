import React from "react";
import Link from "next/link";
import GlobalTmiHeader from "@/components/shell/GlobalTmiHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About The Musician's Index",
  description:
    "TMI is a live music magazine and performance platform for independent artists, fans, battles, cyphers, and ranked discovery.",
  alternates: { canonical: "https://themusiciansindex.com/about" },
};

export default function AboutPage() {
  return (
    <div style={{ background: "#050510", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <GlobalTmiHeader />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", marginBottom: 16 }}>
          About The Musician&apos;s Index (TMI)
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
          The Musician&apos;s Index Magazine is a live interactive music platform operated by BernoutGlobal LLC.
          Artists, performers, and fans connect through magazine features, live rooms, battles, cyphers, rankings,
          and discovery — on the open web at themusiciansindex.com.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#FF2DAA", marginTop: 28, marginBottom: 10 }}>
          What you can do here
        </h2>
        <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, paddingLeft: 20 }}>
          <li>
            <strong>Magazine &amp; discovery:</strong> Read features, interviews, and charts that link to real
            performer profiles and live surfaces.
          </li>
          <li>
            <strong>Live performance:</strong> Join or host live sessions, battles, and cyphers when rooms are
            active — live status comes from the platform live registry, not fabricated viewer counts.
          </li>
          <li>
            <strong>Creator economy:</strong> Tips, memberships, sponsorships, and bookings when you choose to
            participate — payments run through Stripe; we do not invent payout numbers on public pages.
          </li>
          <li>
            <strong>Audience presence:</strong> Fan avatars and lobby/venue experiences continue to expand; what
            ships is labeled honestly as live, in progress, or unavailable.
          </li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00FFFF", marginTop: 28, marginBottom: 10 }}>
          Advertising
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
          Free public surfaces may show Google AdSense and sponsor inventory after consent. See{" "}
          <Link href="/disclosures" style={{ color: "#00FFFF" }}>
            Disclosures
          </Link>{" "}
          and the{" "}
          <Link href="/privacy" style={{ color: "#00FFFF" }}>
            Privacy Policy
          </Link>
          .
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#FFD700", marginTop: 28, marginBottom: 10 }}>
          Contact
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
          BernoutGlobal LLC ·{" "}
          <Link href="/contact" style={{ color: "#00FFFF" }}>
            Contact
          </Link>{" "}
          ·{" "}
          <Link href="/support" style={{ color: "#00FFFF" }}>
            Support
          </Link>
        </p>
      </main>
    </div>
  );
}
